import React from 'react';
import { Star, ShoppingCart, View } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: any;
  product: Product;
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  isAdding: boolean;
}

export default function ProductCard({
  product,
  onNavigate,
  onAddToCart,
  isAdding,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-emerald-100"
      id={`product-card-${product._id}`}
    >
      {/* Upper Thumbnail Layer */}
      <div 
        className="relative aspect-square overflow-hidden bg-slate-50 cursor-pointer"
        onClick={() => onNavigate('product-details', { productId: product._id })}
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />

        {/* Stock Alert Overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Out Of Stock
            </span>
          </div>
        ) : product.stock <= 3 ? (
          <div className="absolute top-2 left-2">
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow">
              Only {product.stock} Left!
            </span>
          </div>
        ) : null}

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-2 right-2 flex flex-col space-y-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('product-details', { productId: product._id });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-md hover:bg-emerald-500 hover:text-white transition"
            title="View Details"
          >
            <View className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Content description container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold text-slate-400 tracking-wide uppercase text-[10px]">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{product.rating || 'N/A'}</span>
            <span className="text-[10px] text-slate-400">({product.reviews?.length || 0})</span>
          </div>
        </div>

        {/* Title */}
        <h3 
          className="text-sm font-semibold text-slate-800 hover:text-emerald-600 cursor-pointer transition line-clamp-1 mb-2"
          onClick={() => onNavigate('product-details', { productId: product._id })}
        >
          {product.name}
        </h3>

        {/* Product description segment */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Product Pricing & Action Row */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">PRICE</span>
            <span className="text-lg font-extrabold text-emerald-700">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={() => onAddToCart(product._id, 1)}
            disabled={isOutOfStock || isAdding}
            className={`flex h-9 items-center justify-center space-x-1.5 rounded-md px-3.5 text-xs font-semibold shadow-sm transition ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-850'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{isAdding ? 'Adding...' : 'Buy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
