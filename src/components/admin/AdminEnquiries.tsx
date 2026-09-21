import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useOrders } from '../../hooks/useOrders';
import { SupermarketOrder, OrderStatus } from '../../types';
import { 
  PackageCheck, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Trash2, 
  Eye, 
  Tag, 
  MessageCircle, 
  AlertCircle,
  Save,
  Filter,
  Truck,
  Store,
  MapPin,
  CreditCard,
  Printer,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Radio
} from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/theme';

export const AdminEnquiries: React.FC = () => {
  const { 
    orders: allOrders, 
    isLoading: isOrdersLoading, 
    error: ordersLoadError, 
    refreshOrders, 
    updateOrderStatus, 
    updateOrderNotes, 
    deleteOrder,
    isRealtimeConnected 
  } = useOrders();
  
  const { addToast, businessInfo } = useData();

  // Fetch freshest orders on component mount
  useEffect(() => {
    refreshOrders();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [selectedOrder, setSelectedOrder] = useState<SupermarketOrder | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {}
    return dateStr;
  };

  const filteredOrders = useMemo(() => {
    return allOrders.filter((ord) => {
      const matchSearch =
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.orderNumber && ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ord.email && ord.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ord.deliveryAddress && ord.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ord.items && ord.items.some(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())));

      const statusNormalized = (ord.status as string) === 'new' ? 'pending' : (ord.status as string) === 'converted' ? 'delivered' : ord.status;
      const matchStatus = statusFilter === 'all' || statusNormalized === statusFilter;
      const matchDelivery = deliveryTypeFilter === 'all' || (ord.deliveryType || 'delivery') === deliveryTypeFilter;

      return matchSearch && matchStatus && matchDelivery;
    });
  }, [allOrders, searchQuery, statusFilter, deliveryTypeFilter]);

  const openDetailsModal = (ord: SupermarketOrder) => {
    setSelectedOrder(ord);
    setInternalNotes(ord.internalNotes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    updateOrderNotes(selectedOrder.id, internalNotes);
    addToast('success', 'Staff Notes Saved', 'Order preparation and delivery remarks updated.');
  };

  const handleDelete = (id: string) => {
    deleteOrder(id);
    if (selectedOrder?.id === id) setSelectedOrder(null);
    setDeleteConfirmId(null);
    addToast('info', 'Order Removed', 'Order removed from store records.');
  };

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    const label = newStatus === 'ready' ? 'Delivery Ready' : newStatus.replace(/_/g, ' ');
    addToast('success', 'Status Updated', `Order marked as "${label}".`);
  };

  const getWhatsAppMessage = (ord: SupermarketOrder, type: 'received' | 'ready' | 'out_for_delivery') => {
    const storeName = businessInfo.name;
    const orderNo = ord.orderNumber || ord.id.slice(0, 8);
    
    if (type === 'ready') {
      if (ord.deliveryType === 'pickup') {
        return `Hello ${ord.customerName}! 🛍️ Your order #${orderNo} at ${storeName} is PACKED and READY FOR PICKUP at our store counter (${businessInfo.address}). Total: ₹${ord.totalAmount}. Thank you for shopping with us!`;
      }
      return `Hello ${ord.customerName}! 🚀 Your supermarket order #${orderNo} at ${storeName} is PACKED and READY FOR DELIVERY. Our delivery partner will be arriving within your slot. Total: ₹${ord.totalAmount}.`;
    }

    if (type === 'out_for_delivery') {
      return `Hello ${ord.customerName}! 🛵 Your order #${orderNo} from ${storeName} is OUT FOR DELIVERY to: ${ord.deliveryAddress}. Please keep ₹${ord.totalAmount} ready if paying by COD.`;
    }

    return `Hello ${ord.customerName}! ✅ We have received your order #${orderNo} at ${storeName}. Items: ${ord.items?.map(i => `${i.title} (${i.quantity})`).join(', ') || 'Supermarket Goods'}. Total: ₹${ord.totalAmount}. We are preparing your order.`;
  };

  const pendingCount = allOrders.filter(o => o.status === 'pending' || (o.status as any) === 'new').length;
  const packingCount = allOrders.filter(o => o.status === 'packing').length;
  const readyCount = allOrders.filter(o => o.status === 'ready').length;
  const outCount = allOrders.filter(o => o.status === 'out_for_delivery').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Store Order Fulfillment & Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900">Orders & Delivery Management</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time live queue for store pickups and doorstep deliveries. Move orders to <strong>Delivery Ready</strong> to alert staff.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isRealtimeConnected ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5" title="Realtime Order Queue Active">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Order Sync</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600 text-xs font-medium border border-neutral-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Orders Connected</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => refreshOrders()}
            disabled={isOrdersLoading}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold border border-neutral-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh orders queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOrdersLoading ? 'animate-spin text-emerald-600' : 'text-neutral-500'}`} />
            <span>{isOrdersLoading ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount + packingCount} In Preparation</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{readyCount} Delivery Ready</span>
          </span>
        </div>
      </div>

      {/* Orders Load Error Banner */}
      {ordersLoadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{ordersLoadError}</span>
          </div>
          <button
            type="button"
            onClick={() => refreshOrders()}
            disabled={isOrdersLoading}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, phone, order #, item..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Orders', count: allOrders.length },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'packing', label: 'Packing', count: packingCount },
            { id: 'ready', label: 'Delivery Ready', count: readyCount },
            { id: 'out_for_delivery', label: 'Out for Delivery', count: outCount },
            { id: 'delivered', label: 'Delivered', count: allOrders.filter(o => o.status === 'delivered' || (o.status as any) === 'converted').length },
            { id: 'cancelled', label: 'Cancelled', count: allOrders.filter(o => o.status === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order Details</th>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4">Delivery & Slot</th>
                <th className="py-3.5 px-4">Items & Amount</th>
                <th className="py-3.5 px-4">Status Action</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <PackageCheck className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                    <p>No supermarket orders match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusNormalized = (ord.status as string) === 'new' ? 'pending' : (ord.status as string) === 'converted' ? 'delivered' : ord.status;
                  const isReady = statusNormalized === 'ready';

                  return (
                    <tr key={ord.id} className={`hover:bg-neutral-50/80 transition-colors ${isReady ? 'bg-blue-50/30' : ''}`}>
                      {/* Order Details */}
                      <td className="py-3.5 px-4 sm:px-6 align-top">
                        <div className="font-mono font-bold text-neutral-900 text-xs">
                          #{ord.orderNumber || ord.id.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatOrderDate(ord.createdAt)}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            ord.deliveryType === 'pickup' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ord.deliveryType === 'pickup' ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                            <span>{ord.deliveryType || 'delivery'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-neutral-900">{ord.customerName}</div>
                        <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <a href={`tel:${ord.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-emerald-600">
                            {ord.phone}
                          </a>
                        </div>
                        {ord.email && !ord.email.includes('@cartg') && (
                          <div className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                            {ord.email}
                          </div>
                        )}
                      </td>

                      {/* Delivery & Slot */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="text-neutral-800 text-xs line-clamp-2" title={ord.deliveryAddress}>
                          {ord.deliveryAddress}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                          Slot: {ord.preferredSlot}
                        </div>
                      </td>

                      {/* Items & Amount */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-black text-neutral-900 text-sm">
                          ₹{ord.totalAmount || ord.subtotal || 0}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {ord.items?.length || 1} item{(ord.items?.length || 1) !== 1 ? 's' : ''} • <span className="uppercase font-semibold">{ord.paymentMethod || 'COD'}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate max-w-[160px] mt-0.5">
                          {ord.items?.map(i => `${i.title} (${i.quantity})`).join(', ') || ord.serviceName}
                        </div>
                      </td>

                      {/* Status Action */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={statusNormalized}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                            statusNormalized === 'pending'
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : statusNormalized === 'packing'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : statusNormalized === 'ready'
                              ? 'bg-blue-600 border-blue-600 text-white font-black'
                              : statusNormalized === 'out_for_delivery'
                              ? 'bg-purple-50 border-purple-200 text-purple-800'
                              : statusNormalized === 'delivered'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                          }`}
                        >
                          <option value="pending" className="bg-white text-neutral-900">1. Pending</option>
                          <option value="packing" className="bg-white text-neutral-900">2. Packing</option>
                          <option value="ready" className="bg-white text-neutral-900">3. Delivery Ready ⭐</option>
                          <option value="out_for_delivery" className="bg-white text-neutral-900">4. Out for Delivery</option>
                          <option value="delivered" className="bg-white text-neutral-900">5. Delivered</option>
                          <option value="cancelled" className="bg-white text-neutral-900">Cancelled</option>
                        </select>

                        {/* Quick Ready Action Button */}
                        {statusNormalized === 'packing' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord.id, 'ready')}
                            className="mt-1.5 w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Mark Ready</span>
                          </button>
                        )}
                        {statusNormalized === 'ready' && ord.deliveryType !== 'pickup' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(ord.id, 'out_for_delivery')}
                            className="mt-1.5 w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(ord)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            title="View Full Order Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={formatWhatsAppLink(ord.phone, getWhatsAppMessage(ord, 'ready'))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="WhatsApp Customer (Ready Alert)"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(ord.id)}
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-400 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Supermarket Order Invoice</span>
                <h3 className="text-base font-bold">
                  Order #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Customer & Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Customer Info</span>
                  <p className="text-sm font-bold text-neutral-900">{selectedOrder.customerName}</p>
                  <p className="text-xs text-neutral-600">{selectedOrder.phone}</p>
                  {selectedOrder.email && <p className="text-xs text-neutral-500">{selectedOrder.email}</p>}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Delivery Address & Mode</span>
                  <p className="text-xs font-semibold text-neutral-900">{selectedOrder.deliveryAddress}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">Slot: {selectedOrder.preferredSlot}</p>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Order Preparation & Dispatch Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pending', label: '1. Pending' },
                    { id: 'packing', label: '2. Packing' },
                    { id: 'ready', label: '3. Delivery Ready ⭐' },
                    { id: 'out_for_delivery', label: '4. Out for Delivery' },
                    { id: 'delivered', label: '5. Delivered' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.id, st.id as OrderStatus)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        selectedOrder.status === st.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">Ordered Items</h4>
                <div className="border border-neutral-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Item Name</th>
                        <th className="py-2.5 px-3 text-center">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/50">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-neutral-900">{item.title}</span>
                              <span className="text-neutral-500 text-[11px] block">{item.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center text-neutral-600">₹{item.price}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-neutral-900">₹{item.price * item.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 px-3 text-neutral-600">
                            {selectedOrder.serviceName || 'Custom Supermarket Item Pack'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-neutral-50 font-bold border-t border-neutral-200">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-neutral-600 text-right">Subtotal:</td>
                        <td className="py-2 px-3 text-right text-neutral-900">₹{selectedOrder.subtotal || selectedOrder.totalAmount}</td>
                      </tr>
                      {selectedOrder.deliveryFee > 0 && (
                        <tr>
                          <td colSpan={3} className="py-1 px-3 text-neutral-600 text-right">Delivery Fee:</td>
                          <td className="py-1 px-3 text-right text-neutral-900">+₹{selectedOrder.deliveryFee}</td>
                        </tr>
                      )}
                      {selectedOrder.discountAmount > 0 && (
                        <tr>
                          <td colSpan={3} className="py-1 px-3 text-emerald-700 text-right">Discount:</td>
                          <td className="py-1 px-3 text-right text-emerald-700">-₹{selectedOrder.discountAmount}</td>
                        </tr>
                      )}
                      <tr className="text-sm bg-neutral-100">
                        <td colSpan={3} className="py-2.5 px-3 text-neutral-900 text-right">Grand Total:</td>
                        <td className="py-2.5 px-3 text-right text-neutral-950 font-black">₹{selectedOrder.totalAmount || selectedOrder.subtotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Customer Delivery Instructions:</span>
                  <p className="text-amber-800">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Internal Preparation Notes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Store Staff Internal Notes (Packing status, assigned delivery boy, invoice notes)
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Packed in 2 brown bags. Handed over to delivery driver Suresh. Payment received via UPI."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Internal Remarks</span>
                </button>
              </div>

              {/* Actions Toolbar */}
              <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={formatWhatsAppLink(selectedOrder.phone, getWhatsAppMessage(selectedOrder, 'ready'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp "Ready" Alert</span>
                  </a>

                  <a
                    href={`tel:${selectedOrder.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Customer</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Delete Order Record?</h3>
              <p className="text-xs text-neutral-500">
                Are you sure you want to permanently delete this supermarket order from store records?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
