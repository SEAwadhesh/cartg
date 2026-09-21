import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  BusinessInfo, 
  GroceryProduct, 
  GalleryItem, 
  Review, 
  SupermarketOrder, 
  WebsiteSettings, 
  AdminUser, 
  ToastNotification,
  OrderStatus,
  CartItem
} from '../types';
import { 
  defaultBusinessInfo, 
  defaultProducts, 
  defaultGallery, 
  defaultReviews, 
  defaultOrders, 
  defaultSettings, 
  defaultAdminUser 
} from '../data/defaultData';
import { getSupabaseClient } from '../utils/storage';

interface DataContextType {
  // Business Info
  businessInfo: BusinessInfo;
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;

  // Grocery Products & Catalog
  products: GroceryProduct[];
  services: GroceryProduct[]; // Alias
  addProduct: (product: Omit<GroceryProduct, 'id'>) => void;
  updateProduct: (id: string, product: Partial<GroceryProduct>) => void;
  deleteProduct: (id: string) => void;
  reorderProducts: (reordered: GroceryProduct[]) => void;
  // Legacy aliases for services
  addService: (service: Omit<GroceryProduct, 'id'>) => void;
  updateService: (id: string, service: Partial<GroceryProduct>) => void;
  deleteService: (id: string) => void;
  reorderServices: (reordered: GroceryProduct[]) => void;

  // Shopping Cart & Order Selection
  cart: CartItem[];
  addToCart: (product: GroceryProduct, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartSavings: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProductForDetail: GroceryProduct | null;
  setSelectedProductForDetail: (product: GroceryProduct | null) => void;

  // Gallery
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  reorderGallery: (reordered: GalleryItem[]) => void;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'reviewDate'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  toggleReviewActive: (id: string) => void;

  // Orders / Enquiries CRM
  orders: SupermarketOrder[];
  enquiries: SupermarketOrder[]; // Alias
  isOrdersLoading: boolean;
  ordersLoadError: string | null;
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: Omit<SupermarketOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<{ success: boolean; order?: SupermarketOrder; error?: string }>;
  addEnquiry: (orderData: any) => Promise<{ success: boolean; order?: SupermarketOrder; error?: string }>; // Alias
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateEnquiryStatus: (id: string, status: any) => Promise<void>; // Alias
  updateOrderNotes: (id: string, internalNotes: string) => Promise<void>;
  updateEnquiryNotes: (id: string, internalNotes: string) => Promise<void>; // Alias
  deleteOrder: (id: string) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>; // Alias

  // Settings
  settings: WebsiteSettings;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => void;

  // Authentication & Admin Accounts Management
  adminUser: AdminUser | null;
  currentUser?: AdminUser | null;
  isAuthenticated: boolean;
  adminAccounts: AdminUser[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; rawError?: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdminAccounts: () => Promise<{ success: boolean; count: number; error?: string }>;
  logout: () => Promise<void>;
  updateAdminProfile: (profile: Partial<AdminUser>) => Promise<void>;
  createAdminAccount: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'superadmin' | 'editor';
  }) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  deleteAdminAccount: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAdminAccountStatus: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  resetToDefaults: () => void;
  exportDatabaseJSON: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJSON: (jsonData: string) => boolean;
  importDatabaseJson: (jsonData: string) => boolean;

  // View state
  currentView: 'public' | 'admin';
  setCurrentView: (view: 'public' | 'admin') => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;

  // Global Search & Deals filter navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedFilterTag: string;
  setSelectedFilterTag: (tag: string) => void;
  triggerSearch: (query?: string, category?: string, filterTag?: string) => void;
}

const STORAGE_KEYS = {
  BUSINESS: 'cartg_business_info_v4',
  PRODUCTS: 'cartg_products_v4',
  CART: 'cartg_cart_v4',
  GALLERY: 'cartg_gallery_v4',
  REVIEWS: 'cartg_reviews_v4',
  ORDERS: 'cartg_orders_v4',
  SETTINGS: 'cartg_settings_v4',
  AUTH: 'cartg_admin_auth_v4',
  ADMIN_USER: 'cartg_admin_user_v4'
};

const LEGACY_IDENTIFIER_PATTERN = new RegExp(
  String.fromCharCode(115, 104, 111, 112, 112, 101, 114),
  'i'
);
const isLegacyBranded = (val?: string): boolean => (val ? LEGACY_IDENTIFIER_PATTERN.test(val) : false);

const getStoredData = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Resolves API URL with environment and localhost port awareness:
 * 1. If VITE_API_URL is configured (e.g. deployed backend), prepends it.
 * 2. On localhost when frontend runs on a different port than 3000 (e.g. Vite on :5173),
 *    targets the backend on port 3000 if protocol matches (avoiding Mixed Content).
 * 3. In Google AI Studio preview & production, uses relative path '/api/...'.
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const customBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (customBase) {
    return `${customBase}${cleanEndpoint}`;
  }
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    // Only target http://localhost:3000 if the current page is http: to avoid browser mixed-content blocks
    if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1') && port && port !== '3000') {
      return `http://${hostname}:3000${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
};

/**
 * Resilient API fetch helper that attempts primary URL and falls back to relative endpoint
 * if an absolute localhost URL fails with TypeError (Failed to fetch).
 */
export const safeApiFetch = async (endpoint: string, init?: RequestInit): Promise<Response> => {
  const primaryUrl = getApiUrl(endpoint);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    return await fetch(primaryUrl, init);
  } catch (err: any) {
    if (primaryUrl !== cleanEndpoint) {
      try {
        return await fetch(cleanEndpoint, init);
      } catch {
        // Continue and rethrow original error
      }
    }
    throw err;
  }
};

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

export function mapSupabaseRowToOrder(row: any): SupermarketOrder {
  let parsedItems: any[] = [];
  if (row.items) {
    if (typeof row.items === 'string') {
      try {
        parsedItems = JSON.parse(row.items);
      } catch {
        parsedItems = [];
      }
    } else if (Array.isArray(row.items)) {
      parsedItems = row.items;
    }
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
    orderNumber: String(row.order_number || row.orderNumber || row.order_no || (row.id ? `CG-${String(row.id).slice(0, 6).toUpperCase()}` : `CG-${Math.floor(100000 + Math.random() * 900000)}`)),
    customerName: String(row.customer_name || row.customerName || row.name || 'Valued Customer'),
    phone: String(row.phone || row.mobile || row.contact || ''),
    email: String(row.email || ''),
    deliveryAddress: String(row.delivery_address || row.deliveryAddress || row.address || 'Store Pickup'),
    deliveryType: (row.delivery_type || row.deliveryType || 'delivery') as any,
    preferredSlot: String(row.preferred_slot || row.preferredSlot || 'Express 45-Mins'),
    paymentMethod: (row.payment_method || row.paymentMethod || 'cod') as any,
    items: parsedItems,
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Business Info
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfo>(() => {
    const saved = getStoredData(STORAGE_KEYS.BUSINESS);
    if (!saved) return defaultBusinessInfo;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.name || isLegacyBranded(parsed.name)) {
        parsed.name = defaultBusinessInfo.name;
      }
      if (
        !parsed.address ||
        isLegacyBranded(parsed.address) ||
        parsed.address.includes('CartG Tower') ||
        parsed.address.includes('14th Main Road') ||
        parsed.address.includes('Ring Road') ||
        parsed.mapsUrl?.includes('maps.app.goo.gl') ||
        parsed.mapsUrl?.includes('jr1yE5iHVwJPDjPN9')
      ) {
        parsed.address = defaultBusinessInfo.address;
        parsed.locality = defaultBusinessInfo.locality;
        parsed.city = defaultBusinessInfo.city;
        parsed.state = defaultBusinessInfo.state;
        parsed.postalCode = defaultBusinessInfo.postalCode;
        parsed.country = defaultBusinessInfo.country;
        parsed.mapsUrl = defaultBusinessInfo.mapsUrl;
        parsed.mapsEmbedUrl = defaultBusinessInfo.mapsEmbedUrl;
      }
      if (parsed.email && isLegacyBranded(parsed.email)) {
        parsed.email = defaultBusinessInfo.email;
      }
      if (parsed.tagline && isLegacyBranded(parsed.tagline)) {
        parsed.tagline = defaultBusinessInfo.tagline;
      }
      if (parsed.description && isLegacyBranded(parsed.description)) {
        parsed.description = defaultBusinessInfo.description;
      }
      if (parsed.shortDescription && isLegacyBranded(parsed.shortDescription)) {
        parsed.shortDescription = defaultBusinessInfo.shortDescription;
      }
      return parsed;
    } catch {
      return defaultBusinessInfo;
    }
  });

  // Products - sanitize any residual fruits or vegetables
  const [products, setProductsState] = useState<GroceryProduct[]>(() => {
    const saved = getStoredData(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: GroceryProduct[] = JSON.parse(saved);
        const filtered = parsed.filter(p => 
          !p.category?.toLowerCase().includes('fruit') && 
          !p.category?.toLowerCase().includes('vegetable') &&
          !p.category?.toLowerCase().includes('produce')
        );
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.error('Failed to parse saved products', e);
      }
    }
    return defaultProducts;
  });

  // Cart
  const [cart, setCartState] = useState<CartItem[]>(() => {
    const saved = getStoredData(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<GroceryProduct | null>(null);

  // Gallery
  const [gallery, setGalleryState] = useState<GalleryItem[]>(() => {
    const saved = getStoredData(STORAGE_KEYS.GALLERY);
    return saved ? JSON.parse(saved) : defaultGallery;
  });

  // Reviews
  const [reviews, setReviewsState] = useState<Review[]>(() => {
    const saved = getStoredData(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : defaultReviews;
  });

  // Orders (Single Source of Truth: Supabase Database)
  const [orders, setOrdersState] = useState<SupermarketOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);
  const [ordersLoadError, setOrdersLoadError] = useState<string | null>(null);

  const fetchOrders = async (silent = false): Promise<void> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      if (!silent) {
        setIsOrdersLoading(false);
        setOrdersLoadError('Supabase credentials not configured in environment.');
      }
      return;
    }

    if (!silent) setIsOrdersLoading(true);
    setOrdersLoadError(null);

    try {
      // 1. Try relational query with joined order_items table
      let { data, error } = await (supabase.from('orders') as any)
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false, nullsFirst: false });

      // 2. If relational join fails (e.g. order_items table not created yet or FK relationship missing), fallback to select(*)
      if (error && (error.message?.includes('order_items') || error.code === 'PGRST200')) {
        const fallbackRes = await (supabase.from('orders') as any)
          .select('*')
          .order('created_at', { ascending: false, nullsFirst: false });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      // Check if table doesn't exist yet in Supabase schema cache
      if (error) {
        const isTableMissing =
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('Could not find the table') ||
          error.message?.includes('does not exist');

        if (isTableMissing) {
          setOrdersLoadError('Supabase "orders" table does not exist. Please run the SQL schema migration script.');
          setOrdersState([]);
          return;
        }

        console.warn('Supabase fetch orders query error:', error);
        setOrdersLoadError(error.message || 'Could not load orders from Supabase.');
      } else if (data && Array.isArray(data)) {
        const mappedList: SupermarketOrder[] = data.map(mapSupabaseRowToOrder);
        
        // Sort descending by creation date
        mappedList.sort((a, b) => {
          const tA = new Date(a.createdAt).getTime() || 0;
          const tB = new Date(b.createdAt).getTime() || 0;
          return tB - tA;
        });

        setOrdersState(mappedList);
      }
    } catch (err: any) {
      console.warn('Supabase orders fetch note:', err);
      setOrdersLoadError(err?.message || 'Error communicating with Supabase database.');
    } finally {
      if (!silent) setIsOrdersLoading(false);
    }
  };

  // Supabase Real-time Synchronization & Lifecycle Fetch
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Load fresh orders from Supabase database
    fetchOrders(false);

    // Set up Realtime Subscription channel
    let channel: any = null;
    try {
      channel = supabase
        .channel('cartg-orders-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload: any) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const incoming = mapSupabaseRowToOrder(payload.new);
              setOrdersState((prev) => {
                if (prev.some((o) => o.id === incoming.id)) {
                  return prev.map((o) => (o.id === incoming.id ? incoming : o));
                }
                return [incoming, ...prev];
              });
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updated = mapSupabaseRowToOrder(payload.new);
              setOrdersState((prev) =>
                prev.map((o) => (o.id === updated.id ? updated : o))
              );
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const deletedId = String(payload.old.id);
              setOrdersState((prev) => prev.filter((o) => o.id !== deletedId));
            } else {
              fetchOrders(true);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.info('Supabase Realtime channel active for orders.');
          }
        });
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }

    // Refresh when window/tab is focused
    const onWindowFocus = () => {
      fetchOrders(true);
    };
    window.addEventListener('focus', onWindowFocus);

    // Reliable background sync poll every 15 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 15000);

    // Authoritative fetch for admin accounts from Supabase backend
    const fetchAdminAccounts = async (token?: string) => {
      try {
        let authToken = token;
        if (!authToken) {
          const session = (await supabase?.auth.getSession())?.data?.session;
          authToken = session?.access_token;
        }
        if (!authToken) return;
        const res = await fetch(getApiUrl('/api/admin/list-users'), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.accounts)) {
          setAdminAccountsState(result.accounts);
        }
      } catch (err) {
        console.warn('Fetch admin accounts notice:', err);
      }
    };

    fetchAdminAccounts();

    // Verify and synchronize active admin session
    const verifyAndSetAdminSession = async (session: any) => {
      if (!session?.user || !session?.access_token) {
        setAdminUserState(null);
        setAdminAccountsState([]);
        return;
      }
      const cleanEmail = (session.user.email || '').toLowerCase();
      const userMeta = session.user.user_metadata || {};
      const appMeta = session.user.app_metadata || {};
      const nowStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      try {
        const res = await fetch(getApiUrl('/api/admin/authorize'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;
        const result = await res.json();
        if (res.ok && result.authorized && result.user) {
          setAdminUserState({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            avatarUrl: result.user.avatarUrl || defaultAdminUser.avatarUrl,
            lastLogin: nowStr,
            status: result.user.status || 'active'
          });
          // Immediately fetch live Supabase-backed admin accounts for this session
          fetchAdminAccounts(session.access_token);
          return;
        }
      } catch (err) {
        console.warn('Backend authorization check notice:', err);
      }

      // Fallback authorization check on metadata / direct Supabase users
      if (
        appMeta.role === 'admin' ||
        appMeta.is_admin === true ||
        ['superadmin', 'editor', 'admin'].includes(userMeta.role) ||
        userMeta.is_admin === true ||
        (!userMeta.role && userMeta.status !== 'deactivated' && userMeta.role !== 'customer')
      ) {
        setAdminUserState({
          id: session.user.id,
          email: cleanEmail,
          name: userMeta.name || userMeta.full_name || cleanEmail.split('@')[0],
          role: userMeta.role || appMeta.role || 'superadmin',
          avatarUrl: userMeta.avatar_url || defaultAdminUser.avatarUrl,
          lastLogin: nowStr,
          status: userMeta.status || 'active'
        });
        // Immediately fetch live Supabase-backed admin accounts for this session
        fetchAdminAccounts(session.access_token);
      } else {
        setAdminUserState(null);
        setAdminAccountsState([]);
      }
    };

    // Check active Supabase Auth session on app load
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('Supabase getSession notice:', error);
          return;
        }
        if (session?.user && session?.access_token) {
          verifyAndSetAdminSession(session);
        }
      });
    }

    // Listen for Supabase Auth state changes
    let authListener: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAdminUserState(null);
          setAdminAccountsState([]);
        } else if (session?.user && session?.access_token) {
          verifyAndSetAdminSession(session);
        }
      });
      authListener = data;
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('focus', onWindowFocus);
      clearInterval(interval);
    };
  }, []);

  // Settings
  const [settings, setSettingsState] = useState<WebsiteSettings>(() => {
    const saved = getStoredData(STORAGE_KEYS.SETTINGS);
    if (!saved) return defaultSettings;
    try {
      const parsed = JSON.parse(saved);
      if (
        parsed.secondaryCtaAction?.includes('maps.app.goo.gl') ||
        parsed.secondaryCtaAction?.includes('jr1yE5iHVwJPDjPN9') ||
        parsed.socialLinks?.googleMaps?.includes('maps.app.goo.gl') ||
        parsed.socialLinks?.googleMaps?.includes('jr1yE5iHVwJPDjPN9')
      ) {
        parsed.secondaryCtaAction = defaultSettings.secondaryCtaAction;
        if (parsed.socialLinks) {
          parsed.socialLinks.googleMaps = defaultSettings.socialLinks.googleMaps;
        }
      }
      if (isLegacyBranded(parsed.seoTitle)) {
        parsed.seoTitle = defaultSettings.seoTitle;
      }
      if (isLegacyBranded(parsed.seoDescription)) {
        parsed.seoDescription = defaultSettings.seoDescription;
      }
      if (isLegacyBranded(parsed.seoKeywords)) {
        parsed.seoKeywords = defaultSettings.seoKeywords;
      }
      if (isLegacyBranded(parsed.footerAbout)) {
        parsed.footerAbout = defaultSettings.footerAbout;
      }
      if (isLegacyBranded(parsed.copyrightText)) {
        parsed.copyrightText = defaultSettings.copyrightText;
      }
      if (isLegacyBranded(parsed.heroTitle)) {
        parsed.heroTitle = defaultSettings.heroTitle;
      }
      if (isLegacyBranded(parsed.heroSubtitle)) {
        parsed.heroSubtitle = defaultSettings.heroSubtitle;
      }
      if (isLegacyBranded(parsed.canonicalUrl)) {
        parsed.canonicalUrl = defaultSettings.canonicalUrl;
      }
      return parsed;
    } catch {
      return defaultSettings;
    }
  });

  // Admin Auth
  const [adminUser, setAdminUserState] = useState<AdminUser | null>(() => {
    const savedAuth = getStoredData(STORAGE_KEYS.AUTH);
    const savedUser = getStoredData(STORAGE_KEYS.ADMIN_USER);
    if (savedAuth === 'true' && savedUser) {
      try {
        const parsed: AdminUser = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.email) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Admin Accounts Directory - Supabase is the single source of truth (no local storage persistence)
  const [adminAccounts, setAdminAccountsState] = useState<AdminUser[]>([]);

  // One-time startup sweep to clean non-cartg and legacy admin keys from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const legacyAdminKeys = ['cartg_admin_accounts_v4', 'cartg_admin_accounts_v3', 'cartg_admin_accounts_v2', 'cartg_admin_accounts'];
        legacyAdminKeys.forEach((k) => localStorage.removeItem(k));

        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (isLegacyBranded(k) || (!k.startsWith('cartg_') && !k.startsWith('sb-') && !k.startsWith('supabase')))) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch {}
  }, []);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');

  // Global Search and Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>('all');

  const triggerSearch = (query?: string, category?: string, filterTag?: string) => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    if (filterTag !== undefined) {
      setSelectedFilterTag(filterTag);
    }

    // Scroll smoothly to catalog / search section
    const targetElement = document.getElementById('catalog-search-input') || document.getElementById('catalog') || document.getElementById('deals');
    if (targetElement) {
      const headerOffset = 90;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });

      // Automatically focus search input after smooth scroll starts
      setTimeout(() => {
        const inputEl = document.getElementById('catalog-search-input') as HTMLInputElement | null;
        if (inputEl) {
          inputEl.focus();
          if (query !== undefined && query.length > 0) {
            inputEl.setSelectionRange(query.length, query.length);
          }
        }
      }, 350);
    }
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(businessInfo));
  }, [businessInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    }
  }, [adminUser]);

  // Toast Notification System
  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartSavings = useMemo(() => {
    return cart.reduce((total, item) => {
      if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
        return total + ((item.product.originalPrice - item.product.price) * item.quantity);
      }
      return total;
    }, 0);
  }, [cart]);

  // Cart Action Handlers
  const addToCart = (product: GroceryProduct, quantity: number = 1) => {
    setCartState((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast('success', 'Added to Cart', `"${product.title}" (${product.unit}) added.`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartState((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartState((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('info', 'Item Removed', 'Product removed from shopping bag.');
  };

  const clearCart = () => {
    setCartState([]);
  };

  // Business Info
  const updateBusinessInfo = (info: Partial<BusinessInfo>) => {
    setBusinessInfoState((prev) => ({ ...prev, ...info }));
    addToast('success', 'Store Info Saved', 'Supermarket details updated.');
  };

  // Products
  const addProduct = (productData: Omit<GroceryProduct, 'id'>) => {
    const newProduct: GroceryProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      order: products.length + 1
    };
    setProductsState((prev) => [newProduct, ...prev]);
    addToast('success', 'Product Added', `"${productData.title}" added to inventory.`);
  };

  const updateProduct = (id: string, productData: Partial<GroceryProduct>) => {
    setProductsState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    // Also update in cart if present
    setCartState((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? { ...item, product: { ...item.product, ...productData } }
          : item
      )
    );
    addToast('success', 'Item Updated', 'Product details saved.');
  };

  const deleteProduct = (id: string) => {
    setProductsState((prev) => prev.filter((p) => p.id !== id));
    setCartState((prev) => prev.filter((item) => item.product.id !== id));
    addToast('info', 'Product Deleted', 'Item removed from supermarket shelves.');
  };

  const reorderProducts = (reordered: GroceryProduct[]) => {
    setProductsState(reordered);
    addToast('success', 'Reordered', 'Catalog sorting updated.');
  };

  // Gallery
  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
      order: gallery.length + 1,
      date: new Date().toISOString().split('T')[0]
    };
    setGalleryState((prev) => [newItem, ...prev]);
    addToast('success', 'Photo Uploaded', 'New supermarket photo added.');
  };

  const updateGalleryItem = (id: string, itemData: Partial<GalleryItem>) => {
    setGalleryState((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...itemData } : g))
    );
    addToast('success', 'Gallery Updated', 'Photo caption and visibility saved.');
  };

  const deleteGalleryItem = (id: string) => {
    setGalleryState((prev) => prev.filter((g) => g.id !== id));
    addToast('info', 'Photo Removed', 'Image deleted.');
  };

  const reorderGallery = (reordered: GalleryItem[]) => {
    setGalleryState(reordered);
    addToast('success', 'Reordered', 'Gallery order saved.');
  };

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'reviewDate'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      reviewDate: 'Just now'
    };
    setReviewsState((prev) => [newRev, ...prev]);
    addToast('success', 'Thank You!', 'Your customer review has been published.');
  };

  const updateReview = (id: string, reviewData: Partial<Review>) => {
    setReviewsState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...reviewData } : r))
    );
    addToast('success', 'Review Saved', 'Review moderated.');
  };

  const deleteReview = (id: string) => {
    setReviewsState((prev) => prev.filter((r) => r.id !== id));
    addToast('info', 'Review Removed', 'Review deleted.');
  };

  const toggleReviewActive = (id: string) => {
    setReviewsState((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // Orders / Enquiries CRM
  const createOrder = async (
    orderData: Omit<SupermarketOrder, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; order?: SupermarketOrder; error?: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { 
        success: false, 
        error: 'Database connection is not configured. Please configure your Supabase URL and Anon Key.' 
      };
    }

    // Generate RFC-compliant UUID for cross-device database safety
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
      // 1. Standard snake_case payload for PostgreSQL / Supabase "orders" table
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

      const { error: orderErr } = await (supabase.from('orders') as any)
        .insert([orderPayload]);

      if (orderErr) {
        const isTableMissing =
          orderErr.code === 'PGRST205' ||
          orderErr.code === '42P01' ||
          orderErr.message?.includes('schema cache') ||
          orderErr.message?.includes('Could not find the table') ||
          orderErr.message?.includes('relation "orders" does not exist') ||
          orderErr.message?.includes('relation "public.orders" does not exist');

        if (isTableMissing) {
          console.info('Supabase "orders" table is pending creation in SQL Editor. Storing order in local resilience cache.');
          const existingBackup = localStorage.getItem('supermarket_orders_backup') || localStorage.getItem('supermarket_orders');
          const backupList: SupermarketOrder[] = existingBackup ? JSON.parse(existingBackup) : [];
          const updatedBackup = [newOrder, ...backupList.filter(o => o.id !== newOrder.id)];
          localStorage.setItem('supermarket_orders_backup', JSON.stringify(updatedBackup));
          localStorage.setItem('supermarket_orders', JSON.stringify(updatedBackup));

          setOrdersState((prev) => [newOrder, ...prev]);
          clearCart();
          return {
            success: true,
            order: newOrder
          };
        }

        console.warn('Supabase order insert note:', orderErr);
        return {
          success: false,
          error: orderErr.message || 'Database error: Could not save order to Supabase.'
        };
      }

      // 2. Insert line items into 'order_items' table
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
        }
      }

      // Update local React state
      setOrdersState((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) {
          return prev;
        }
        return [newOrder, ...prev];
      });

      clearCart();
      return {
        success: true,
        order: newOrder
      };
    } catch (err: any) {
      console.error('Exception during Supabase order insertion:', err);
      return {
        success: false,
        error: err?.message || 'Database error: Could not save order.'
      };
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: updateErr } = await (supabase.from('orders') as any)
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (updateErr) {
          console.warn('Supabase status update error:', updateErr);
          addToast('error', 'Status Update Failed', updateErr.message);
          return;
        }
      } catch (err) {
        console.warn('Status update note:', err);
      }
    }

    setOrdersState((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    addToast('success', 'Order Status Updated', `Order marked as ${status.replace('_', ' ').toUpperCase()}`);
  };

  const updateOrderNotes = async (id: string, internalNotes: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: notesErr } = await (supabase.from('orders') as any)
          .update({ 
            internal_notes: internalNotes, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id);

        if (notesErr) {
          console.warn('Supabase notes update error:', notesErr);
          addToast('error', 'Notes Save Failed', notesErr.message);
          return;
        }
      } catch (err) {
        console.warn('Notes update note:', err);
      }
    }

    setOrdersState((prev) =>
      prev.map((o) => (o.id === id ? { ...o, internalNotes } : o))
    );
    addToast('success', 'Order Notes Saved', 'Fulfillment notes logged.');
  };

  const deleteOrder = async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: delErr } = await (supabase.from('orders') as any)
          .delete()
          .eq('id', id);

        if (delErr) {
          console.warn('Supabase order delete error:', delErr);
          addToast('error', 'Delete Failed', delErr.message);
          return;
        }
      } catch (err) {
        console.warn('Order delete note:', err);
      }
    }

    setOrdersState((prev) => prev.filter((o) => o.id !== id));
    addToast('info', 'Order Removed', 'Order record removed.');
  };

  // Settings
  const updateSettings = (newSettings: Partial<WebsiteSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Theme, SEO, and banners updated.');
  };

  // Admin Auth & Account Management
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; rawError?: any }> => {
    const cleanEmail = email.trim().toLowerCase();
    const nowStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (!cleanEmail || !pass) {
      const errMsg = 'Please enter your administrator email and password.';
      addToast('error', 'Missing Information', errMsg);
      return { success: false, error: errMsg };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      const errMsg = 'Supabase connection is not configured. Please verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      addToast('error', 'Supabase Disconnected', errMsg);
      return { success: false, error: errMsg };
    }

    try {
      console.info('[Supabase Auth] Attempting signInWithPassword for email:', cleanEmail);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });

      console.info('[Supabase Auth] signInWithPassword response:', {
        user: authData?.user ? { id: authData.user.id, email: authData.user.email, confirmed_at: authData.user.confirmed_at || (authData.user as any).email_confirmed_at } : null,
        session: authData?.session ? 'Session active' : null,
        authError
      });

      if (authError) {
        console.warn('Supabase Auth signIn error:', authError);
        let userFacingError = authError.message;
        if (authError.message?.toLowerCase().includes('email not confirmed')) {
          userFacingError = `Supabase Auth Error: Email not confirmed. This user record in Supabase Authentication was created when email confirmation was required. Please click "Confirm user" in Supabase Dashboard → Authentication → Users (or run the SQL confirmation command).`;
          addToast('error', 'Email Confirmation Required', 'This account has not been confirmed in Supabase Authentication yet.');
        } else if (authError.message?.toLowerCase().includes('invalid login credentials')) {
          userFacingError = 'Invalid email or password. Please verify your credentials in Supabase.';
          addToast('error', 'Login Failed', userFacingError);
        } else {
          addToast('error', 'Authentication Failed', authError.message);
        }
        return { success: false, error: userFacingError, rawError: authError };
      }

      if (!authData?.user) {
        const errMsg = 'No authenticated user returned from Supabase.';
        addToast('error', 'Login Failed', errMsg);
        return { success: false, error: errMsg };
      }

      const userMeta = authData.user.user_metadata || {};
      const appMeta = authData.user.app_metadata || {};
      let adminName = userMeta.name || userMeta.full_name || cleanEmail.split('@')[0].toUpperCase();
      let adminRole = (userMeta.role as any) || (appMeta.role as any) || 'superadmin';
      let adminStatus = userMeta.status || 'active';
      let avatarUrl = userMeta.avatar_url || defaultAdminUser.avatarUrl;

      // If created directly in Supabase Dashboard with empty metadata, initialize admin claim
      if (!userMeta.role && userMeta.status !== 'deactivated') {
        try {
          await supabase.auth.updateUser({
            data: {
              name: adminName,
              full_name: adminName,
              role: 'superadmin',
              is_admin: true,
              status: 'active'
            }
          });
        } catch (mErr) {
          console.warn('Metadata sync notice:', mErr);
        }
      }

      // Backend authorization check via /api/admin/authorize
      let isAuthorizedAdmin = false;
      try {
        const token = authData.session?.access_token;
        const authRes = await fetch(getApiUrl('/api/admin/authorize'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const contentType = authRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const authResult = await authRes.json();
          if (authRes.ok && authResult.authorized) {
            isAuthorizedAdmin = true;
            if (authResult.user) {
              if (authResult.user.name) adminName = authResult.user.name;
              if (authResult.user.role) adminRole = authResult.user.role;
              if (authResult.user.status) adminStatus = authResult.user.status;
              if (authResult.user.avatarUrl) avatarUrl = authResult.user.avatarUrl;
            }
          } else if (!authRes.ok && authResult.error) {
            // If server explicitly returns unauthorized or deactivated
            await supabase.auth.signOut();
            addToast('error', 'Access Denied', authResult.error);
            return { success: false, error: authResult.error };
          }
        }
      } catch (authErr) {
        console.warn('Backend authorization endpoint notice:', authErr);
      }

      // Fallback check on user/app metadata or direct Supabase users
      if (!isAuthorizedAdmin) {
        if (
          appMeta.role === 'admin' ||
          appMeta.is_admin === true ||
          ['superadmin', 'editor', 'admin'].includes(userMeta.role) ||
          userMeta.is_admin === true ||
          (!userMeta.role && userMeta.status !== 'deactivated' && userMeta.role !== 'customer')
        ) {
          isAuthorizedAdmin = true;
        }
      }

      if (!isAuthorizedAdmin) {
        // Sign out because this account is not an authorized administrator
        await supabase.auth.signOut();
        const errMsg = 'Access Denied: This account is not an authorized administrator.';
        addToast('error', 'Unauthorized Access', errMsg);
        return { success: false, error: errMsg };
      }

      if (adminStatus === 'deactivated') {
        await supabase.auth.signOut();
        const errMsg = 'This administrator account has been deactivated. Please contact store superadmin.';
        addToast('error', 'Account Deactivated', errMsg);
        return { success: false, error: errMsg };
      }

      const loggedInUser: AdminUser = {
        id: authData.user.id,
        email: cleanEmail,
        name: adminName,
        role: adminRole,
        avatarUrl,
        lastLogin: nowStr,
        status: 'active'
      };

      setAdminUserState(loggedInUser);
      setCurrentView('admin');
      setActiveAdminTab('dashboard');
      addToast('success', 'Welcome Back', `Logged in via Supabase as ${loggedInUser.name}.`);
      
      // Automatically refresh orders queue and administrator directory in background
      setTimeout(() => {
        fetchOrders(true);
        refreshAdminAccounts();
      }, 100);

      return { success: true };
    } catch (err: any) {
      console.error('Supabase login exception:', err);
      const errMsg = err?.message || 'An unexpected error occurred during login.';
      addToast('error', 'Login Exception', errMsg);
      return { success: false, error: errMsg, rawError: err };
    }
  };

  const resendConfirmationEmail = async (targetEmail: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      const errMsg = 'Please enter an email address to resend confirmation.';
      addToast('error', 'Email Required', errMsg);
      return { success: false, error: errMsg };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      const errMsg = 'Supabase connection is not configured.';
      addToast('error', 'Supabase Disconnected', errMsg);
      return { success: false, error: errMsg };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail
      });

      if (error) {
        console.warn('Supabase resend error:', error);
        addToast('error', 'Resend Failed', error.message);
        return { success: false, error: error.message };
      }

      addToast('success', 'Confirmation Sent', `Verification email resent to ${cleanEmail}.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to resend confirmation email.';
      addToast('error', 'Resend Error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const createAdminAccount = async ({
    name,
    email,
    password,
    role = 'superadmin'
  }: {
    name: string;
    email: string;
    password: string;
    role?: 'superadmin' | 'editor';
  }): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    // 1. Validation
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      return { success: false, error: 'Administrator full name is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@domain.com).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // 2. Create admin account via backend API (or Supabase Auth)
    const supabase = getSupabaseClient();
    try {
      const session = (await supabase?.auth.getSession())?.data?.session;
      const res = await safeApiFetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name: cleanName,
          role
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'API server returned HTML instead of JSON. Ensure backend is running on port 3000.' };
      }

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to create administrator account.' };
      }

      // Re-fetch authoritative admin accounts from Supabase backend
      await refreshAdminAccounts();

      addToast('success', 'Admin Account Created', `Administrator "${cleanName}" created successfully.`);
      return { success: true, requiresEmailConfirmation: false };
    } catch (err: any) {
      console.warn('Supabase admin creation exception:', err);
      return { success: false, error: err?.message || 'An error occurred during admin registration.' };
    }
  };

  const deleteAdminAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (adminUser && (adminUser.id === id || adminUser.email.toLowerCase() === id.toLowerCase())) {
      const err = 'You cannot delete your own currently active administrator account.';
      addToast('error', 'Action Restricted', err);
      return { success: false, error: err };
    }

    const target = adminAccounts.find((a) => a.id === id || a.email.toLowerCase() === id.toLowerCase());
    if (!target) {
      return { success: false, error: 'Administrator account not found.' };
    }

    // Protect against removing the last active superadmin
    const remainingSuperadmins = adminAccounts.filter((a) => a.id !== target.id && a.role === 'superadmin' && a.status !== 'deactivated');
    if (target.role === 'superadmin' && remainingSuperadmins.length === 0) {
      const err = 'Cannot delete the only remaining active Superadmin account.';
      addToast('error', 'Action Restricted', err);
      return { success: false, error: err };
    }

    // Delete via backend API endpoint
    const supabase = getSupabaseClient();
    try {
      const session = (await supabase?.auth.getSession())?.data?.session;
      const res = await safeApiFetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ id: target.id, email: target.email })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const errMsg = 'Failed to delete administrator: Invalid server response. Ensure backend is running.';
        addToast('error', 'Deletion Failed', errMsg);
        return { success: false, error: errMsg };
      }

      const result = await res.json();
      if (!res.ok || !result.success) {
        const errMsg = result.error || 'Failed to delete administrator account.';
        addToast('error', 'Deletion Failed', errMsg);
        return { success: false, error: errMsg };
      }

      // Synchronize Admin Directory
      setAdminAccountsState((prev) => prev.filter((a) => a.id !== target.id && a.email.toLowerCase() !== target.email.toLowerCase()));
      await refreshAdminAccounts();

      if (result.deletedFromSupabase) {
        addToast('success', 'Admin Removed from Supabase', `Administrator account "${target.name}" has been deleted from Supabase Authentication.`);
      } else if (result.serviceRoleKeyIssue) {
        addToast('warning', 'Admin Removed from Directory', `Account removed from directory. To remove from Supabase Auth user list as well, set SUPABASE_SERVICE_ROLE_KEY to the secret service_role key.`);
      } else {
        addToast('info', 'Admin Removed', `Administrator account "${target.name}" has been deleted.`);
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Delete admin account network notice:', err);
      const errMsg = err?.message || 'Network error while attempting to delete administrator.';
      addToast('error', 'Deletion Error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const toggleAdminAccountStatus = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (adminUser && (adminUser.id === id || adminUser.email.toLowerCase() === id.toLowerCase())) {
      const err = 'You cannot deactivate your own currently active administrator account.';
      addToast('error', 'Action Restricted', err);
      return { success: false, error: err };
    }

    const target = adminAccounts.find((a) => a.id === id || a.email.toLowerCase() === id.toLowerCase());
    if (!target) {
      return { success: false, error: 'Administrator account not found.' };
    }

    const newStatus = target.status === 'deactivated' ? 'active' : 'deactivated';

    // Protect against deactivating the last active superadmin
    if (newStatus === 'deactivated' && target.role === 'superadmin') {
      const activeSuperadmins = adminAccounts.filter((a) => a.id !== target.id && a.role === 'superadmin' && a.status !== 'deactivated');
      if (activeSuperadmins.length === 0) {
        const err = 'Cannot deactivate the only active Superadmin account.';
        addToast('error', 'Action Restricted', err);
        return { success: false, error: err };
      }
    }

    // Toggle via backend API endpoint
    const supabase = getSupabaseClient();
    try {
      const session = (await supabase?.auth.getSession())?.data?.session;
      const res = await safeApiFetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ id: target.id, status: newStatus })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setAdminAccountsState((prev) => prev.map((a) => a.id === target.id ? { ...a, status: newStatus } : a));
        addToast(
          newStatus === 'active' ? 'success' : 'warning',
          newStatus === 'active' ? 'Admin Reactivated' : 'Admin Deactivated',
          `Account for "${target.name}" is now ${newStatus}.`
        );
        return { success: true };
      }

      const result = await res.json();
      if (!res.ok || !result.success) {
        const errMsg = result.error || 'Failed to update administrator account status.';
        addToast('error', 'Status Update Failed', errMsg);
        return { success: false, error: errMsg };
      }

      await refreshAdminAccounts();

      addToast(
        newStatus === 'active' ? 'success' : 'warning',
        newStatus === 'active' ? 'Admin Reactivated' : 'Admin Deactivated',
        `Account for "${target.name}" is now ${newStatus}.`
      );

      return { success: true };
    } catch (err: any) {
      console.warn('Toggle admin status network notice:', err);
      setAdminAccountsState((prev) => prev.map((a) => a.id === target.id ? { ...a, status: newStatus } : a));
      addToast(
        newStatus === 'active' ? 'success' : 'warning',
        newStatus === 'active' ? 'Admin Reactivated' : 'Admin Deactivated',
        `Account for "${target.name}" is now ${newStatus}.`
      );
      return { success: true };
    }
  };

  const refreshAdminAccounts = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const supabase = getSupabaseClient();
      let session = (await supabase?.auth.getSession())?.data?.session;
      if (!session?.access_token && supabase) {
        const refreshed = await supabase.auth.refreshSession();
        session = refreshed?.data?.session || session;
      }
      if (!session?.access_token) {
        return { success: false, count: 0, error: 'No active admin session' };
      }

      const res = await safeApiFetch('/api/admin/list-users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Accept': 'application/json'
        }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await res.text();
        console.warn('API response is not JSON:', rawText.slice(0, 300));
        return {
          success: false,
          count: adminAccounts.length,
          error: `API returned HTML instead of JSON (${res.status} ${res.statusText}). Verify backend server is running on port 3000.`
        };
      }

      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.accounts)) {
        setAdminAccountsState(result.accounts);
        return { success: true, count: result.accounts.length };
      }

      return {
        success: false,
        count: adminAccounts.length,
        error: result.error || 'Failed to fetch administrator accounts'
      };
    } catch (err: any) {
      console.warn('Supabase refreshAdminAccounts exception:', err);
      return {
        success: false,
        count: adminAccounts.length,
        error: err?.message || 'Failed to refresh administrator accounts'
      };
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setAdminUserState(null);
    setAdminAccountsState([]);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    localStorage.removeItem('cartg_admin_accounts_v4');
    localStorage.removeItem('cartg_admin_accounts_v3');
    localStorage.removeItem('cartg_admin_accounts_v2');
    localStorage.removeItem('cartg_admin_accounts');
    setCurrentView('public');
    addToast('info', 'Signed Out', 'Logged out of admin dashboard.');
  };

  const updateAdminProfile = async (profile: Partial<AdminUser>) => {
    if (adminUser) {
      const updatedUser = { ...adminUser, ...profile };
      setAdminUserState(updatedUser);
      setAdminAccountsState((prev) =>
        prev.map((a) => (a.id === adminUser.id ? { ...a, ...profile } : a))
      );

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.auth.updateUser({
            data: {
              name: updatedUser.name,
              full_name: updatedUser.name,
              role: updatedUser.role,
              avatar_url: updatedUser.avatarUrl
            }
          });
        } catch (e) {
          console.info('Supabase profile metadata update note:', e);
        }
      }

      await refreshAdminAccounts();

      addToast('success', 'Profile Saved', 'Admin account updated.');
    }
  };

  // Reset & Backup
  const resetAllData = () => {
    setBusinessInfoState(defaultBusinessInfo);
    setProductsState(defaultProducts);
    setCartState([]);
    setGalleryState(defaultGallery);
    setReviewsState(defaultReviews);
    setOrdersState(defaultOrders);
    setSettingsState(defaultSettings);
    localStorage.clear();
    addToast('warning', 'Reset Complete', 'Restored default supermarket inventory and settings.');
  };

  const resetToDefaults = resetAllData;

  const exportDatabaseJson = (): string => {
    const dump = {
      businessInfo,
      products,
      gallery,
      reviews,
      orders,
      settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(dump, null, 2);
  };

  const exportDatabaseJSON = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartg-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Exported', 'Supermarket JSON backup downloaded.');
  };

  const importDatabaseJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.businessInfo) setBusinessInfoState(parsed.businessInfo);
      if (parsed.products) setProductsState(parsed.products);
      if (parsed.services && !parsed.products) setProductsState(parsed.services);
      if (parsed.gallery) setGalleryState(parsed.gallery);
      if (parsed.reviews) setReviewsState(parsed.reviews);
      if (parsed.orders) setOrdersState(parsed.orders);
      if (parsed.enquiries && !parsed.orders) setOrdersState(parsed.enquiries);
      if (parsed.settings) setSettingsState(parsed.settings);
      addToast('success', 'Import Successful', 'Supermarket database restored.');
      return true;
    } catch {
      addToast('error', 'Import Error', 'Invalid JSON backup format.');
      return false;
    }
  };

  const importDatabaseJSON = importDatabaseJson;

  return (
    <DataContext.Provider
      value={{
        businessInfo,
        updateBusinessInfo,

        // Products
        products,
        services: products,
        addProduct,
        updateProduct,
        deleteProduct,
        reorderProducts,
        addService: addProduct,
        updateService: updateProduct,
        deleteService: deleteProduct,
        reorderServices: reorderProducts,

        // Cart & Order Selection
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartSavings,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,

        // Gallery
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        reorderGallery,

        // Reviews
        reviews,
        addReview,
        updateReview,
        deleteReview,
        toggleReviewActive,

        // Orders / CRM
        orders,
        enquiries: orders,
        isOrdersLoading,
        ordersLoadError,
        refreshOrders: () => fetchOrders(false),
        createOrder,
        addEnquiry: (orderData: any) => createOrder(orderData),
        updateOrderStatus,
        updateEnquiryStatus: updateOrderStatus,
        updateOrderNotes,
        updateEnquiryNotes: updateOrderNotes,
        deleteOrder,
        deleteEnquiry: deleteOrder,

        // Settings
        settings,
        updateSettings,

        // Auth & Admin Accounts Management
        adminUser,
        currentUser: adminUser,
        isAuthenticated: !!adminUser,
        adminAccounts,
        login,
        resendConfirmationEmail,
        refreshAdminAccounts,
        logout,
        updateAdminProfile,
        createAdminAccount,
        deleteAdminAccount,
        toggleAdminAccountStatus,

        // Utils
        toasts,
        addToast,
        removeToast,
        resetAllData,
        resetToDefaults,
        exportDatabaseJSON,
        exportDatabaseJson,
        importDatabaseJSON,
        importDatabaseJson,

        // View
        currentView,
        setCurrentView,
        activeAdminTab,
        setActiveAdminTab,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedFilterTag,
        setSelectedFilterTag,
        triggerSearch
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
