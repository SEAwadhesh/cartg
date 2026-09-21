import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Review } from '../../types';
import { 
  Star, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Check, 
  X, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { reviews, addReview, updateReview, deleteReview, addToast, businessInfo } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add review form state
  const [customerName, setCustomerName] = useState('');
  const [customerRole, setCustomerRole] = useState('Verified Customer');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [serviceUsed, setServiceUsed] = useState('Grocery & Stationery');
  const [source, setSource] = useState<'google' | 'direct'>('google');

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      addToast('error', 'Required Fields', 'Customer name and review text are required.');
      return;
    }

    addReview({
      customerName: customerName.trim(),
      customerRole: customerRole.trim(),
      rating,
      reviewText: reviewText.trim(),
      verified: true,
      featured: false,
      active: true,
      source,
      serviceUsed: serviceUsed.trim() || undefined
    });

    addToast('success', 'Review Added', 'New review has been recorded.');
    setIsAddModalOpen(false);
    setCustomerName('');
    setReviewText('');
  };

  const handleSaveReply = (id: string) => {
    updateReview(id, { ownerResponse: replyText.trim() });
    setReplyingReviewId(null);
    setReplyText('');
    addToast('success', 'Reply Saved', 'Your response to the customer review has been published.');
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    setDeleteConfirmId(null);
    addToast('info', 'Review Deleted', 'Review removed.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Customer Reviews & Google Ratings</h1>
          <p className="text-xs text-neutral-500">Manage customer testimonials, moderate public visibility, and write official store responses</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4 hover:border-emerald-200 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={rev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.customerName)}&background=059669&color=fff`}
                  alt={rev.customerName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-neutral-900">{rev.customerName}</h3>
                    {rev.source === 'google' && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        Google Review
                      </span>
                    )}
                    {rev.featured && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">{rev.customerRole} • {rev.reviewDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateReview(rev.id, { active: !rev.active })}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    rev.active
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                  }`}
                >
                  {rev.active ? 'Published' : 'Hidden'}
                </button>

                <button
                  type="button"
                  onClick={() => updateReview(rev.id, { featured: !rev.featured })}
                  className={`p-1.5 rounded-lg text-xs font-semibold ${
                    rev.featured ? 'text-amber-600 bg-amber-50' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                  title="Toggle Featured on Homepage"
                >
                  <Star className={`w-4 h-4 ${rev.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingReviewId(rev.id);
                    setReplyText(rev.ownerResponse || '');
                  }}
                  className="p-1.5 rounded-lg text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Reply to Review"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(rev.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stars & Text */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                    }`}
                  />
                ))}
                {rev.serviceUsed && (
                  <span className="text-[11px] text-neutral-400 ml-2">
                    Service: <span className="text-neutral-700 font-medium">{rev.serviceUsed}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed italic">
                "{rev.reviewText}"
              </p>
            </div>

            {/* Official Response Section */}
            {rev.ownerResponse && replyingReviewId !== rev.id && (
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-[11px] text-emerald-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Store Official Response:</span>
                </div>
                <p className="italic text-neutral-700">"{rev.ownerResponse}"</p>
              </div>
            )}

            {/* Inline Response Form */}
            {replyingReviewId === rev.id && (
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <label className="block text-[11px] font-bold text-neutral-700">
                  Write Official Store Response to {rev.customerName}:
                </label>
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Thank you for shopping at ${businessInfo.name}! We appreciate your support...`}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingReviewId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveReply(rev.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                  >
                    Save Response
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <h3 className="text-sm font-bold text-neutral-900">Add Customer Review</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Nair"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Customer Tag</label>
                  <input
                    type="text"
                    value={customerRole}
                    onChange={(e) => setCustomerRole(e.target.value)}
                    placeholder="e.g. Regular Customer"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                  >
                    <option value="google">Google Maps Profile</option>
                    <option value="direct">Direct Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Service / Treatment Used</label>
                <input
                  type="text"
                  value={serviceUsed}
                  onChange={(e) => setServiceUsed(e.target.value)}
                  placeholder="e.g. Cardiac Consultation & ECG"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Review Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write the patient review content..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900">Delete this review?</h4>
            <p className="text-xs text-neutral-600">
              Are you sure you want to remove this patient testimonial?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
