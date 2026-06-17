import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, AlertCircle, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (page: string, params?: any) => void;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}: CartProps) {
  
  // Math calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  
  // Custom promotional rule: Free shipping for orders above $50, else $10 shipping
  const shippingRate = subtotal >= 50 || subtotal === 0 ? 0 : 10;
  
  const estimatedTax = subtotal * 0.08; // 8% sales tax estimate
  const finalTotal = subtotal + shippingRate + estimatedTax;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4" id="cart-empty-view">
        <div className="rounded-full bg-slate-50 p-4 inline-block mb-3 border border-slate-100 text-slate-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your shopping cart is empty</h2>
        <p className="text-sm text-slate-500 mt-2">
          Looks like you haven't added any products to your active container yet. Enjoy risk-free browsing of our curated catalog.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 rounded-md bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-6 pt-4" id="cart-view-container">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center space-x-2.5">
          <ShoppingCart className="h-7 w-7 text-emerald-600" />
          <span>Your Shopping Cart</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review active checkout items, modify allocations, and manage invoices.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left 8 Columns: Cart Items Grid list */}
        <div className="lg:col-span-8 space-y-4" id="cart-items-list">
          {cart.map((item) => {
            const prod = item.productId;
            const itemTotal = prod.price * item.quantity;
            const isNearOutOfStock = prod.stock <= item.quantity;

            return (
              <div 
                key={prod._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border border-slate-100 shadow-sm gap-4 transition hover:border-emerald-50"
              >
                {/* Product details block */}
                <div 
                  className="flex items-center space-x-4 cursor-pointer flex-1"
                  onClick={() => onNavigate('product-details', { productId: prod._id })}
                >
                  <img
                    src={prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-md object-cover border border-slate-100 bg-slate-50 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{prod.category}</span>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-emerald-600 line-clamp-1 mt-0.5">{prod.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-400 font-medium">Unit Price:</span>
                      <span className="text-xs font-bold text-emerald-700">${prod.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantitative adjustment step modifiers & math indicators */}
                <div className="flex flex-row items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                  
                  {/* Step Buttons */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-center">QUANTITY</span>
                    <div className="flex items-center rounded-md border border-slate-250 bg-slate-50 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(prod._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200 transition disabled:opacity-30"
                        title="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-extrabold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(prod._id, item.quantity + 1)}
                        disabled={prod.stock <= item.quantity}
                        className="p-1 rounded text-slate-500 hover:bg-slate-200 transition disabled:opacity-30"
                        title="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing Sum */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">SUBTOTAL</span>
                    <span className="text-sm font-extrabold text-slate-800">${itemTotal.toFixed(2)}</span>
                  </div>

                  {/* Delete Trash Row */}
                  <button
                    onClick={() => onRemoveItem(prod._id)}
                    className="p-2 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition self-end sm:self-center"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Delivery threshold indicator banner */}
          <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/50 flex items-start space-x-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-650 leading-normal">
              {subtotal >= 50 ? (
                <span>🎉 <strong>Congratulations!</strong> Your order qualifies for free delivery because your subtotal is over $50!</span>
              ) : (
                <span>Add <strong>${(50 - subtotal).toFixed(2)}</strong> more to unlock our <strong>Free Expedited Delivery</strong> offer!</span>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Order Summary Card */}
        <div className="lg:col-span-4" id="cart-summary-sidebar">
          <div className="rounded-lg border border-slate-150 bg-white p-5 space-y-6 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold tracking-wider text-slate-800 uppercase border-b border-slate-100 pb-3 flex items-center space-x-2">
              <span>Order Summary</span>
            </h2>

            {/* Calculations Rows */}
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {shippingRate === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shippingRate.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Estimated Total Sum</span>
                <span className="text-base text-emerald-700">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA action trigger */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full flex items-center justify-center space-x-2 rounded-md bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-850 transition"
                id="cart-checkout-btn"
              >
                <span>Proceed To secure Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onNavigate('products')}
                className="w-full rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Continue general shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
