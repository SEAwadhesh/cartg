import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({ isOpen, onClose }) => {
  const { addReview, addToast, businessInfo } = useData();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Verified Customer');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [serviceUsed, setServiceUsed] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      addToast('error', 'Required Fields', 'Please enter your name and feedback.');
      return;
    }

    addReview({
      customerName: name.trim(),
      customerRole: role.trim() || 'Verified Customer',
      rating,
      reviewText: reviewText.trim(),
      verified: true,
      featured: false,
      active: true,
      source: 'direct',
      serviceUsed: serviceUsed.trim() || 'Groceries & Household Essentials'
    });

    setIsSubmitted(true);
    addToast('success', 'Thank You!', 'Your review has been recorded.');
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setName('');
    setRole('Verified Customer');
    setRating(5);
    setReviewText('');
    setServiceUsed('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base font-black">Write a Customer Review</h3>
              <p className="text-xs text-emerald-100">{businessInfo.name}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-black text-neutral-900 mb-1">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto mb-6">
                  Your feedback helps us continuously improve the supermarket shopping experience for families in Bengaluru.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Your Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-neutral-300 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${
                            (hoverRating !== null ? star <= hoverRating : star <= rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-700 ml-1 sm:ml-2">
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name & Purchased */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Sundaram"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Items / Aisle Shopped
                    </label>
                    <input
                      type="text"
                      value={serviceUsed}
                      onChange={(e) => setServiceUsed(e.target.value)}
                      placeholder="e.g. Basmati Rice, Parker Pens & Detergent"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                {/* Review Message */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Shopping Experience & Product Quality <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about item freshness, delivery speed, store cleanliness, pricing, or billing experience..."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Submit Supermarket Review
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
