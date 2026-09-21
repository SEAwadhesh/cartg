import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useOrders } from '../../hooks/useOrders';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  Image as ImageIcon, 
  Star, 
  PackageCheck, 
  Sliders, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Truck,
  Users
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminBusinessInfo } from './AdminBusinessInfo';
import { AdminServices } from './AdminServices';
import { AdminGallery } from './AdminGallery';
import { AdminReviews } from './AdminReviews';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminSettings } from './AdminSettings';
import { AdminAccounts } from './AdminAccounts';

type AdminTab = 'dashboard' | 'business' | 'services' | 'gallery' | 'reviews' | 'enquiries' | 'settings' | 'accounts';

export const AdminLayout: React.FC = () => {
  const { businessInfo, logout, setCurrentView, currentUser } = useData();
  const { orders: activeOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingOrdersCount = activeOrders.filter((e) => e.status === 'pending' || e.status === 'packing' || (e.status as any) === 'new').length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Store Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'enquiries',
      label: 'Orders & Delivery Hub',
      icon: <PackageCheck className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      id: 'services',
      label: 'Products & Inventory',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      id: 'business',
      label: 'Supermarket Info & Hours',
      icon: <Store className="w-4 h-4" />
    },
    {
      id: 'gallery',
      label: 'Store & Aisle Photos',
      icon: <ImageIcon className="w-4 h-4" />
    },
    {
      id: 'reviews',
      label: 'Customer Reviews',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'accounts',
      label: 'Manage Admin Accounts',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'SEO, Theme & System',
      icon: <Sliders className="w-4 h-4" />
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
      case 'enquiries':
        return <AdminEnquiries />;
      case 'services':
        return <AdminServices />;
      case 'business':
        return <AdminBusinessInfo />;
      case 'gallery':
        return <AdminGallery />;
      case 'reviews':
        return <AdminReviews />;
      case 'accounts':
        return <AdminAccounts />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab as AdminTab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">
            {businessInfo.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight">{businessInfo.name}</h1>
            <p className="text-[10px] text-emerald-400">Admin Control Room</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('public')}
            className="p-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20"
            title="View Live Website"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-emerald-600 text-white cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-25 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-72 bg-neutral-900 text-white flex flex-col justify-between p-4 border-r border-neutral-800 transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                {businessInfo.name.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-white truncate leading-tight">
                  {businessInfo.name}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Verified Admin
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-neutral-400 group-hover:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Live Website Switch & Logout) */}
        <div className="pt-4 border-t border-neutral-800 space-y-2">
          <button
            type="button"
            onClick={() => setCurrentView('public')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>View Public Website</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold text-neutral-200 truncate">
                {currentUser?.email || 'admin@business.com'}
              </p>
              <p className="text-[10px] text-neutral-500 capitalize">{currentUser?.role || 'Administrator'}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto bg-neutral-100">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-neutral-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Supermarket Store Admin</span>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-bold text-neutral-900 capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('enquiries')}
              className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              title="Recent Supermarket Orders"
            >
              <Bell className="w-4 h-4" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('public')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Website Preview</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {renderContent()}
        </div>
      </main>

    </div>
  );
};
