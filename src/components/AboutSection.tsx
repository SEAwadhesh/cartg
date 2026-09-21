import React from 'react';
import { useData } from '../context/DataContext';
import { 
  CheckCircle2, 
  MapPin, 
  Store, 
  Truck, 
  Leaf, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface AboutSectionProps {
  onOpenBooking?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = () => {
  const { businessInfo, setIsCartOpen } = useData();

  const coreValues = [
    {
      title: 'Top Branded Groceries & Staples',
      desc: '100% genuine Atta, Basmati rice, pulses, cold-pressed oils, pure cow ghee, spices, and premium packaged foods.'
    },
    {
      title: 'Complete Stationery & Art Hub',
      desc: 'Spiral notebooks, registers, branded Parker pens, copier paper rims, art materials, desk calculators, and files.'
    },
    {
      title: 'Daily Home Care & Personal Hygiene',
      desc: 'Trusted laundry detergents, dishwashing liquids, disinfectant floor cleaners, oral care, and paper towels.'
    },
    {
      title: '45-Minute Doorstep Delivery',
      desc: 'Swift neighborhood fleet ready to pack and dispatch your online cart orders right to your doorstep across Bengaluru.'
    }
  ];

  const scrollToCatalog = () => {
    const catalog = document.querySelector('#catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-14 sm:py-20 bg-white relative border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>About CartG Supermarket</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
            Your Trusted Neighborhood Supermarket for Groceries, Stationery & Daily Essentials
          </h2>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Business Story & Values */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-medium">
              {businessInfo.description}
            </p>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Located conveniently in <span className="font-bold text-neutral-900">{businessInfo.locality}, {businessInfo.city}</span>, CartG Supermarket provides wide shopping aisles, clean carts, fully categorized stationery & grocery racks, and friendly staff ready to assist your weekly shopping.
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {coreValues.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">{val.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all w-full sm:w-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Items Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={businessInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-neutral-800 hover:text-emerald-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors w-full sm:w-auto"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Visit Store in {businessInfo.locality}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Supermarket Visual Composite */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md">
              {/* Primary Store Image */}
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-neutral-100 aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                  alt="CartG Supermarket Grocery & Stationery Aisles"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Overlay Stat Card */}
              <div className="absolute -bottom-4 left-2 sm:-left-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-2xl max-w-[calc(100%-1rem)] sm:max-w-[260px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
                    <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl font-black text-neutral-950 leading-tight">
                      {businessInfo.experienceYears}+ Years
                    </div>
                    <div className="text-xs text-neutral-600 font-semibold truncate">
                      Serving Bengaluru Daily
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Right Floating Badge */}
              <div className="absolute -top-3 right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-neutral-200 shadow-lg flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-neutral-900">100% Quality Checked</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
