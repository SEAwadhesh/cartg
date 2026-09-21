import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Star, 
  MapPin, 
  ArrowRight, 
  ShoppingCart, 
  Navigation, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  Truck,
  Sparkles,
  Percent,
  Leaf,
  Store,
  Search,
  Flame
} from 'lucide-react';
import { getOpenStatus } from '../utils/theme';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const { 
    businessInfo, 
    settings, 
    setIsCartOpen, 
    setIsCheckoutOpen, 
    cartCount,
    searchQuery,
    setSearchQuery,
    triggerSearch,
    setSelectedFilterTag
  } = useData();

  const [localSearch, setLocalSearch] = useState('');
  const openStatus = getOpenStatus(businessInfo.openingHours);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(localSearch);
  };

  const quickPills = [
    { label: '🌾 Basmati & Atta', query: 'Basmati Rice' },
    { label: '📓 Stationery & Pens', query: 'Notebook' },
    { label: '🧼 Surf & Cleaning', query: 'Surf Excel' },
    { label: '🍯 Pure Desi Ghee', query: 'Ghee' },
    { label: '☕ Tea & Snacks', query: 'Tea' }
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-neutral-50/70 pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-neutral-100">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Trust Pill: Google Rating & Fast Delivery */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-semibold mb-4 shadow-xs">
              <span className="flex items-center gap-1 bg-amber-400 text-neutral-950 font-bold px-2 py-0.5 rounded-full shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{businessInfo.rating}</span>
              </span>
              <span className="text-emerald-900 font-medium">({businessInfo.reviewCount}+ Google Reviews)</span>
              <span className="text-emerald-400">•</span>
              <span className="flex items-center gap-1 text-emerald-800 font-bold">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>45-Min Express Doorstep Delivery</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-950 tracking-tight leading-[1.2] sm:leading-[1.15] mb-4">
              {settings.heroTitle}{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent underline decoration-emerald-400/60 decoration-wavy decoration-2">
                {settings.heroHighlightText}
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-sm sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mb-6">
              {settings.heroSubtitle}
            </p>

            {/* Interactive Hero Search Form */}
            <form onSubmit={handleHeroSearch} className="w-full max-w-xl mb-4 relative">
              <div className="flex items-center bg-white p-1 sm:p-1.5 rounded-2xl border-2 border-emerald-200/90 shadow-md shadow-emerald-600/5 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all">
                <div className="pl-2.5 sm:pl-3 text-neutral-400 shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search 1,200+ groceries, stationery, staples..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Keyword search tags in Hero */}
            <div className="flex flex-wrap items-center gap-1.5 mb-7">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Quick:</span>
              {quickPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => triggerSearch(pill.query)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-8">
              <button
                type="button"
                id="hero-primary-cta"
                onClick={() => triggerSearch()}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 active:scale-[0.98] transition-all text-sm group"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Select Items & Order</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedFilterTag('deals');
                  const dealsEl = document.querySelector('#deals') || document.querySelector('#catalog');
                  dealsEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-sm"
              >
                <Flame className="w-4 h-4 text-amber-900 fill-amber-900" />
                <span>⚡ Daily Deals & 30% OFF</span>
              </button>

              <a
                href={businessInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-directions-cta"
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-300 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all text-sm"
              >
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>Locate on Maps</span>
              </a>
            </div>

            {/* Value Points Pill Row */}
            <div className="pt-4 border-t border-neutral-200/80 w-full grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs text-neutral-700">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-200/70 shadow-xs">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${openStatus.isOpenNow ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500'}`} />
                <span className="font-bold text-neutral-900 truncate">{openStatus.statusText}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-200/70 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-neutral-800 truncate">100% Genuine Branded Items</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-neutral-200/70 shadow-xs min-[480px]:col-span-2 sm:col-span-1">
                <Percent className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-neutral-800 truncate">Daily Aisle Discounts</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative w-full"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-neutral-100 aspect-[4/3] group">
                <img
                  src={settings.heroImageUrl}
                  alt={settings.heroImageAlt || businessInfo.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Overlay inside Image */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-neutral-950 leading-tight truncate">CartG Supermarket</p>
                      <p className="text-[10px] font-semibold text-emerald-700 truncate">Open 7 AM - 10:30 PM Everyday</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSearch()}
                    className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Floating Badge 1: 45 Min Delivery */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-neutral-200 shadow-xl items-center gap-2.5 sm:gap-3 hidden sm:flex"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-neutral-900 leading-tight">45-Min Express Delivery</p>
                  <p className="text-[10px] font-semibold text-emerald-600">Free above ₹499 Order</p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Happy Households */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute -bottom-4 right-1 sm:-right-4 bg-white/95 backdrop-blur-md p-2 sm:p-3.5 rounded-2xl border border-neutral-200 shadow-xl flex items-center gap-2 sm:gap-3 max-w-[calc(100%-1rem)] sm:max-w-none"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-black text-neutral-900 leading-tight truncate">
                    {businessInfo.customersServed.toLocaleString()}+ Families Served
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium truncate">Daily Groceries Delivered</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
