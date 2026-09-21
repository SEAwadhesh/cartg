import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  MessageCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatWhatsAppLink } from '../utils/theme';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    setIsCheckoutOpen,
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartCount, 
    cartSubtotal, 
    cartSavings,
    businessInfo 
  } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const deliveryFee = cartSubtotal >= businessInfo.freeDeliveryThreshold || cartSubtotal === 0 ? 0 : 35;
  const grandTotal = cartSubtotal + deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / businessInfo.freeDeliveryThreshold) * 100));
  const amountNeededForFreeDelivery = Math.max(0, businessInfo.freeDeliveryThreshold - cartSubtotal);

  // Generate WhatsApp message with ordered items
  const generateWhatsAppOrderText = () => {
    let text = `🛒 *New Supermarket Order Request - CartG*\n\n`;
    text += `*Items in Cart (${cartCount}):*\n`;
    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.product.title} (${item.product.unit}) x ${item.quantity} = ₹${item.product.price * item.quantity}\n`;
    });
    text += `\n*Subtotal:* ₹${cartSubtotal}`;
    if (cartSavings > 0) text += `\n*You Saved:* ₹${cartSavings}`;
    text += `\n*Estimated Delivery Fee:* ₹${deliveryFee === 0 ? 'FREE' : deliveryFee}`;
    text += `\n*Total Payable:* ₹${grandTotal}`;
    text += `\n\nPlease confirm availability and dispatch to my address!`;
    return encodeURIComponent(text);
  };

  const whatsappOrderUrl = `https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${generateWhatsAppOrderText()}`;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsCartOpen(false);
        }
      }}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900 leading-tight">
                My Shopping Bag
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Empty shopping cart"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Threshold Progress Bar */}
        {cart.length > 0 && (
          <div className="bg-emerald-50/90 border-b border-emerald-100 p-3 px-4">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {amountNeededForFreeDelivery === 0 
                    ? '🎉 You unlocked FREE Express Delivery!' 
                    : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery`}
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        )}

        {/* Cart Item List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-3 text-emerald-600">
                🛒
              </div>
              <h3 className="text-base font-black text-neutral-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-neutral-500 max-w-xs mb-6">
                Explore our supermarket aisles to add food staples, stationery supplies, and daily household essentials.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  const catalog = document.querySelector('#catalog');
                  catalog?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all active:scale-95"
              >
                Browse Supermarket Aisles
              </button>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="pt-3.5 first:pt-0 flex items-center gap-3">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info & Title */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 truncate leading-snug">
                    {product.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-medium mb-1.5">
                    {product.unit} • <span className="font-bold text-emerald-700">₹{product.price}</span>
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 text-neutral-700 hover:bg-neutral-200 active:scale-90 font-bold transition-transform"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-neutral-900 min-w-[20px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="px-2 py-1 text-neutral-700 hover:bg-neutral-200 active:scale-90 font-bold transition-transform"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-neutral-950">
                        ₹{(product.price * quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Bill Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50/90 space-y-3">
            {/* Price Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Item Subtotal ({cartCount} items)</span>
                <span className="font-semibold text-neutral-900">₹{cartSubtotal.toLocaleString()}</span>
              </div>

              {cartSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Aisle Discount Savings</span>
                  <span>-₹{cartSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Delivery Partner Fee</span>
                <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-neutral-900 font-semibold'}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200/80 flex justify-between text-sm font-black text-neutral-950">
                <span>To Pay</span>
                <span className="text-base text-emerald-800">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Primary Checkout Button */}
            <button
              type="button"
              id="cart-proceed-checkout"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Instant WhatsApp Order Button */}
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>One-Click WhatsApp Order</span>
            </a>

            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Quality Checked • Hygienic Contactless Delivery</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
