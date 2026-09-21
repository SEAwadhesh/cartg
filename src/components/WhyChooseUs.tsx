import React from 'react';
import { 
  BookOpen, 
  Truck, 
  Percent, 
  ShieldCheck, 
  Clock, 
  Store, 
  BadgeCheck, 
  Sparkles,
  ShoppingBag,
  Sparkle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';

export const WhyChooseUs: React.FC = () => {
  const { businessInfo } = useData();

  const reasons = [
    {
      icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
      title: 'Top Branded Groceries & Food Staples',
      desc: 'Premium Basmati rice, unpolished pulses, 100% whole wheat atta, cold-pressed oils, pure cow ghee, and packaged spices.'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      title: 'Complete School & Office Stationery Hub',
      desc: 'Classmate notebooks, Parker pen sets, JK Copier A4 paper rims, art materials, desk calculators, and organizers under one roof.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-teal-600" />,
      title: 'Daily Use & Household Cleaning Essentials',
      desc: 'Top brands in laundry care, floor cleaners, dishwashing gels, personal hygiene, body care, and kitchen disposables.'
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: '45-Minute Express Doorstep Delivery',
      desc: `Swift order dispatch right to your apartment gate or residence across ${businessInfo.locality} and surrounding areas.`
    },
    {
      icon: <Percent className="w-6 h-6 text-amber-600" />,
      title: 'Below MRP Prices & Aisle Combo Discounts',
      desc: 'Unbeatable value on monthly grocery baskets, stationery multipacks, and bulk household sanitization supplies.'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: 'Open 7 AM - 10:30 PM (All 7 Days)',
      desc: 'Shop early before work or pick up urgent school project stationery and kitchen supplies late in the evening with easy parking.'
    }
  ];

  return (
    <section id="why-us" className="py-14 sm:py-20 bg-white relative overflow-hidden border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Why Bengaluru Shops At CartG</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
            Top Groceries, Complete Stationery & Daily Essentials
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2.5">
            Everything your kitchen, study room, and household needs — hand-selected for authenticity, packaged with care, and delivered in minutes.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reasons.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-4 sm:p-6 rounded-2xl bg-neutral-50/80 hover:bg-emerald-50/30 border border-neutral-200/90 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-50 transition-all">
                  {r.icon}
                </div>
                <h3 className="text-base font-bold text-neutral-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {r.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/70 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>CartG Quality Standard</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
