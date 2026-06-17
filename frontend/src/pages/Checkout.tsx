import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { CartItem, User, Order } from '../types';
import { api } from '../services/api';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onClearCart: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export default function Checkout({
  cart,
  user,
  onClearCart,
  onNavigate,
}: CheckoutProps) {
  // Address Field Hooks
  const [fullName, setFullName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [phone, setPhone] = useState('');

  // Transaction Lifecycle Hooks
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  const shippingRate = subtotal >= 50 ? 0 : 10;
  const estimatedTax = subtotal * 0.08;
  const finalTotal = subtotal + shippingRate + estimatedTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !city || !postalCode || !country || !phone) {
      setError('Please fill in all shipping metadata fields.');
      return;
    }

    try {
      setPlacing(true);
      setError('');

      // Build products structure matching order controllers
      const orderProducts = cart.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));

      const payload = {
        products: orderProducts,
        totalAmount: finalTotal,
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          country,
          phone,
        },
      };

      const orderResult = await api.order.create(payload);
      
      // Store result and flush active front-end cart indicators
      setConfirmedOrder(orderResult);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'Payment processor failure. Please check inventory stock levels.');
    } finally {
      setPlacing(false);
    }
  };

  // SUCCESS CONFIRMATION WORKSPACE VIEW
  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6" id="checkout-success-panel">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-sm text-slate-500">
            Thank you for shopping with ShopEZ. Your transaction has processed successfully.
          </p>
        </div>

        {/* Invoice slip panel */}
        <div className="rounded-xl border border-slate-150 bg-white p-6 text-left shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-medium">RECEIPT CODE</span>
              <strong className="text-sm font-semibold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded select-all font-mono">{confirmedOrder._id}</strong>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-medium">SHIPPED VIA</span>
              <span className="text-xs font-bold text-slate-800 flex items-center justify-end space-x-1">
                <Truck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Expedited Cargo</span>
              </span>
            </div>
          </div>

          {/* Delivery Coordinates info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Receipt Details</h4>
              <p className="font-bold text-slate-950">{confirmedOrder.shippingAddress.fullName}</p>
              <p>{confirmedOrder.shippingAddress.phone}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1">Shipping Destination</h4>
              <p>{confirmedOrder.shippingAddress.address}</p>
              <p>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.postalCode}</p>
              <p>{confirmedOrder.shippingAddress.country}</p>
            </div>
          </div>

          {/* Math lines */}
          <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-600">Total Charged Sum</span>
            <span className="text-base font-extrabold text-emerald-700">${confirmedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Home redirects */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 rounded-md bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow"
          >
            Return to Homepage
          </button>
          
          <button
            onClick={() => onNavigate('products')}
            className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Continue retail browsing
          </button>
        </div>
      </div>
    );
  }

  // Safe checks: If user visits checkout without items, send back to products
  if (cart.length === 0) {
    return (
      <div className="text-center py-16" id="checkout-safe-guard">
        <h2 className="text-xl font-bold text-slate-800">Checkout is locked</h2>
        <p className="text-sm text-slate-500 mt-2">You must populate some items inside your catalog first.</p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 rounded-md bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
        >
          Go to Product Directory
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-6 pt-4" id="checkout-view-panel">
      
      {/* Back button row */}
      <div>
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return To Shopping Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left 7 Columns: Delivery Addresses Details form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5" id="checkout-address-form">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              <span>1. Shipping & Logistics Coordinates</span>
            </h2>

            {error && <p className="text-xs text-rose-650 bg-rose-50 p-3 rounded font-bold">{error}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Shopper"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 42 Galaxy Highway Apt 5"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Seattle"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Postal / ZIP Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 98101"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Country / Region</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. USA"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 123-456-7890"
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Payment Guarantee Notice Card */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase mb-1 flex items-center space-x-1.5">
                <CreditCard className="h-4.5 w-4.5 text-emerald-600" />
                <span>2. Payment Methods</span>
              </h3>

              <div className="rounded-lg border border-emerald-50 bg-emerald-50/15 p-4 flex items-center space-x-3 text-sm">
                <input
                  type="radio"
                  defaultChecked
                  className="h-4.5 w-4.5 border-slate-300 text-emerald-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Instant Card Authorization</span>
                  <span className="text-slate-500">Secure automated card checkout. Decrypt variables seamlessly.</span>
                </div>
              </div>
            </div>

            {/* Operational Handler placement CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={placing}
                className="w-full rounded-md bg-emerald-500 py-3.5 text-xs font-bold text-slate-900 hover:bg-emerald-600 active:bg-emerald-700 transition uppercase tracking-wider text-slate-900 font-bold flex items-center justify-center space-x-1.5"
                id="checkout-place-order-btn"
              >
                <ShieldCheck className="h-4.5 w-4.5 text-slate-954 text-slate-900" />
                <span>{placing ? 'Authorizing secure transaction...' : 'Place Order and Pay'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Columns: Locked Receipt summary */}
        <div className="lg:col-span-5" id="checkout-summary-sidebar">
          <div className="rounded-lg border border-slate-150 bg-white p-5 space-y-6 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold tracking-wider text-slate-800 uppercase border-b border-slate-100 pb-3 flex items-center space-x-1.5">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>Checkout Invoice</span>
            </h2>

            {/* Itemized scroll list */}
            <div className="max-h-64 overflow-y-auto space-y-3.5 pr-2">
              {cart.map((item) => (
                <div key={item.productId._id} className="flex justify-between items-center text-xs text-slate-600">
                  <div className="flex items-center space-x-2.5 flex-1 max-w-[70%]">
                    <img
                      src={item.productId.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
                      alt={item.productId.name}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded object-cover border border-slate-100"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 text-xs block truncate">{item.productId.name}</span>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <span className="font-bold text-slate-800 text-xs text-right">
                    ${(item.productId.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal Sum</span>
                <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping fee</span>
                <span>
                  {shippingRate === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shippingRate.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Sales Tax (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>

              {/* FINAL AGGREGATE */}
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Invoice Total</span>
                <span className="text-base text-emerald-700">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
