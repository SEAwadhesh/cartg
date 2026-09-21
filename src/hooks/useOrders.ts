import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../utils/storage';
import { SupermarketOrder, OrderStatus, OrderItem } from '../types';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Maps a Supabase row (with optional joined order_items or JSONB items) to SupermarketOrder interface
 */
export function mapSupabaseRowToOrder(row: any): SupermarketOrder {
  let mappedItems: OrderItem[] = [];

  // 1. Check if joined relation 'order_items' is present from PostgreSQL foreign key
  if (row.order_items && Array.isArray(row.order_items) && row.order_items.length > 0) {
    mappedItems = row.order_items.map((it: any) => ({
      productId: String(it.product_id || it.productId || it.id || ''),
      title: String(it.product_name || it.title || it.name || 'Supermarket Item'),
      unit: String(it.unit || '1 Pack'),
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      image: String(it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80')
    }));
  } 
  // 2. Fallback to 'items' column (JSON or JSONB)
  else if (row.items) {
    let parsed: any[] = [];
    if (typeof row.items === 'string') {
      try {
        parsed = JSON.parse(row.items);
      } catch {
        parsed = [];
      }
    } else if (Array.isArray(row.items)) {
      parsed = row.items;
    }

    mappedItems = parsed.map((it: any) => ({
      productId: String(it.productId || it.product_id || it.id || ''),
      title: String(it.title || it.product_name || it.name || 'Supermarket Item'),
      unit: String(it.unit || '1 Pack'),
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      image: String(it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80')
    }));
  }

  const rawCreatedAt = row.created_at || row.createdAt;
  let formattedCreatedAt = new Date().toISOString();
  if (rawCreatedAt) {
    formattedCreatedAt = typeof rawCreatedAt === 'string' ? rawCreatedAt : new Date(rawCreatedAt).toISOString();
  }

  const subtotal = Number(row.subtotal ?? row.total_amount ?? row.totalAmount ?? 0);
  const deliveryFee = Number(row.delivery_fee ?? row.deliveryFee ?? 0);
  const discountAmount = Number(row.discount_amount ?? row.discountAmount ?? 0);
  const totalAmount = Number(row.total_amount ?? row.totalAmount ?? (subtotal + deliveryFee - discountAmount));

  return {
    id: String(row.id || `ord-${Date.now()}`),
    orderNumber: String(
      row.order_number ||
      row.orderNumber ||
      row.order_no ||
      (row.id ? `CG-${String(row.id).slice(0, 6).toUpperCase()}` : `CG-${Math.floor(100000 + Math.random() * 900000)}`)
    ),
    customerName: String(row.customer_name || row.customerName || row.name || 'Valued Customer'),
    phone: String(row.phone || row.mobile || row.contact || ''),
    email: String(row.email || ''),
    deliveryAddress: String(row.delivery_address || row.deliveryAddress || row.address || 'Store Pickup'),
    deliveryType: (row.delivery_type || row.deliveryType || 'delivery') as any,
    preferredSlot: String(row.preferred_slot || row.preferredSlot || 'Express 45-Mins (Immediate Dispatch)'),
    paymentMethod: (row.payment_method || row.paymentMethod || 'cod') as any,
    items: mappedItems,
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    deliveryFee: isNaN(deliveryFee) ? 0 : deliveryFee,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
    status: (row.status || 'pending') as OrderStatus,
    notes: row.notes || row.customer_notes || undefined,
    internalNotes: row.internal_notes || row.internalNotes || undefined,
    createdAt: formattedCreatedAt,
    message: row.message || undefined,
    serviceName: row.service_name || row.serviceName || undefined
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<SupermarketOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // Fetch orders directly from Supabase database (source of truth)
  const fetchOrders = useCallback(async (showLoadingSpinner: boolean = false): Promise<SupermarketOrder[]> => {
    if (showLoadingSpinner && isMountedRef.current) {
      setIsLoading(true);
    }
    const supabase = getSupabaseClient();

    if (!supabase) {
      if (isMountedRef.current) {
        setIsLoading(false);
        setError('Supabase credentials not configured in environment.');
      }
      return [];
    }

    try {
      // 1. Try relational query with joined order_items table
      let { data, error: sbError } = await (supabase.from('orders') as any)
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false, nullsFirst: false });

      // 2. If relational join fails (e.g. order_items table not created yet or FK relationship missing), fallback to select(*)
      if (sbError && (sbError.message?.includes('order_items') || sbError.code === 'PGRST200')) {
        const fallbackRes = await (supabase.from('orders') as any)
          .select('*')
          .order('created_at', { ascending: false, nullsFirst: false });
        data = fallbackRes.data;
        sbError = fallbackRes.error;
      }

      // Check if table missing in schema cache
      if (sbError) {
        const isTableMissing =
          sbError.code === 'PGRST205' ||
          sbError.code === '42P01' ||
          sbError.message?.includes('schema cache') ||
          sbError.message?.includes('Could not find the table') ||
          sbError.message?.includes('does not exist');

        if (isTableMissing) {
          console.info('Supabase "orders" table is pending creation in SQL Editor. Using local store as temporary bridge.');
          const savedBackup = localStorage.getItem('supermarket_orders_backup') || localStorage.getItem('supermarket_orders');
          const fallbackOrders: SupermarketOrder[] = savedBackup ? JSON.parse(savedBackup) : [];
          if (isMountedRef.current) {
            setError('PGRST205: Supabase "orders" table not found in database. Run the SQL migration in Supabase SQL Editor to enable full multi-device sync.');
            setIsLoading(false);
            setOrders(fallbackOrders);
          }
          return fallbackOrders;
        }

        console.warn('Supabase orders query error:', sbError);
        if (isMountedRef.current) {
          setError(sbError.message || 'Failed to load orders from Supabase.');
          setIsLoading(false);
        }
        return [];
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map(mapSupabaseRowToOrder);
        // Ensure strictly sorted by createdAt descending
        mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        if (isMountedRef.current) {
          setOrders(mapped);
          setError(null);
          setIsLoading(false);
        }
        return mapped;
      }
    } catch (err: any) {
      console.warn('Exception while fetching orders from Supabase:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'Error communicating with Supabase database.');
        setIsLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
    return [];
  }, []);

  // Real-time subscription and initial load
  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders(true);

    const supabase = getSupabaseClient();
    let channel: any = null;

    if (supabase) {
      try {
        const channelName = `orders-live-channel-${Date.now()}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload: any) => {
              if (!isMountedRef.current) return;

              if (payload.eventType === 'INSERT' && payload.new) {
                const newOrd = mapSupabaseRowToOrder(payload.new);
                setOrders((prev) => {
                  if (prev.some((o) => o.id === newOrd.id)) {
                    return prev.map((o) => (o.id === newOrd.id ? newOrd : o));
                  }
                  return [newOrd, ...prev];
                });
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedOrd = mapSupabaseRowToOrder(payload.new);
                setOrders((prev) =>
                  prev.map((o) => (o.id === updatedOrd.id ? updatedOrd : o))
                );
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const deletedId = String(payload.old.id);
                setOrders((prev) => prev.filter((o) => o.id !== deletedId));
              } else {
                fetchOrders(false);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'order_items' },
            () => {
              if (isMountedRef.current) {
                fetchOrders(false);
              }
            }
          )
          .subscribe((status: string) => {
            if (isMountedRef.current) {
              setIsRealtimeConnected(status === 'SUBSCRIBED');
            }
          });
      } catch (err) {
        console.warn('Could not establish Supabase realtime subscription:', err);
      }
    }

    // Auto sync on focus / visibility
    const handleFocus = () => fetchOrders(false);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // Periodic sync every 20 seconds
    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 20000);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(intervalId);
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [fetchOrders]);

  // Update order fulfillment status in Supabase
  const updateOrderStatus = useCallback(async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized.' };
    }

    try {
      const nowIso = new Date().toISOString();
      const { error: updateErr } = await (supabase.from('orders') as any)
        .update({ 
          status: newStatus,
          updated_at: nowIso 
        })
        .eq('id', orderId);

      if (updateErr) {
        console.warn('Failed to update order status in Supabase:', updateErr);
        return { success: false, error: updateErr.message };
      }

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      return { success: true };
    } catch (err: any) {
      console.error('Exception updating order status in Supabase:', err);
      return { success: false, error: err?.message };
    }
  }, []);

  // Update internal notes in Supabase
  const updateOrderNotes = useCallback(async (
    orderId: string,
    internalNotes: string
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized.' };
    }

    try {
      const nowIso = new Date().toISOString();
      const { error: notesErr } = await (supabase.from('orders') as any)
        .update({ 
          internal_notes: internalNotes,
          updated_at: nowIso
        })
        .eq('id', orderId);

      if (notesErr) {
        console.warn('Failed to update internal notes in Supabase:', notesErr);
        return { success: false, error: notesErr.message };
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, internalNotes } : o))
      );
      return { success: true };
    } catch (err: any) {
      console.error('Exception updating internal notes in Supabase:', err);
      return { success: false, error: err?.message };
    }
  }, []);

  // Delete an order in Supabase (cascades to order_items)
  const deleteOrder = useCallback(async (
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized.' };
    }

    try {
      const { error: delErr } = await (supabase.from('orders') as any)
        .delete()
        .eq('id', orderId);

      if (delErr) {
        console.warn('Failed to delete order from Supabase:', delErr);
        return { success: false, error: delErr.message };
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      return { success: true };
    } catch (err: any) {
      console.error('Exception deleting order from Supabase:', err);
      return { success: false, error: err?.message };
    }
  }, []);

  // Create a new order: inserts into Supabase 'orders' and 'order_items' tables
  const createOrder = useCallback(async (
    orderData: Omit<SupermarketOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; order?: SupermarketOrder; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { 
        success: false, 
        error: 'Database connection is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.' 
      };
    }

    const uniqueId = generateUUID();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const nowIso = new Date().toISOString();

    const newOrder: SupermarketOrder = {
      ...orderData,
      id: uniqueId,
      orderNumber: `CG-${randomCode}`,
      status: 'pending',
      createdAt: nowIso
    };

    try {
      // 1. Insert into 'orders' table
      const orderPayload = {
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        customer_name: newOrder.customerName,
        phone: newOrder.phone,
        email: newOrder.email || '',
        delivery_address: newOrder.deliveryAddress,
        delivery_type: newOrder.deliveryType || 'delivery',
        preferred_slot: newOrder.preferredSlot || 'Express 45-Mins (Immediate Dispatch)',
        payment_method: newOrder.paymentMethod || 'cod',
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        delivery_fee: newOrder.deliveryFee,
        discount_amount: newOrder.discountAmount,
        total_amount: newOrder.totalAmount,
        status: newOrder.status,
        notes: newOrder.notes || '',
        internal_notes: newOrder.internalNotes || '',
        created_at: newOrder.createdAt,
        updated_at: newOrder.createdAt
      };

      const { error: orderInsertErr } = await (supabase.from('orders') as any)
        .insert([orderPayload]);

      if (orderInsertErr) {
        const isTableMissing =
          orderInsertErr.code === 'PGRST205' ||
          orderInsertErr.code === '42P01' ||
          orderInsertErr.message?.includes('schema cache') ||
          orderInsertErr.message?.includes('Could not find the table') ||
          orderInsertErr.message?.includes('relation "orders" does not exist') ||
          orderInsertErr.message?.includes('relation "public.orders" does not exist');

        if (isTableMissing) {
          console.info('Supabase "orders" table is pending creation in SQL Editor. Order stored in local resilience cache.');
          const existingBackup = localStorage.getItem('supermarket_orders_backup') || localStorage.getItem('supermarket_orders');
          const backupList: SupermarketOrder[] = existingBackup ? JSON.parse(existingBackup) : [];
          const updatedBackup = [newOrder, ...backupList.filter(o => o.id !== newOrder.id)];
          localStorage.setItem('supermarket_orders_backup', JSON.stringify(updatedBackup));
          localStorage.setItem('supermarket_orders', JSON.stringify(updatedBackup));

          setOrders((prev) => [newOrder, ...prev]);
          return {
            success: true,
            order: newOrder
          };
        }

        console.warn('Supabase orders table insert note:', orderInsertErr);
        return {
          success: false,
          error: orderInsertErr.message || 'Database error: Could not save order to Supabase.'
        };
      }

      // 2. Insert line items into 'order_items' table if items exist
      if (newOrder.items && newOrder.items.length > 0) {
        const itemsPayload = newOrder.items.map((item) => ({
          id: generateUUID(),
          order_id: newOrder.id,
          product_id: item.productId || '',
          product_name: item.title,
          unit: item.unit || '',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          subtotal: Number((item.price || 0) * (item.quantity || 1)),
          image: item.image || '',
          created_at: nowIso
        }));

        const { error: itemsInsertErr } = await (supabase.from('order_items') as any)
          .insert(itemsPayload);

        if (itemsInsertErr) {
          console.warn('Note on order_items insertion (items preserved in orders JSONB):', itemsInsertErr);
          // If order_items table is missing, the items are still safely stored in orders.items JSONB column
        }
      }

      // Prepend to local state
      setOrders((prev) => [newOrder, ...prev]);

      return {
        success: true,
        order: newOrder
      };
    } catch (err: any) {
      console.error('Exception during Supabase order insertion:', err);
      return {
        success: false,
        error: err?.message || 'Unexpected error communicating with database.'
      };
    }
  }, []);

  return {
    orders,
    isLoading,
    isOrdersLoading: isLoading,
    error,
    ordersLoadError: error,
    isRealtimeConnected,
    fetchOrders,
    refreshOrders: () => fetchOrders(true),
    updateOrderStatus,
    updateOrderNotes,
    deleteOrder,
    createOrder
  };
}
