import React, { useState } from 'react';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Home, Tag } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  cartCount: number;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onSearch: (query: string) => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  cartCount,
  currentPage,
  onNavigate,
  onSearch,
  onLogout,
}: NavbarProps) {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1e293b] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left branding */}
        <div 
          className="flex cursor-pointer items-center space-x-2"
          onClick={() => { setLocalSearch(''); onSearch(''); onNavigate('home'); }}
          id="navbar-brand-logo"
        >
          <span className="text-2xl font-bold tracking-wider text-emerald-400">
            Shop<span className="text-white">EZ</span>
          </span>
        </div>

        {/* Center Search Input */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="mx-4 flex max-w-lg flex-1 items-center"
          id="navbar-search-form"
        >
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 outline-none ring-offset-slate-900 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>

        {/* Right Nav Options */}
        <nav className="flex items-center space-x-4 sm:space-x-6" id="navbar-links">
          <button
            onClick={() => { setLocalSearch(''); onSearch(''); onNavigate('home'); }}
            className={`flex items-center space-x-1 text-sm font-medium transition hover:text-emerald-400 ${
              currentPage === 'home' ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className={`flex items-center space-x-1 text-sm font-medium transition hover:text-emerald-400 ${
              currentPage === 'products' ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </button>

          {/* Cart Icon with Counter */}
          <button
            onClick={() => onNavigate('cart')}
            className="group relative flex items-center p-1 text-slate-300 transition hover:text-emerald-400"
            id="navbar-cart-button"
            title="View Cart"
          >
            <ShoppingCart className="h-6 w-6 text-slate-300 transition group-hover:text-emerald-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account States */}
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs text-slate-400 font-medium">Hello,</span>
                <span className="text-sm font-semibold text-emerald-300 max-w-[120px] truncate">{user.name}</span>
              </div>

              {/* Admin Button if user.role is admin */}
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center space-x-1 rounded-md bg-emerald-650 px-3 py-1.5 text-xs font-semibold text-emerald-900 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition ${
                    currentPage === 'admin' ? 'bg-emerald-500 text-white' : 'bg-emerald-950/40 text-emerald-450'
                  }`}
                  id="navbar-admin-dash-button"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-sm font-medium text-slate-300 hover:text-rose-400 transition"
                id="navbar-logout-btn"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center space-x-1.5 rounded-full border border-emerald-500/30 px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 hover:border-emerald-500 transition"
              id="navbar-login-btn"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
