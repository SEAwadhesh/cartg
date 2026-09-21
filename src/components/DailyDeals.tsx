import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { GroceryProduct } from '../types';
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Percent, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowRight, 
  Star, 
  Check, 
  Eye, 
  Tag, 
  ShieldCheck,
  Zap,
  TrendingDown
} from 'lucide-react';
import { motion } from 'motion/react';

export const DailyDeals: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    triggerSearch, 
    setSelectedProductForDetail,
    setIsCartOpen
  } = useData();

  // Active Deals Category Tab
  const [activeTab, setActiveTab] = useState<string>('All');

  // Flash Countdown Timer (Hours, Minutes, Seconds until midnight)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 8,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter deal products
  const dealProducts = useMemo(() => {
    // Collect all products with isDealOfTheDay or discountPercent >= 15
    let deals = products.filter(p => p.isDealOfTheDay || (p.discountPercent && p.discountPercent >= 15));
    
    // If fewer than 4 deals found, take top discounted products
    if (deals.length < 4) {
      deals = [...products].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)).slice(0, 8);
    }

    if (activeTab !== 'All') {
      deals = deals.filter(p => p.category === activeTab);
    }

    return deals;
  }, [products, activeTab]);

  // Unique categories within deals
  const dealCategories = useMemo(() => {
    const allDeals = products.filter(p => p.isDealOfTheDay || (p.discountPercent && p.discountPercent >= 15));
    const set = new Set<string>();
    allDeals.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Helper for cart quantity
  const getCartQuantity = (productId: string): number => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleViewAllDeals = () => {
    triggerSearch('', 'All', 'deals');
  };

  return (
    <section id="deals" className="py-14 sm:py-20 bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white relative border-b border-amber-200/60 scroll-mt-20">
      {/* Decorative ambient flare */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            {/* Supermarket Deal Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
              <Flame className="w-4 h-4 text-amber-600 animate-pulse fill-amber-500" />
              <span>CartG Super Saver Deals</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight flex items-center gap-3">
              <span>Daily Deals & Combo Discounts</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl">
              Handpicked everyday staples, bulk school & office supplies, and household cleansers priced up to <strong className="text-emerald-700 font-black">30% BELOW MRP</strong>. Refreshed every morning!
            </p>
          </div>

          {/* Flash Deal Countdown Clock */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-amber-200 shadow-xs shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-bold text-neutral-800">Today's Deals Expire In:</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs font-black text-white">
              <div className="bg-neutral-900 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center min-w-[30px] sm:min-w-[34px] shadow-xs">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[8px] sm:text-[9px] font-sans font-medium text-neutral-400">HRS</span>
              </div>
              <span className="text-neutral-900 font-black text-sm sm:text-base">:</span>
              <div className="bg-neutral-900 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center min-w-[30px] sm:min-w-[34px] shadow-xs">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[8px] sm:text-[9px] font-sans font-medium text-neutral-400">MIN</span>
              </div>
              <span className="text-neutral-900 font-black text-sm sm:text-base">:</span>
              <div className="bg-amber-600 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-center min-w-[30px] sm:min-w-[34px] shadow-xs">
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[8px] sm:text-[9px] font-sans font-medium text-amber-200">SEC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pill Filters inside Deals */}
        {dealCategories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {dealCategories.map((category) => {
              const count = category === 'All'
                ? products.filter(p => p.isDealOfTheDay || (p.discountPercent && p.discountPercent >= 15)).length
                : products.filter(p => (p.isDealOfTheDay || (p.discountPercent && p.discountPercent >= 15)) && p.category === category).length;
              const isSelected = activeTab === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveTab(category)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-black scale-105'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80'
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Daily Deals Cards Grid */}
        <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {dealProducts.slice(0, 8).map((product) => {
            const qtyInCart = getCartQuantity(product.id);
            const savings = product.originalPrice ? product.originalPrice - product.price : 0;

            return (
              <motion.div
                key={product.id}
                id={`deal-card-${product.id}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs hover:shadow-lg hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
              >
                {/* Top Corner Ribbon: Deal of the Day */}
                {product.isDealOfTheDay && (
                  <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 text-[10px] font-black shadow-md uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-neutral-950" />
                    <span>DEAL OF THE DAY</span>
                  </div>
                )}

                {/* Card Image Container */}
                <div 
                  className="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProductForDetail(product)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Discount percentage tag top-right */}
                  {product.discountPercent && (
                    <div className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-md">
                      {product.discountPercent}% OFF
                    </div>
                  )}

                  {/* Savings pill overlay on image bottom */}
                  {savings > 0 && (
                    <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-sm text-amber-300 font-bold text-[10px] flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Save ₹{savings}</span>
                    </div>
                  )}

                  {/* Quick View Button */}
                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm text-neutral-900 text-xs font-bold shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Quick View</span>
                    </span>
                  </div>
                </div>

                {/* Product Content & Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category & Brand */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      {product.brand && (
                        <span className="font-bold text-neutral-600 truncate max-w-[110px]">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setSelectedProductForDetail(product)}
                      className="text-sm font-bold text-neutral-900 leading-snug hover:text-emerald-700 cursor-pointer line-clamp-2"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Unit / Weight specification */}
                    <p className="text-xs text-neutral-500 font-semibold mt-1">
                      {product.unit}
                    </p>
                  </div>

                  {/* Rating & In-Stock indicator */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400 font-normal">({product.reviewCount})</span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>In Stock</span>
                    </span>
                  </div>

                  {/* Price & Add to Cart Controls */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-neutral-900">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-neutral-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.discountPercent && (
                        <span className="text-[10px] font-bold text-emerald-700">
                          {product.discountPercent}% Savings
                        </span>
                      )}
                    </div>

                    {/* Cart Action button / Counter */}
                    {qtyInCart === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-500 shadow-sm shadow-amber-400/30 active:scale-95 transition-all shrink-0"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add Deal</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center bg-emerald-50 border border-emerald-300 rounded-xl p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, qtyInCart - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-emerald-950">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, qtyInCart + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Deals Footer Action */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleViewAllDeals}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Explore All Discounted Supermarket Aisle Offers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
