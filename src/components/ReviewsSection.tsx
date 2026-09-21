import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Star, 
  ShieldCheck, 
  MessageSquarePlus, 
  ExternalLink, 
  Sparkles, 
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { LeaveReviewModal } from './LeaveReviewModal';
import { motion } from 'motion/react';

export const ReviewsSection: React.FC = () => {
  const { reviews, businessInfo } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const activeReviews = useMemo(() => {
    return reviews.filter((r) => r.active);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'all') return activeReviews;
    return activeReviews.filter((r) => r.rating === ratingFilter);
  }, [activeReviews, ratingFilter]);

  return (
    <section id="reviews" className="py-14 sm:py-20 bg-white relative border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2.5 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Real Customer Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              Trusted by 35,000+ Happy Families Across Bengaluru
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              Verified feedback from local families and residents who rely on CartG Supermarket for daily fresh groceries and fast delivery.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 shadow-xs transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Store Review</span>
            </button>

            <a
              href={businessInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </a>
          </div>
        </div>

        {/* Rating Overview Banner */}
        <div className="p-4 sm:p-7 rounded-3xl bg-neutral-50 border border-neutral-200/90 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          
          {/* Big Score Box */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-neutral-950 leading-none">
                {businessInfo.rating}
              </div>
              <div className="flex items-center gap-1 my-1.5 sm:my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-neutral-600">
                Overall Google Score ({businessInfo.reviewCount}+ reviews)
              </p>
            </div>

            <div className="hidden sm:block h-14 w-px bg-neutral-200" />

            <div className="hidden sm:block text-xs text-neutral-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-neutral-800">100% Genuine Bengaluru Residents</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Clean Aisles & Certified Weight Scales</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 mr-1 hidden sm:inline">Filter:</span>
            <button
              type="button"
              onClick={() => setRatingFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ratingFilter === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              All Reviews ({activeReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setRatingFilter(5)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ratingFilter === 5
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>5 Stars</span>
            </button>
          </div>

        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-neutral-50/60 hover:bg-white border border-neutral-200/90 hover:border-emerald-300 hover:shadow-md transition-all duration-300 relative group"
            >
              <div>
                {/* Header: Avatar, Name, Rating */}
                <div className="flex items-start justify-between gap-4 mb-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customerName)}&background=059669&color=fff`}
                      alt={review.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                        {review.customerName}
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {review.customerRole || 'Verified Customer'}
                      </p>
                    </div>
                  </div>

                  {review.source === 'google' && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      Google
                    </span>
                  )}
                </div>

                {/* Star Rating & Date */}
                <div className="flex items-center justify-between mb-2.5 text-xs">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400">{review.reviewDate}</span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic mb-3">
                  "{review.reviewText}"
                </p>

                {/* Service Tag */}
                {review.serviceUsed && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-semibold mb-3">
                    <span className="text-neutral-400">Purchased:</span>
                    <span>{review.serviceUsed}</span>
                  </div>
                )}
              </div>

              {/* Store Response (if any) */}
              {review.ownerResponse && (
                <div className="mt-3 pt-3 border-t border-neutral-200/70 bg-emerald-50/60 p-3 rounded-xl text-xs text-neutral-700">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Response from CartG Supermarket</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed italic">
                    "{review.ownerResponse}"
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>

      {/* Leave Review Modal */}
      <LeaveReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
