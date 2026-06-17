import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, HelpCircle, Check, Search } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface ProductsProps {
  products: Product[];
  searchQuery: string;
  onClearSearch: () => void;
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  addingCartId: string | null;
}

const CATEGORIES = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Living',
  'Sports & Outdoors',
];

export default function Products({
  products,
  searchQuery,
  onClearSearch,
  onNavigate,
  onAddToCart,
  addingCartId,
}: ProductsProps) {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Buffer state to hold values before clicking dynamic Filter Validation Button
  const [categoryBuffer, setCategoryBuffer] = useState('All');
  const [priceBuffer, setPriceBuffer] = useState(250);

  // Trigger filters compilation
  const handleApplyFilters = () => {
    setSelectedCategory(categoryBuffer);
    setMaxPrice(priceBuffer);
    setShowFiltersMobile(false);
  };

  const handleResetFilters = () => {
    setCategoryBuffer('All');
    setPriceBuffer(250);
    setSelectedCategory('All');
    setMaxPrice(250);
    setSortBy('featured');
    onClearSearch();
  };

  // Filtered and Sorted products computed cache
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Filter by Price Limit
    result = result.filter(p => p.price <= maxPrice);

    // 4. Sort Products
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, selectedCategory, maxPrice, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-6" id="products-view">
      
      {/* Title Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Explore Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? (
              <span className="inline-flex items-center space-x-1">
                <span>Showing search matches for: </span>
                <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">"{searchQuery}"</strong>
              </span>
            ) : (
              'Browse all products, configure dynamic filters, or sort by pricing models.'
            )}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1.5 text-sm">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-emerald-500 outline-none"
              title="Sort Products"
            >
              <option value="featured">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated Only</option>
            </select>
          </div>

          {/* Collapsible Mobile Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* Left Column Sidebar Filters (Desktop View) */}
        <aside className="hidden md:block space-y-6" id="products-desktop-sidebar">
          <div className="rounded-lg border border-slate-150 bg-white p-5 space-y-6 shadow-sm">
            
            {/* Header / Reset button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-800 uppercase flex items-center space-x-1.5">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <span>Filters Sidebar</span>
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category Selection</h3>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={categoryBuffer === category}
                      onChange={() => setCategoryBuffer(category)}
                      className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-sm transition group-hover:text-emerald-700 ${categoryBuffer === category ? 'text-emerald-600 font-semibold' : 'text-slate-600'}`}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-400">Max Budget</h3>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${priceBuffer}</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={priceBuffer}
                onChange={(e) => setPriceBuffer(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-emerald-600"
                title="Max Budget Slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>$10</span>
                <span>$300</span>
              </div>
            </div>

            {/* Apply filters button */}
            <button
              onClick={handleApplyFilters}
              className="w-full rounded-md bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:bg-emerald-850 shadow-sm transition"
              id="sidebar-apply-filters-btn"
            >
              Apply Filter Params
            </button>
          </div>
        </aside>

        {/* Floating Mobile Sidebar Overlays */}
        {showFiltersMobile && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowFiltersMobile(false)}
            ></div>

            {/* Sliding Panel */}
            <div className="relative z-10 w-full max-w-sm bg-white p-6 shadow-xl flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <h2 className="text-base font-bold text-slate-900">Custom Filtering</h2>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="rounded-full p-1.5 hover:bg-slate-100 transition text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                {/* Categories */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-slate-400Selector">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map(category => (
                      <label key={category} className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="mobile-category"
                          checked={categoryBuffer === category}
                          onChange={() => setCategoryBuffer(category)}
                          className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={`text-sm ${categoryBuffer === category ? 'text-emerald-600 font-semibold' : 'text-slate-600'}`}>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-400">Max Budget</h3>
                    <span className="font-bold text-emerald-700">${priceBuffer}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={priceBuffer}
                    onChange={(e) => setPriceBuffer(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-slate-100 appearance-none cursor-pointer accent-emerald-600"
                    title="Mobile Price Slider"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Reset All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 rounded-md bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Product Grid */}
        <div className="lg:col-span-3 transition-opacity">
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-bold tracking-wider">
              TOTAL RECORDS MATCHED: {processedProducts.length}
            </span>
            {(selectedCategory !== 'All' || maxPrice < 250 || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-650 hover:text-rose-800 transition"
              >
                Clear current filter tags
              </button>
            )}
          </div>

          {processedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3" id="products-catalog-grid">
              {processedProducts.map(product => (
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
            <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <HelpCircle className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-800 text-lg">No results match your criteria</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">
                Try widening your price range barriers, clearing search string variables, or browsing alternative product categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Clear active filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
