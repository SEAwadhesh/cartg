import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  X, 
  CheckCircle, 
  Truck, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  ArrowLeft, 
  MessageCircle, 
  Printer, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { DeliveryType, PaymentMethod, SupermarketOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  onClose?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = () => {
  const { 
    cart, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cartCount, 
    cartSubtotal, 
    cartSavings, 
    businessInfo, 
    createOrder 
  } = useData();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Express 45-Mins (Immediate Dispatch)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  
  const [placedOrder, setPlacedOrder] = useState<SupermarketOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
      }
    };
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCheckoutOpen, setIsCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const deliveryFee = deliveryType === 'pickup' || cartSubtotal >= businessInfo.freeDeliveryThreshold ? 0 : 35;
  const totalAmount = cartSubtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert('Please provide your name and phone number.');
      return;
    }
    if (deliveryType === 'delivery' && !addressLine.trim()) {
      alert('Please enter your full delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const finalAddress = deliveryType === 'pickup' 
        ? `Store Pickup at ${businessInfo.name} (${businessInfo.address})`
        : `${addressLine}${landmark ? `, Landmark: ${landmark}` : ''}, ${businessInfo.city} - ${businessInfo.postalCode}`;

      const res = await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/[^0-9]/g, '')}@cartg.customer`,
        deliveryAddress: finalAddress,
        deliveryType,
        preferredSlot,
        paymentMethod,
        items: orderItems,
        subtotal: cartSubtotal,
        deliveryFee,
        discountAmount: cartSavings,
        totalAmount,
        notes: orderNotes.trim()
      });

      if (res.success && res.order) {
        setPlacedOrder(res.order);
      } else {
        alert(res.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Error placing order:', err);
      alert('An unexpected error occurred while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Order Confirmed Screen */}
        {placedOrder ? (
          <div className="p-5 sm:p-8 text-center overflow-y-auto max-h-[92vh]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <span className="bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Order Confirmed & Sent to Packing Station
            </span>

            <h2 className="text-xl sm:text-3xl font-black text-neutral-950 mt-3 mb-1">
              Thank You, {placedOrder.customerName}!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-5 sm:mb-6">
              Your grocery order <span className="font-extrabold text-emerald-800">#{placedOrder.orderNumber}</span> has been received. Our team at CartG is picking and packing your items fresh.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-neutral-50 rounded-2xl p-3.5 sm:p-5 border border-neutral-200 text-left text-xs mb-5 sm:mb-6 space-y-3">
              <div className="flex justify-between font-bold text-neutral-800 border-b border-neutral-200 pb-2">
                <span>Order No: #{placedOrder.orderNumber}</span>
                <span>{new Date(placedOrder.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="space-y-1.5 max-h-36 sm:max-h-40 overflow-y-auto pr-1">
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-neutral-700">
                    <span className="truncate pr-2">{item.title} ({item.unit}) x {item.quantity}</span>
                    <span className="font-bold shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-2 space-y-1 font-medium">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₹{placedOrder.subtotal}</span>
                </div>
                {placedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Savings</span>
                    <span>-₹{placedOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span>{placedOrder.deliveryFee === 0 ? 'FREE' : `₹${placedOrder.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-950 pt-1 border-t border-neutral-200">
                  <span>Total Amount Payable</span>
                  <span className="text-emerald-800">₹{placedOrder.totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500">
                <p><strong>Fulfillment:</strong> {placedOrder.deliveryType === 'delivery' ? 'Express Doorstep Delivery' : 'In-Store Pickup'}</p>
                <p className="truncate"><strong>Destination:</strong> {placedOrder.deliveryAddress}</p>
                <p><strong>Payment:</strong> {placedOrder.paymentMethod.toUpperCase()} on arrival</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <a
                href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi CartG, I just placed order #${placedOrder.orderNumber} for ₹${placedOrder.totalAmount}. Please confirm dispatch status!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Track Rider on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all"
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-black text-neutral-900 leading-tight truncate">
                    Checkout & Place Order
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium truncate">
                    {cartCount} items • Total: ₹{totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
              
              {/* Delivery Type Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  1. Choose Delivery Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${deliveryType === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Home Delivery</p>
                      <p className="text-[11px] text-neutral-500">45-min doorstep delivery</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${deliveryType === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">In-Store Pickup</p>
                      <p className="text-[11px] text-neutral-500">Ready in 15-20 mins</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  2. Contact & Delivery Details
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajesh Kumar"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Delivery Address (Flat / House No, Apartment / Society, Street) *
                        </label>
                        <div className="relative">
                          <textarea
                            required
                            rows={2}
                            placeholder="Flat 302, Palm Heights, 17th Cross Road, HSR Layout Sector 2"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Nearest Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Near BDA Complex / ICICI Bank"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                            Delivery Slot
                          </label>
                          <select
                            value={preferredSlot}
                            onChange={(e) => setPreferredSlot(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="Express 45-Mins (Immediate Dispatch)">⚡ Express 45-Mins (Immediate)</option>
                            <option value="Today Afternoon (01:00 PM - 04:00 PM)">Today Afternoon (01:00 PM - 04:00 PM)</option>
                            <option value="Today Evening (05:00 PM - 08:30 PM)">Today Evening (05:00 PM - 08:30 PM)</option>
                            <option value="Tomorrow Morning (07:30 AM - 10:30 AM)">Tomorrow Morning (07:30 AM - 10:30 AM)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  3. Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span>UPI / QR on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span>Card / POS Machine</span>
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Delivery Instructions for Rider (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please ring bell, leave at security gate if not available"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Bill Breakdown in Checkout */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Groceries Subtotal ({cartCount} items)</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                {cartSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Savings</span>
                    <span>-₹{cartSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Charges</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between font-black text-neutral-950 text-sm">
                  <span>Total Amount</span>
                  <span className="text-emerald-800">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Order to Database...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>
                        <span className="hidden min-[480px]:inline">Confirm & Place Supermarket Order</span>
                        <span className="min-[480px]:hidden">Place Order</span> (₹{totalAmount})
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
