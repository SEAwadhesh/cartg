import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Star, 
  Users, 
  Truck, 
  ShieldCheck, 
  Leaf,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const TrustBar: React.FC = () => {
  const { businessInfo } = useData();

  const trustMetrics = [
    {
      id: 'rating',
      icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />,
      value: `${businessInfo.rating} ★`,
      label: 'Google Rating',
      sublabel: `${businessInfo.reviewCount}+ Verified Reviews`
    },
    {
      id: 'speed',
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      value: '45 Mins',
      label: 'Express Delivery',
      sublabel: `Free above ₹${businessInfo.freeDeliveryThreshold}`
    },
    {
      id: 'families',
      icon: <Users className="w-5 h-5 text-teal-600" />,
      value: `${businessInfo.customersServed.toLocaleString()}+`,
      label: 'Families Served',
      sublabel: 'Bengaluru Neighborhoods'
    },
    {
      id: 'quality',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      value: '100% Genuine',
      label: 'Branded Products',
      sublabel: 'Groceries, Stationery & Home Care'
    }
  ];

  return (
    <section className="bg-white py-8 sm:py-10 border-b border-neutral-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {trustMetrics.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-50/80 hover:bg-emerald-50/60 border border-neutral-200/80 transition-colors group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-2xl font-black text-neutral-900 leading-none mb-1">
                  {item.value}
                </div>
                <div className="text-xs font-bold text-neutral-800 leading-tight">
                  {item.label}
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-500 truncate mt-0.5">
                  {item.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
