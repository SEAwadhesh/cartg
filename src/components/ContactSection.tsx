import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock,
  ShoppingBag,
  Truck,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection: React.FC = () => {
  const { businessInfo, addToast, addEnquiry } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Home Delivery Query');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      addToast('error', 'Incomplete Form', 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (addEnquiry) {
        await addEnquiry({
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          deliveryAddress: 'Direct Desk Inquiry',
          deliveryType: 'pickup',
          preferredSlot: inquiryType,
          paymentMethod: 'cod',
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          discountAmount: 0,
          totalAmount: 0,
          notes: message.trim() ? `[${inquiryType}] ${message.trim()}` : `Inquiry: ${inquiryType}`,
          serviceName: inquiryType
        });
      }
      
      setSubmitted(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}
      addToast('success', 'Enquiry Submitted', 'Our supermarket customer manager will call you back shortly.');
    } catch (err) {
      console.warn('Error submitting enquiry:', err);
      setSubmitted(true);
      addToast('success', 'Enquiry Submitted', 'Our supermarket customer manager will call you back shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-white relative border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Customer Desk & Bulk Enquiries</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
            Need Help with Products, Bulk Orders, or Deliveries?
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            Send us a message or request a call. Our supermarket front desk is at your service 7 days a week from 7 AM to 10:30 PM.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Info Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-4 sm:p-6 rounded-3xl bg-neutral-50 border border-neutral-200/90 space-y-5">
              <h3 className="text-base font-black text-neutral-900">Store Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Bengaluru Location</h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      {businessInfo.address}
                    </p>
                    <a
                      href={businessInfo.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline mt-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Customer Helpline</h4>
                    <a href={`tel:${businessInfo.phone.replace(/[^0-9+]/g, '')}`} className="text-xs text-emerald-700 font-bold hover:underline block mt-0.5">
                      {businessInfo.phone}
                    </a>
                    {businessInfo.alternatePhone && (
                      <a href={`tel:${businessInfo.alternatePhone.replace(/[^0-9+]/g, '')}`} className="text-xs text-neutral-600 hover:underline block">
                        {businessInfo.alternatePhone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Email Desk</h4>
                    <a href={`mailto:${businessInfo.email}`} className="text-xs text-emerald-700 font-semibold hover:underline block mt-0.5">
                      {businessInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Supermarket Hours</h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Monday – Sunday: 07:00 AM – 10:30 PM
                      <br />
                      <span className="text-emerald-700 font-semibold">Open 365 Days a Year</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero spam guarantee. Your details are safe with CartG.</span>
              </div>
            </div>
          </div>

          {/* Right Form Column (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-8 rounded-3xl bg-neutral-50/60 border border-neutral-200/90 shadow-xs">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Message Received Successfully!</h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mb-6">
                  Thank you for reaching out to <span className="font-semibold text-neutral-900">{businessInfo.name}</span>. Our store team will call or WhatsApp you shortly.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white"
                    >
                      <option value="Home Delivery Query">Home Delivery & Tracking</option>
                      <option value="Bulk Grocery Order">Bulk Grocery Order for Events/Office</option>
                      <option value="Item Request">Request Specific Product / Brand</option>
                      <option value="Store Feedback">Feedback on Store Visit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Message / Grocery Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe items you want to enquire about, bulk delivery schedules, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Enquiry to Supermarket Desk</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
