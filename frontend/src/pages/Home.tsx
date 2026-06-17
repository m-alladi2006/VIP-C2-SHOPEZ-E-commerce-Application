import React from 'react';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  addingCartId: string | null;
}

export default function Home({
  products,
  onNavigate,
  onAddToCart,
  addingCartId,
}: HomeProps) {
  // Select featured products (e.g. products with highest ratings)
  const featuredProducts = products
    .filter(p => p.rating >= 4.5)
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-16" id="home-view-container">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl mx-auto max-w-7xl px-6 py-16 sm:px-12 md:py-20 lg:px-16" id="home-hero">
        {/* Background Accent Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-slate-950"></div>
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-550/10 blur-3xl"></div>

        <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Hero Copy (Left) */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Delivery On All Orders Above $50</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-100">
              Effortless Shopping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Created For You
              </span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              Explore ShopEZ’s award-winning selection of high-fidelity electronics, designer clothing, minimalist livingware, and rugged outdoor travel accessories. Crafted under precision grids, enjoy lightning-fast cart calculations and automated secure checkouts today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('products')}
                className="inline-flex items-center justify-center space-x-2 rounded-md bg-emerald-550 bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow hover:bg-emerald-700 active:bg-emerald-850 transition"
                id="hero-shop-now-btn"
              >
                <span>Shop Catalog Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  // Scroll window to featured products
                  const section = document.getElementById('featured-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 px-6 py-3.5 text-sm font-semibold hover:bg-slate-800 transition text-slate-300"
              >
                <span>Browse Featured</span>
              </button>
            </div>
          </div>

          {/* Hero Graphic (Right) */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/40 p-3 shadow-2xl backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
                alt="ShopEZ Modern Workspace"
                referrerPolicy="no-referrer"
                className="w-full rounded-xl object-cover aspect-[4/3] brightness-90 shadow-inner"
              />
              <div className="absolute top-6 right-6 rounded-lg bg-slate-900/90 border border-slate-800 px-4 py-2.5 backdrop-blur shadow flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-300">Live Stock Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Segment */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="featured-section">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Products</h2>
            <p className="text-sm text-slate-500 mt-1">Handpicked best sellers with the highest shopper satisfaction rating.</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="mt-3 md:mt-0 flex items-center space-x-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>See entire catalogs</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" id="featured-products-grid">
            {featuredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
                isAdding={addingCartId === product._id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-50 border border-slate-150">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="font-bold text-slate-800">No products uploaded yet</h3>
            <p className="text-xs text-slate-500 mt-1">Please log in as an administrator to populate the catalogs.</p>
          </div>
        )}
      </section>

      {/* Trust & Category Promo Sections */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-8 transition hover:shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">Premium Tech Gears</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed">
              Equip your creative workshop with specialized active-noise audio, tactical wrist watches, and ergonomic wireless desk lighting.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-850 underline underline-offset-4"
            >
              Browse Tech Items &rarr;
            </button>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-8 transition hover:shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">Classic Apparel Styles</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed">
              Stay lightweight with all-season organic heavy denim, high-cushioned responsive sneakers, and durable modular backpack configurations.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-850 underline underline-offset-4"
            >
              Explore Clothing Range &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
