import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MessageCircle, Phone, ArrowUp, ShoppingCart } from 'lucide-react';
import { formatWhatsAppLink } from '../utils/theme';

export const FloatingActions: React.FC = () => {
  const { businessInfo, cartCount, cartSubtotal, setIsCartOpen } = useData();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-5 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="pointer-events-auto p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
          aria-label="Scroll to top of page"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Floating Cart Button (when items in cart) */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="pointer-events-auto group flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white"
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span className="font-bold text-xs">₹{cartSubtotal.toLocaleString()}</span>
        </button>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={formatWhatsAppLink(businessInfo.whatsapp, businessInfo.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group flex items-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba59] transition-all hover:scale-105 active:scale-95 border-2 border-white"
        aria-label="Chat with CartG on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-white" />
        <span className="hidden sm:inline font-bold text-xs">Store WhatsApp</span>
      </a>
    </div>
  );
};
