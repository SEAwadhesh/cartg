import React from 'react';
import { useData } from '../../context/DataContext';
import { useOrders } from '../../hooks/useOrders';
import { 
  PackageCheck, 
  ShoppingBag, 
  Image as ImageIcon, 
  Star, 
  TrendingUp, 
  Clock, 
  Phone, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Store,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { getOpenStatus } from '../../utils/theme';
import { OrderStatus } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { businessInfo, products, gallery, reviews } = useData();
  const { orders: allOrders, updateOrderStatus } = useOrders();

  const openStatus = getOpenStatus(businessInfo.openingHours);

  // Key metrics
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.status === 'pending' || (o.status as any) === 'new').length;
  const packingOrders = allOrders.filter((o) => o.status === 'packing').length;
  const readyOrders = allOrders.filter((o) => o.status === 'ready').length;
  const outForDeliveryOrders = allOrders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered' || (o.status as any) === 'converted').length;
  
  const activeProductsCount = products.filter((p) => p.active !== false).length;
  const totalPhotos = gallery.filter((g) => g.active !== false).length;
  const verifiedReviewsCount = reviews.filter((r) => r.verified !== false).length;

  const recentOrders = allOrders.slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <span className={`w-2 h-2 rounded-full ${openStatus.isOpenNow ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>Store Status: {openStatus.statusText}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {businessInfo.name} Store Operations Hub
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl">
            You have <span className="text-emerald-400 font-bold">{pendingOrders + packingOrders} active grocery & stationery order{pendingOrders + packingOrders !== 1 ? 's' : ''}</span> in queue awaiting preparation or dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => onNavigate('enquiries')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <PackageCheck className="w-4 h-4" />
            <span>View Orders & Delivery Ready</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-2 border border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supermarket Product</span>
          </button>
        </div>
      </div>

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Orders Pipeline */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-900">{totalOrders}</div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1 flex-wrap">
              <span className="font-semibold text-rose-600">{pendingOrders} Pending</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{packingOrders + readyOrders} Packing/Ready</span>
              <span>•</span>
              <span className="text-emerald-600">{deliveredOrders} Delivered</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Inventory */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Active Inventory
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-900">{activeProductsCount} Items</div>
            <p className="text-xs text-neutral-500 mt-1">
              Groceries, Stationery & Daily Essentials
            </p>
          </div>
        </div>

        {/* Metric 3: Customer Reviews */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Customer Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-900">{businessInfo.rating} ★</div>
            <p className="text-xs text-neutral-500 mt-1">
              From {businessInfo.reviewCount}+ Google & store customer reviews
            </p>
          </div>
        </div>

        {/* Metric 4: Store Gallery */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Store & Aisle Photos
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-neutral-900">{totalPhotos} Photos</div>
            <p className="text-xs text-neutral-500 mt-1">
              Live photo gallery showcases
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Recent Orders (8 cols) & Quick Operations Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Recent Supermarket Orders</h2>
              <p className="text-xs text-neutral-500">Live feed from online store checkout</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('enquiries')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No orders received yet. Items ordered from the website will appear here in real time.
              </div>
            ) : (
              recentOrders.map((ord) => {
                const itemCount = ord.items?.length || 1;
                const statusNormalized = (ord.status as string) === 'new' ? 'pending' : (ord.status as string) === 'converted' ? 'delivered' : ord.status;

                return (
                  <div key={ord.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-neutral-900">
                          #{ord.orderNumber || ord.id.slice(0, 8)}
                        </span>
                        <span className="text-xs font-bold text-neutral-800">
                          {ord.customerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            statusNormalized === 'pending'
                              ? 'bg-rose-100 text-rose-800'
                              : statusNormalized === 'packing'
                              ? 'bg-amber-100 text-amber-800'
                              : statusNormalized === 'ready'
                              ? 'bg-blue-100 text-blue-800'
                              : statusNormalized === 'out_for_delivery'
                              ? 'bg-purple-100 text-purple-800'
                              : statusNormalized === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {statusNormalized === 'ready' ? 'Delivery Ready' : statusNormalized.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-neutral-600 truncate">
                        {ord.items && ord.items.length > 0 
                          ? `${ord.items.map(i => `${i.title} (${i.quantity})`).join(', ')}`
                          : ord.serviceName || 'Supermarket Goods'}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                        <span className="font-bold text-neutral-900">₹{ord.totalAmount || ord.subtotal || 0}</span>
                        <span>•</span>
                        <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className="capitalize">{ord.deliveryType || 'delivery'}</span>
                        <span>•</span>
                        <span>{ord.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={statusNormalized}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-neutral-300 bg-white font-medium text-neutral-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="packing">Packing</option>
                        <option value="ready">Delivery Ready</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <a
                        href={`tel:${ord.phone.replace(/[^0-9+]/g, '')}`}
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-700 transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Management Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Store Shortcuts</h3>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate('enquiries')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Delivery Ready & Packing Station</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Manage Products & Prices</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('business')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Update Supermarket Hours</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('gallery')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Upload Store & Aisle Photos</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('accounts')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Manage Admin Accounts & Team</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-emerald-50 text-xs font-semibold text-neutral-800 hover:text-emerald-900 border border-neutral-200 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-neutral-600" />
                  <span>SEO, Theme & System Backup</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
