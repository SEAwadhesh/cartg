import React from 'react';
import { useData } from '../context/DataContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Lock,
  ArrowRight,
  ShoppingBag,
  Truck,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface FooterProps {
  onOpenBooking?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { businessInfo, settings, setCurrentView, setIsCartOpen } = useData();

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-14 pb-10 border-t border-neutral-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-neutral-800/80">
          
          {/* Col 1: Business Identity (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                🛒
              </div>
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  {businessInfo.name}
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  {businessInfo.category}
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed pr-4">
              {settings.footerAbout || businessInfo.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>45-Min Express Doorstep Delivery in Bengaluru</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleNavClick('#catalog')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Supermarket Aisles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Col 2: Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNavClick('#home')} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors">
                  Select Items & Order
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#about')} className="hover:text-emerald-400 transition-colors">
                  About Supermarket
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#why-us')} className="hover:text-emerald-400 transition-colors">
                  Why Shop With Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#gallery')} className="hover:text-emerald-400 transition-colors">
                  Store Tour & Aisles
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#reviews')} className="hover:text-emerald-400 transition-colors">
                  Customer Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#location')} className="hover:text-emerald-400 transition-colors">
                  Store Location & Hours
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Aisles (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Supermarket Aisles
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5">
                  <ShoppingBag className="w-3 h-3 text-emerald-500" />
                  <span>Groceries & Food Staples</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span>School & Office Stationery</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>Household Cleaning & Laundry</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors text-left">
                  <span>Personal Hygiene & Body Care</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('#catalog')} className="hover:text-emerald-400 transition-colors text-left">
                  <span>Desk Accessories & Paper Rims</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Address & Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Store & Support Desk
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{businessInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${businessInfo.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white font-semibold">
                  {businessInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${businessInfo.email}`} className="hover:text-white truncate">
                  {businessInfo.email}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={businessInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>{settings.copyrightText || `© 2026 ${businessInfo.name}. All rights reserved.`}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-emerald-400 transition-colors font-bold cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Store Manager & Admin Portal</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span className="text-neutral-500">
              CartG Bengaluru
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
