import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { Product, CartItem, User } from './types';
import { api } from './services/api';
import { AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  // --- GLOBAL STATES ---
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Navigation State Layouts
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentPageParams, setCurrentPageParams] = useState<any>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Loading States
  const [booting, setBooting] = useState<boolean>(true);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  
  // Global Notice Toast Alerts
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'amber' | 'info'>('success');

  // --- INITIAL MOUNT ON LOAD ---

  useEffect(() => {
    async function bootApplication() {
      try {
        setBooting(true);
        
        // 1. Fetch available products catalog
        const fetchedProducts = await api.products.getAll();
        setProducts(fetchedProducts);

        // 2. Hydrate shopper profile if token resides in local storage
        const token = localStorage.getItem('shopez_token');
        if (token) {
          try {
            const profile = await api.auth.getProfile();
            setUser(profile);
            
            // 3. Hydrate active user cart
            const cartItems = await api.cart.get();
            setCart(cartItems);
          } catch (tokenErr) {
            console.warn('[ShopEZ Auth] Stale authorization credentials detected. Purging.');
            localStorage.removeItem('shopez_token');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('[ShopEZ Boot Error] Critical crash seeding catalogs:', err);
      } finally {
        setBooting(false);
      }
    }

    bootApplication();
  }, []);

  // --- INTERNAL ROUTER HANDLER ---

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setCurrentPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // --- SHOPPING CART STATE CONTROLLER ---

  const refreshCart = async () => {
    if (!user) return;
    try {
      const items = await api.cart.get();
      setCart(items);
    } catch (err) {
      console.error('[ShopEZ Cart] Failed to pull updated checkout items:', err);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!user) {
      // Direct guest shoppers immediately to the Login portal with alert
      setToastMessage('🔐 Please sign in with mock credentials to add items to your cart.');
      setToastType('amber');
      handleNavigate('login');
      return;
    }

    try {
      setAddingCartId(productId);
      await api.cart.add(productId, quantity);
      await refreshCart();
      
      const itemDescription = products.find(p => p._id === productId)?.name || 'Item';
      setToastMessage(`🛒 Added ${quantity}x "${itemDescription}" to your shopping cart!`);
      setToastType('success');
    } catch (err: any) {
      setToastMessage(err.message || 'Could not register item allocation.');
      setToastType('amber');
    } finally {
      setAddingCartId(null);
    }
  };

  const handleUpdateCartQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;
    try {
      if (newQuantity <= 0) {
        await handleRemoveCartItem(productId);
        return;
      }

      // Check current product stock limits
      const matchedProd = products.find(p => p._id === productId);
      if (matchedProd && matchedProd.stock < newQuantity) {
        setToastMessage(`⚠️ Only ${matchedProd.stock} units are currently available inside store files.`);
        setToastType('amber');
        return;
      }

      // Simulate step mutations by posting a delta quantity in memory
      // Since our addCart is additive, let's deduct the current line allocation
      const currentItem = cart.find(c => c.productId._id === productId);
      if (currentItem) {
        const delta = newQuantity - currentItem.quantity;
        await api.cart.add(productId, delta);
        await refreshCart();
      }
    } catch (err) {
      console.error('[ShopEZ Cart] Quantity modification error', err);
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    if (!user) return;
    try {
      await api.cart.remove(productId);
      await refreshCart();
      setToastMessage('🗑️ Item removed from your shopping cart.');
      setToastType('info');
    } catch (err) {
      console.error('[ShopEZ Cart] deletion error', err);
    }
  };

  const handleClearCartAndState = () => {
    setCart([]);
  };

  // --- AUTHORIZATION LIFECYCLE EVENT HANDLERS ---

  const handleAuthSuccess = async (token: string, loadedUser: any) => {
    localStorage.setItem('shopez_token', token);
    setUser(loadedUser);
    
    // Clear alerts, log user in, retrieve their cart
    setToastMessage(`🎉 Welcome back, ${loadedUser.name}! Enjoy shopping on ShopEZ.`);
    setToastType('success');

    try {
      const cartItems = await api.cart.get();
      setCart(cartItems);
    } catch (e) {
      console.error('[ShopEZ Auth] Cart pull error', e);
    }

    // Forward back home or to previous details tab
    handleNavigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('shopez_token');
    setUser(null);
    setCart([]);
    setToastMessage('🔑 Logged out successfully. Visit ShopEZ again soon!');
    setToastType('info');
    handleNavigate('home');
  };

  // Refresh catalogs whenever admin edits elements inside details
  const refreshProductsCatalog = async () => {
    try {
      const refreshed = await api.products.getAll();
      setProducts(refreshed);
    } catch (err) {
      console.error('[ShopEZ Admin] catalog reload failed:', err);
    }
  };

  // Compute total items inside basket
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans leading-normal text-slate-850">
      
      {/* Top Sticky Header */}
      <Navbar
        user={user}
        cartCount={totalCartItems}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />

      {/* Global alert toaster message wrapper */}
      {toastMessage && (
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-pulse ${
            toastType === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : toastType === 'amber'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-805 text-indigo-800'
          }`}>
            <span className="text-xs font-bold sm:text-sm">{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              className="p-1 rounded-full hover:bg-slate-900/5 transition text-slate-580 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Sandbox Stage */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {booting ? (
          <div className="flex h-96 flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-800 tracking-wide">ShopEZ Platform Seeding</h2>
              <p className="text-xs text-slate-400 mt-1">Readying items catalog and database tables...</p>
            </div>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {currentPage === 'home' && (
              <Home
                products={products}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                addingCartId={addingCartId}
              />
            )}

            {currentPage === 'products' && (
              <Products
                products={products}
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                addingCartId={addingCartId}
              />
            )}

            {currentPage === 'product-details' && (
              <ProductDetails
                productId={currentPageParams.productId}
                user={user}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
                isAddingToCart={addingCartId === currentPageParams.productId}
              />
            )}

            {currentPage === 'cart' && (
              <Cart
                cart={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'checkout' && (
              <Checkout
                cart={cart}
                user={user}
                onClearCart={handleClearCartAndState}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'login' && (
              <Login
                onLoginSuccess={handleAuthSuccess}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'register' && (
              <Register
                onRegisterSuccess={handleAuthSuccess}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboard
                products={products}
                onRefreshProducts={refreshProductsCatalog}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer information blocks */}
      <Footer />
    </div>
  );
}
