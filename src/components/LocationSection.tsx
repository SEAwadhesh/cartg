import React from 'react';
import { useData } from '../context/DataContext';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle, 
  Sparkles,
  ExternalLink,
  Car,
  ShoppingBag
} from 'lucide-react';
import { getOpenStatus, formatWhatsAppLink } from '../utils/theme';

export const LocationSection: React.FC = () => {
  const { businessInfo } = useData();
  const openStatus = getOpenStatus(businessInfo.openingHours);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];

  return (
    <section id="location" className="py-14 sm:py-20 bg-neutral-50/80 border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Store Location & Operating Schedule</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
            Visit CartG Supermarket in Bengaluru
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            Spacious store in HSR Layout, Bengaluru with dedicated customer car parking, wide aisles, and wheelchair accessibility.
          </p>
        </div>

        {/* Grid: Map & Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Map Embed Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl bg-white border border-neutral-200/90 shadow-md overflow-hidden">
            {/* Live Status Bar */}
            <div className="p-4 sm:p-5 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${openStatus.isOpenNow ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-400/20' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">{openStatus.statusText}</p>
                  <p className="text-[11px] text-neutral-400">Today's Store Hours: {openStatus.todayHours}</p>
                </div>
              </div>

              <a
                href={businessInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Store Directions</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>
            </div>

            {/* Google Maps Embed iframe */}
            <div className="relative aspect-[16/10] w-full bg-neutral-100">
              <iframe
                title="Google Maps Location"
                src={businessInfo.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Bottom Address Details */}
            <div className="p-4 sm:p-6 bg-white border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Bengaluru Location</h4>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    {businessInfo.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-600 shrink-0">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Dedicated Customer Parking</span>
              </div>
            </div>
          </div>

          {/* Schedule & Contact Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            
            {/* 7-Day Timings Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-neutral-900">Supermarket Opening Hours</h3>
              </div>

              <div className="space-y-1.5">
                {businessInfo.openingHours.map((h) => {
                  const isToday = h.day.toLowerCase() === todayName.toLowerCase();
                  return (
                    <div
                      key={h.day}
                      className={`flex items-center justify-between py-2 px-2.5 sm:px-3 rounded-xl text-xs transition-colors ${
                        isToday
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span>{h.day}</span>
                        {isToday && (
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {h.isOpen ? (
                          <span className="font-semibold">{h.openTime} – {h.closeTime}</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Closed</span>
                        )}
                        {h.note && (
                          <span className="block text-[10px] text-neutral-400 font-normal">
                            {h.note}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Contact Action Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-lg space-y-4">
              <div>
                <h3 className="text-base font-black text-white">Direct Store Customer Desk</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Call or WhatsApp our supermarket manager for stock inquiries, bulk orders, or delivery updates.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <a
                  href={`tel:${businessInfo.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold text-white truncate"
                >
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">{businessInfo.phone}</span>
                </a>

                <a
                  href={formatWhatsAppLink(businessInfo.whatsapp, businessInfo.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-400/30 transition-colors text-xs font-semibold text-white truncate"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">WhatsApp: {businessInfo.whatsapp}</span>
                </a>

                <a
                  href={`mailto:${businessInfo.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs text-emerald-100 truncate"
                >
                  <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="truncate">{businessInfo.email}</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
