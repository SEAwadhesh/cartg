import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Phone, 
  Clock, 
  MapPin, 
  Menu, 
  X, 
  ShoppingCart, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Sparkles,
  Search,
  Truck,
  Percent
} from 'lucide-react';
import { getOpenStatus } from '../utils/theme';

interface HeaderProps {
  onOpenBooking?: (serviceId?: string) => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { 
    businessInfo, 
    settings, 
    setCurrentView, 
    cartCount, 
    cartSubtotal, 
    setIsCartOpen,
    setIsCheckoutOpen,
    searchQuery,
    setSearchQuery,
    triggerSearch,
    setSelectedFilterTag
  } = useData();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const openStatus = getOpenStatus(businessInfo.openingHours);

  const popularSearches = [
    'Basmati Rice',
    'Whole Wheat Atta',
    'Classmate Notebooks',
    'Surf Excel',
    'Amul Pure Ghee',
    'Parker Pen',
    'Sunflower Oil',
    'Toor Dal'
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Grocery Aisles', href: '#catalog' },
    { name: 'Daily Deals', href: '#deals' },
    { name: 'Why CartG', href: '#why-us' },
    { name: 'Store Gallery', href: '#gallery' },
    { name: 'Customer Reviews', href: '#reviews' },
    { name: 'Store Location', href: '#location' },
    { name: 'Contact & Orders', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '#deals') {
      setSelectedFilterTag('deals');
      const dealsEl = document.querySelector('#deals') || document.querySelector('#catalog');
      if (dealsEl) {
        const headerOffset = 90;
        const elementPosition = dealsEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        return;
      }
    }

    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    triggerSearch(searchQuery);
  };

  const handleQuickKeywordClick = (keyword: string) => {
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    triggerSearch(keyword);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      {settings.announcementBar?.enabled && (
        <div id="announcement-bar" className="bg-emerald-900 text-white text-xs py-2 px-4 border-b border-emerald-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {settings.announcementBar.badgeText && (
                <span className="bg-amber-400 text-neutral-950 font-bold px-2 py-0.5 rounded-full text-[11px] shrink-0">
                  {settings.announcementBar.badgeText}
                </span>
              )}
              <span className="text-emerald-100 truncate">{settings.announcementBar.text}</span>
            </div>
            {settings.announcementBar.linkText && (
              <a
                href={settings.announcementBar.linkUrl || '#catalog'}
                onClick={(e) => handleNavClick(e, settings.announcementBar.linkUrl || '#catalog')}
                className="hidden sm:inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 underline text-[11px] shrink-0"
              >
                {settings.announcementBar.linkText}
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Top Info Bar (Desktop) */}
      <div className="hidden lg:block bg-neutral-100/90 backdrop-blur-sm border-b border-neutral-200 text-xs text-neutral-600 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-neutral-800">Express Delivery:</span>
              <span>{businessInfo.deliveryTimeEstimate} ({businessInfo.deliveryRadius})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{businessInfo.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${openStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-medium text-neutral-800">{openStatus.statusText}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`tel:${businessInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center gap-1.5 font-medium text-neutral-800 hover:text-emerald-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store: {businessInfo.phone}</span>
            </a>
            <span className="text-neutral-300">|</span>
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 bg-neutral-200/70 hover:bg-neutral-200 px-2 py-0.5 rounded transition-all"
              title="Open Supermarket Admin Dashboard"
            >
              <Lock className="w-3 h-3 text-neutral-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2 sm:py-2.5 border-b border-neutral-100' 
          : 'bg-white py-2.5 sm:py-3.5 border-b border-neutral-100'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Supermarket Brand */}
          <a href="#home" className="flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
              🛒
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-neutral-900 text-sm sm:text-lg leading-tight tracking-tight flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="truncate">{businessInfo.name}</span>
                {businessInfo.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" title="Verified Supermarket" />
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 tracking-wide uppercase truncate">
                Groceries, Stationery & Essentials
              </p>
            </div>
          </a>

          {/* Search bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search basmati rice, classmate notebooks, surf excel, parkers..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-20 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick Search Suggestions Dropdown */}
            {isSearchFocused && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsSearchFocused(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      Popular Supermarket Searches
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setIsSearchFocused(false)}
                      className="text-neutral-400 hover:text-neutral-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleQuickKeywordClick(item)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {navLinks.slice(0, 5).map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs font-semibold text-neutral-700 hover:text-emerald-700 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Shopping Cart Button & Checkout trigger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Cart Trigger */}
            <button
              type="button"
              id="header-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-xs transition-all active:scale-95"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartCount === 0 ? 'Cart (0)' : `₹${cartSubtotal.toLocaleString()}`}
              </span>
            </button>

            {/* Quick Order / Checkout button */}
            <button
              type="button"
              onClick={() => {
                if (cartCount > 0) {
                  setIsCheckoutOpen(true);
                } else {
                  const catalog = document.querySelector('#catalog');
                  catalog?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xs shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{cartCount > 0 ? 'Checkout Order' : 'Order Groceries'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors md:hidden focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-2">
              <input
                type="text"
                placeholder="Search groceries & products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-16 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 text-white font-bold text-[11px] rounded-lg"
              >
                Go
              </button>
            </form>

            {/* Mobile Quick Keyword Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-neutral-100 scrollbar-none">
              <span className="text-[10px] font-bold text-neutral-400 uppercase shrink-0">Quick:</span>
              {popularSearches.slice(0, 5).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickKeywordClick(item)}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-700 hover:bg-emerald-100 text-[11px] rounded-md shrink-0"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1 pb-4 border-b border-neutral-100">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 shadow-sm"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                <span>View Shopping Cart ({cartCount} items)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (cartCount > 0) {
                    setIsCheckoutOpen(true);
                  } else {
                    const catalog = document.querySelector('#catalog');
                    catalog?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Place Express Delivery Order</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${businessInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Store</span>
                </a>
                <a
                  href={businessInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Maps</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView('admin');
                }}
                className="mt-2 text-center text-xs text-neutral-500 hover:text-neutral-900 py-1.5 flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Supermarket Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
