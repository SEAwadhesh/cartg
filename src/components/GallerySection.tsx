import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { 
  Sparkles, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Store,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GallerySection: React.FC = () => {
  const { gallery } = useData();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const activeGallery = useMemo(() => {
    return gallery
      .filter((g) => g.active)
      .sort((a, b) => a.order - b.order);
  }, [gallery]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    activeGallery.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return ['All', ...Array.from(cats)];
  }, [activeGallery]);

  const filteredItems = useMemo(() => {
    if (selectedTag === 'All') return activeGallery;
    return activeGallery.filter((g) => g.category === selectedTag);
  }, [activeGallery, selectedTag]);

  // Keyboard navigation for lightbox
  const handlePrev = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => 
      prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : 0
    );
  }, [activeLightboxIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => 
      prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : 0
    );
  }, [activeLightboxIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, handlePrev, handleNext]);

  return (
    <section id="gallery" className="py-14 sm:py-20 bg-neutral-50/70 border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supermarket Experience & Aisles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              A Glimpse Inside CartG Supermarket
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Explore our organized grocery shelves, dedicated stationery department, and spotless household essentials aisles.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedTag(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === cat
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              onClick={() => setActiveLightboxIndex(index)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[4/3]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Top Category Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/80 backdrop-blur-md text-[11px] font-semibold text-white">
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>{item.category}</span>
              </div>

              {/* View Full Icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xs">
                <h3 className="text-xs font-bold text-neutral-900 leading-tight truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && filteredItems[activeLightboxIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors z-50 cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Previous Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors z-50 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors z-50 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Lightbox Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 max-h-[70vh]">
                <img
                  src={filteredItems[activeLightboxIndex].imageUrl}
                  alt={filteredItems[activeLightboxIndex].title}
                  className="max-h-[70vh] w-auto object-contain mx-auto"
                />
              </div>

              {/* Caption Card */}
              <div className="mt-4 p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-white max-w-xl w-full text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                  <Tag className="w-3 h-3" />
                  <span>{filteredItems[activeLightboxIndex].category}</span>
                  <span>•</span>
                  <span>{activeLightboxIndex + 1} of {filteredItems.length}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-100">
                  {filteredItems[activeLightboxIndex].title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {filteredItems[activeLightboxIndex].caption}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
