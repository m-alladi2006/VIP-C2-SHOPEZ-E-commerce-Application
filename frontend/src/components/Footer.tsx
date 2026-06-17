import { ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto" id="footer-main">
      {/* Guarantees Section */}
      <div className="border-b border-slate-800 bg-slate-900/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Expedited Delivery</h4>
                <p className="text-xs text-slate-400">Complimentary delivery for orders above $50</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Secure Checkout</h4>
                <p className="text-xs text-slate-400">Rest assured with heavy multi-layer authentication TLS</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Easy 30-Day Returns</h4>
                <p className="text-xs text-slate-400">Hassle-free mail-in exchanges and rapid refunds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Info grids */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Col */}
          <div className="space-y-4">
            <span className="text-2xl font-bold tracking-wider text-emerald-400">
              Shop<span className="text-white">EZ</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed">
              ShopEZ makes online shopping swift, affordable, and stress-free. Access curated products from verified creators and sellers on some of the clearest grid structures ever styled.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase text-slate-100">Product Scope</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Electronics & Accessories</li>
              <li>Clothing & Outdoor Wear</li>
              <li>Home Decor & Lighting</li>
              <li>Sports, Water Bottles & Gear</li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase text-slate-100">Contact Support</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>support@shopez.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>+1 (800) 555-0150 (Mock)</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>742 Evergreen Terrace, Springfield, US</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Base line */}
        <div className="mt-12 border-t border-slate-850 pt-6 text-center text-xs text-slate-500">
          <p>© 2026 ShopEZ Inc. All rights reserved. Built with Vite, React, and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
