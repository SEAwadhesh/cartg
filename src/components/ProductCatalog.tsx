import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { GroceryProduct } from '../types';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Percent, 
  Sparkles, 
  Star, 
  Check, 
  ArrowUpDown, 
  Filter, 
  Leaf, 
  Flame, 
  Truck, 
  Eye,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductCatalog: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    setIsCartOpen,
    setIsCheckoutOpen,
    cartCount,
    cartSubtotal,
    cartSavings,
    businessInfo,
    selectedProductForDetail,
    setSelectedProductForDetail,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedFilterTag,
    setSelectedFilterTag,
    triggerSearch
  } = useData();

  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('featured');

  const popularKeywords = [
    'Basmati Rice',
    'Whole Wheat Atta',
    'Classmate Notebooks',
    'Surf Excel',
    'Amul Ghee',
    'Parker Pen',
    'Sunflower Oil',
    'Toor Dal'
  ];

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchSubcategory = p.subcategory?.toLowerCase().includes(q);
          const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchBrand && !matchCategory && !matchSubcategory && !matchTags) {
            return false;
          }
        }

        // Tag Filter
        if (selectedFilterTag === 'deals' && !p.isDealOfTheDay && (!p.discountPercent || p.discountPercent < 15)) {
          return false;
        }
        if (selectedFilterTag === 'bestsellers' && !p.featured && !p.tags?.some((t) => t.toLowerCase().includes('bestseller'))) {
          return false;
        }
        if (selectedFilterTag === 'top_rated' && p.rating < 4.8) {
          return false;
        }
        if (selectedFilterTag === 'instock' && !p.inStock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
        return a.order - b.order;
      });
  }, [products, selectedCategory, searchQuery, selectedFilterTag, sortBy]);

  // Helper to get product cart quantity
  const getCartQuantity = (productId: string): number => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section id="catalog" className="py-14 sm:py-20 bg-neutral-50/50 border-b border-neutral-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supermarket Inventory Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Select Items & Order Online
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl">
              Add food staples, branded groceries, school & office stationery, and daily household essentials to your cart for 45-minute doorstep delivery or express pickup.
            </p>
          </div>

          {/* Quick Cart Trigger on top */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>Shopping Cart</span>
              <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Category Aisles Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((category) => {
            const count = category === 'All' 
              ? products.length 
              : products.filter((p) => p.category === category).length;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80 shadow-xs'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter Tags & Sorting Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <input
                id="catalog-search-input"
                type="text"
                placeholder="Search by name or brand (e.g. Basmati, Classmate, Surf Excel, Parker)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full hover:bg-neutral-200 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedFilterTag('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFilterTag === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All Items
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilterTag('deals')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFilterTag === 'deals'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-700" />
                <span>Deals & Offers</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilterTag('bestsellers')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFilterTag === 'bestsellers'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Star className="w-3 h-3 text-emerald-600" />
                <span>Bestsellers</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-2 relative">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>

          </div>

          {/* Quick Click-to-Search Keyword Pills */}
          <div className="pt-3 mt-3 border-t border-neutral-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
              Quick Search:
            </span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  triggerSearch(kw);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  searchQuery.toLowerCase() === kw.toLowerCase()
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {kw}
              </button>
            ))}
            {(searchQuery || selectedCategory !== 'All' || selectedFilterTag !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedFilterTag('all');
                }}
                className="ml-auto text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
              🛒
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">No items found</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try searching with another keyword or clearing your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSelectedFilterTag('all');
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => {
              const qtyInCart = getCartQuantity(product.id);
              const savings = product.originalPrice ? product.originalPrice - product.price : 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-emerald-300"
                >
                  {/* Card Top: Image & Badges */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProductForDetail(product)}>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Discount & Deal Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {product.discountPercent && product.discountPercent > 0 && (
                        <span className="bg-amber-500 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" />
                          <span>{product.discountPercent}% OFF</span>
                        </span>
                      )}
                      {product.isDealOfTheDay && (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Deal of the Day</span>
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-neutral-900 border border-neutral-200/60 flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">({product.reviewCount})</span>
                    </div>

                    {/* Quick View Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductForDetail(product);
                      }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-emerald-700 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Quick Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Body: Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Brand & Category */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1 font-medium">
                        <span className="text-emerald-700 font-semibold truncate">{product.brand || product.category}</span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] text-neutral-600 font-bold shrink-0">
                          {product.unit}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 
                        onClick={() => setSelectedProductForDetail(product)}
                        className="font-bold text-neutral-900 text-sm leading-snug line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors mb-1.5"
                      >
                        {product.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Card Bottom: Pricing & Cart Button */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                      
                      {/* Price Section */}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-black text-neutral-950">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-neutral-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        {savings > 0 && (
                          <p className="text-[10px] font-bold text-emerald-700">
                            Save ₹{savings}
                          </p>
                        )}
                      </div>

                      {/* Cart Action Button / Stepper */}
                      <div>
                        {qtyInCart === 0 ? (
                          <button
                            type="button"
                            onClick={() => addToCart(product, 1)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 hover:border-emerald-600 transition-all active:scale-95 shadow-xs min-h-[36px] min-w-[60px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center bg-emerald-700 text-white rounded-xl shadow-xs overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, qtyInCart - 1)}
                              className="px-2.5 py-1.5 hover:bg-emerald-800 active:scale-90 transition-transform font-bold"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-black min-w-[20px] text-center">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(product.id, qtyInCart + 1)}
                              className="px-2.5 py-1.5 hover:bg-emerald-800 active:scale-90 transition-transform font-bold"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating / Sticky Bottom Cart Indicator when Cart has items */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 left-3 right-3 sm:bottom-5 sm:left-4 sm:right-4 max-w-xl mx-auto z-30 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-neutral-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-neutral-700 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black relative shrink-0">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-neutral-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <span className="text-sm sm:text-base font-black">₹{cartSubtotal.toLocaleString()}</span>
                    {cartSavings > 0 && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-950 px-1.5 sm:px-2 py-0.5 rounded truncate">
                        Saved ₹{cartSavings}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-300 truncate">
                    {cartSubtotal >= businessInfo.freeDeliveryThreshold 
                      ? '🎉 Free Express Delivery' 
                      : `Add ₹${businessInfo.freeDeliveryThreshold - cartSubtotal} for Free Delivery`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-2.5 sm:px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors hidden sm:inline-block"
                >
                  View Cart
                </button>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProductForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 relative"
            >
              <button
                type="button"
                onClick={() => setSelectedProductForDetail(null)}
                className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md text-neutral-600 hover:text-neutral-950 flex items-center justify-center shadow-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/10] bg-neutral-100 relative">
                <img
                  src={selectedProductForDetail.image}
                  alt={selectedProductForDetail.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                {selectedProductForDetail.discountPercent && (
                  <div className="absolute top-3.5 left-3.5 bg-amber-500 text-neutral-950 font-black text-xs px-2.5 py-1 rounded-lg">
                    {selectedProductForDetail.discountPercent}% OFF
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1 font-medium">
                  <span className="text-emerald-700 font-bold">{selectedProductForDetail.brand || selectedProductForDetail.category}</span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-xs font-bold text-neutral-700">
                    {selectedProductForDetail.unit}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-neutral-900 mb-2">
                  {selectedProductForDetail.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{selectedProductForDetail.rating}</span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    ({selectedProductForDetail.reviewCount} reviews)
                  </span>
                  <span className="text-emerald-700 text-xs font-semibold ml-auto flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>In Stock</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4 sm:mb-6">
                  {selectedProductForDetail.description}
                </p>

                {/* Tags */}
                {selectedProductForDetail.tags && selectedProductForDetail.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6">
                    {selectedProductForDetail.tags.map((tag) => (
                      <span key={tag} className="text-[11px] sm:text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-neutral-950">
                        ₹{selectedProductForDetail.price}
                      </span>
                      {selectedProductForDetail.originalPrice && (
                        <span className="text-xs sm:text-sm text-neutral-400 line-through">
                          ₹{selectedProductForDetail.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-neutral-500">Supermarket inclusive price</span>
                  </div>

                  <div>
                    {getCartQuantity(selectedProductForDetail.id) === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(selectedProductForDetail, 1)}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center bg-emerald-700 text-white rounded-xl shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(selectedProductForDetail.id, getCartQuantity(selectedProductForDetail.id) - 1)}
                          className="px-3 sm:px-3.5 py-2 sm:py-2.5 hover:bg-emerald-800 font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2.5 sm:px-3 text-xs sm:text-sm font-black min-w-[28px] text-center">
                          {getCartQuantity(selectedProductForDetail.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(selectedProductForDetail.id, getCartQuantity(selectedProductForDetail.id) + 1)}
                          className="px-3 sm:px-3.5 py-2 sm:py-2.5 hover:bg-emerald-800 font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
