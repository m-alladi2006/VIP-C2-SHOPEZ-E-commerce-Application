import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Tag, ShoppingBag, Users, PlusCircle, Pencil, Trash2, 
  RefreshCw, CheckCircle2, Truck, AlertTriangle, X, DollarSign, Calendar
} from 'lucide-react';
import { Product, Order, User } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  products: Product[];
  onRefreshProducts: () => void;
  onNavigate: (page: string, params?: any) => void;
}

type TabType = 'overview' | 'products' | 'orders' | 'users';

export default function AdminDashboard({
  products,
  onRefreshProducts,
  onNavigate,
}: AdminDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stats Metrics Hooks
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Orders Hooks
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Users Hooks
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  // --- MODAL TRIGGERS ---
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form State Inputs
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('Electronics');
  const [pStock, setPStock] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pImage, setPImage] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // --- REFRESH ACTIONS ---

  // 1. Load Admin Overview Stats
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError('');
      const data = await api.admin.getStats();
      setMetrics(data.metrics);
    } catch (err: any) {
      setStatsError(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Load Sales Orders
  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError('');
      const data = await api.order.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      setOrdersError(err.message || 'Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // 3. Load Customers list
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError('');
      
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('shopez_token')}`
        }
      });
      if (!response.ok) throw new Error('Unresolved customer query');
      const data = await response.json();
      setUsersList(data);
    } catch (err: any) {
      setUsersError(err.message || 'Failed to fetch users catalog');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Run initial mounts
  useEffect(() => {
    loadStats();
    loadOrders();
    loadUsers();
  }, [products]); // reload when products count change

  // --- ACTION HANDLERS ---

  // Edit product clicked: open form pre-filled
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(prod.price.toString());
    setPCategory(prod.category);
    setPStock(prod.stock.toString());
    setPDescription(prod.description);
    setPImage(prod.images[0] || '');
    setFormError('');
    setShowProductModal(true);
  };

  // New product clicked: open empty form
  const openNewModal = () => {
    setEditingProduct(null);
    setPName('');
    setPPrice('');
    setPCategory('Electronics');
    setPStock('');
    setPDescription('');
    setPImage('');
    setFormError('');
    setShowProductModal(true);
  };

  // Submit Product Form
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pDescription || !pCategory || pStock === '') {
      setFormError('Please fill in all details.');
      return;
    }
    if (Number(pPrice) <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }
    if (Number(pStock) < 0) {
      setFormError('Stock cannot be negative.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');

      const productPayload = {
        name: pName,
        price: Number(pPrice),
        category: pCategory,
        stock: Number(pStock),
        description: pDescription,
        images: pImage ? [pImage] : [],
      };

      if (editingProduct) {
        // UPDATE existing
        await api.products.update(editingProduct._id, productPayload);
      } else {
        // CREATE new
        await api.products.create(productPayload);
      }

      // Close modal and refresh global state
      setShowProductModal(false);
      onRefreshProducts();
      loadStats();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product row
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this product from the catalog? This cannot be undone.')) {
      try {
        await api.products.delete(id);
        onRefreshProducts();
        loadStats();
      } catch (err: any) {
        alert(err.message || 'Delete operation error.');
      }
    }
  };

  // Delete customer profile
  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer account registration? Item lists and cart history will be permanently erased.')) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('shopez_token')}`
          }
        });
        if (!response.ok) {
          const detail = await response.json().catch(() => ({ message: 'Delete user error' }));
          throw new Error(detail.message || 'Failed to delete user');
        }
        loadUsers();
        loadStats();
      } catch (err: any) {
        alert(err.message || 'Operation error deleting user');
      }
    }
  };

  // Change individual order tracking Status
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('shopez_token')}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update tracking route');
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order tracking status.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-16 space-y-6" id="merchant-control-center">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Merchant Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage product inventory catalogs, monitor customer order receipts, and audit shoppers.</p>
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 min-h-[550px]">
        
        {/* Left Col: Slate navigation list (3 Columns) */}
        <nav className="lg:col-span-3 rounded-xl bg-slate-900 text-slate-300 p-4 space-y-2.5 h-fit shadow" id="admin-vertical-sidebar">
          
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Control Center Navigation
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'products' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="h-4.5 w-4.5" />
            <span>Product Inventory Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'orders' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Customer Track Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              activeTab === 'users' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Registered Shoppers</span>
          </button>

          <div className="border-t border-slate-800 pt-5 mt-4 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-450 hover:underline inline-flex items-center space-x-1.5"
            >
              <span>Back to Public Store &rarr;</span>
            </button>
          </div>
        </nav>

        {/* Right Col: Frame displays (9 Columns) */}
        <main className="lg:col-span-9 space-y-6" id="admin-frame-containers">
          
          {/* TAB 1: OVERVIEW METRICS PANELS */}
          {activeTab === 'overview' && (
            <div className="space-y-6" id="admin-overview-tab">
              {loadingStats ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></div>
                  <p className="text-xs text-slate-500">Calculating business analytics...</p>
                </div>
              ) : statsError ? (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-650 flex items-center space-x-2 text-xs">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{statsError}</span>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Summary Block row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Gross revenue stats text strings */}
                    <div className="bg-slate-50 rounded-xl border border-slate-150 p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Total Revenue</span>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">${metrics.totalRevenue.toFixed(2)}</p>
                      <span className="text-[10px] font-semibold text-emerald-600 block">Payout Active</span>
                    </div>

                    {/* Orders tracking */}
                    <div className="bg-slate-50 rounded-xl border border-slate-150 p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Total Orders</span>
                        <ShoppingBag className="h-4 w-4 text-emerald-650" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{metrics.totalOrders}</p>
                      <span className="text-[10px] font-semibold text-slate-550 block">Transactions logged</span>
                    </div>

                    {/* Products inventory */}
                    <div className="bg-slate-50 rounded-xl border border-slate-150 p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Catalog Items</span>
                        <Tag className="h-4 w-4 text-teal-650" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{metrics.totalProducts}</p>
                      <span className="text-[10px] font-semibold text-slate-00 block">Active listings</span>
                    </div>

                    {/* Registered customers */}
                    <div className="bg-slate-50 rounded-xl border border-slate-150 p-5 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Total Users</span>
                        <Users className="h-4 w-4 text-blue-650" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{metrics.totalUsers}</p>
                      <span className="text-[10px] font-semibold text-slate-500 block">Profiles verified</span>
                    </div>
                  </div>

                  {/* Operational recent indicators tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Orders table preview */}
                    <div className="border border-slate-150 rounded-xl bg-white p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Orders Log</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold text-emerald-600 hover:underline">View All</button>
                      </div>

                      <div className="space-y-3">
                        {orders.slice(0, 3).map(ord => (
                          <div key={ord._id} className="flex justify-between items-center border-b border-slate-50 pb-2 text-xs">
                            <div>
                              <strong className="text-slate-800 block select-all font-mono text-[11px]">{ord._id}</strong>
                              <span className="text-[10px] text-slate-400 block">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-900 font-extrabold pr-2 block">${ord.totalAmount.toFixed(2)}</span>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                ord.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                              }`}>{ord.orderStatus}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Low stock checklist alert */}
                    <div className="border border-slate-150 rounded-xl bg-white p-5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          <span>Low Stock Alert</span>
                        </h3>
                        <button onClick={() => setActiveTab('products')} className="text-[10px] font-bold text-emerald-600 hover:underline">Manage</button>
                      </div>

                      <div className="space-y-3 text-xs">
                        {products.filter(p => p.stock <= 5).slice(0, 3).map(p => (
                          <div key={p._id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <span className="text-slate-700 truncate max-w-[150px] font-medium block">{p.name}</span>
                            <span className={`font-bold px-2 py-0.5 rounded ${p.stock === 0 ? 'bg-rose-50 text-rose-600 font-extrabold' : 'bg-amber-50 text-amber-600'}`}>
                              {p.stock === 0 ? 'OUT OF STOCK' : `Only ${p.stock} units!`}
                            </span>
                          </div>
                        ))}
                        {products.filter(p => p.stock <= 5).length === 0 && (
                          <p className="text-xs text-slate-450 italic text-center py-6">All listing catalogs well stocked!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-5 animate-fade-in" id="admin-inventory-tab">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory Directory ({products.length})</span>
                <button
                  onClick={openNewModal}
                  className="rounded-md bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold shadow-sm hover:bg-emerald-700 active:bg-emerald-850 flex items-center space-x-1.5 transition"
                  id="admin-add-product-btn"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Clean table list view */}
              <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4 select-none">Asset</th>
                      <th className="p-4">Description Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Base Cost</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650" id="admin-products-table">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition">
                        {/* image asset */}
                        <td className="p-4 w-16">
                          <img
                            src={p.images[0] || ''}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover border border-slate-100 bg-slate-50"
                          />
                        </td>
                        {/* text attributes */}
                        <td className="p-4 max-w-[200px]">
                          <strong className="block text-slate-800 text-xs truncate max-w-xs">{p.name}</strong>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{p.description}</span>
                        </td>
                        {/* category */}
                        <td className="p-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                            {p.category}
                          </span>
                        </td>
                        {/* price */}
                        <td className="p-4 font-extrabold text-slate-900 font-mono">
                          ${p.price.toFixed(2)}
                        </td>
                        {/* stock count */}
                        <td className="p-4 text-center">
                          <span className={`font-mono font-bold text-sm ${p.stock <= 3 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                            {p.stock}
                          </span>
                        </td>
                        {/* execution edit/delete points */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-105 hover:bg-slate-100 hover:text-emerald-600 transition"
                              title="Edit specifications"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-1.5 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete listing"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          No items loaded in current directories.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-5 animate-fade-in" id="admin-orders-tab">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retail Sales Receipts ({orders.length})</span>

              {loadingOrders ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600"></div>
                  <p className="text-xs text-slate-500 font-medium">Downloading transact sheets...</p>
                </div>
              ) : ordersError ? (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-650 text-xs">
                  {ordersError}
                </div>
              ) : (
                <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Consumer</th>
                        <th className="p-4">Inventory Units</th>
                        <th className="p-4">Final Cost</th>
                        <th className="p-4">Tracking Route</th>
                        <th className="p-4 text-center">Modify State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650" id="admin-orders-table">
                      {orders.map(ord => (
                        <tr key={ord._id} className="hover:bg-slate-50/50 transition">
                          {/* ID */}
                          <td className="p-4 select-all font-mono font-bold text-[11px] text-slate-900">
                            {ord._id}
                          </td>
                          {/* Consumer */}
                          <td className="p-4">
                            <span className="font-semibold text-slate-800 block">{(ord.userId as any)?.name || 'Unknown Shopper'}</span>
                            <span className="text-[10px] text-slate-400">{(ord.userId as any)?.email || ''}</span>
                          </td>
                          {/* Items listed */}
                          <td className="p-4">
                            <span className="truncate max-w-[150px] block leading-relaxed font-mono text-[10px]">
                              {ord.products.map(p => `${p.quantity}x ${(p.productId as any)?.name || 'Product'}`).join(', ')}
                            </span>
                          </td>
                          {/* Cost */}
                          <td className="p-4 font-bold text-slate-950 font-mono">
                            ${ord.totalAmount.toFixed(2)}
                          </td>
                          {/* Live Track Status */}
                          <td className="p-4">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-50 text-emerald-600'
                                : ord.orderStatus === 'shipped'
                                ? 'bg-blue-50 text-blue-600'
                                : ord.orderStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="p-4 text-center">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                              className="rounded border border-slate-250 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
                              title="Update Tracking Status"
                            >
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                            No shopper transactions logged. Place an order to test!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REGISTERED CUSTOMERS ACCOUNT CATALOG */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in" id="admin-users-tab">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Member Directory ({usersList.length})</span>

              {loadingUsers ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 font-medium"></div>
                  <p className="text-xs text-slate-500">Querying directory files...</p>
                </div>
              ) : usersError ? (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-650 text-xs">
                  {usersError}
                </div>
              ) : (
                <div className="bg-white border border-slate-150 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 text-[10px] tracking-wider">
                      <tr>
                        <th className="p-4">Customer ID</th>
                        <th className="p-4">Client Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Verified Role</th>
                        <th className="p-4">Fallback Shipping Location</th>
                        <th className="p-4 text-center">Manage Records</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650" id="admin-users-table">
                      {usersList.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition">
                          {/* ID */}
                          <td className="p-4 select-all font-mono text-[10px] text-slate-400">
                            {u._id}
                          </td>
                          {/* name */}
                          <td className="p-4 font-bold text-slate-800">
                            {u.name}
                          </td>
                          {/* email */}
                          <td className="p-4">
                            {u.email}
                          </td>
                          {/* role */}
                          <td className="p-4 font-bold">
                            <span className={`inline-flex roundedPx py-0.5 px-2 rounded-full text-[9px] uppercase tracking-wider ${
                              u.role === 'admin' ? 'bg-emerald-950/10 text-emerald-850' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          {/* address */}
                          <td className="p-4 truncate max-w-[150px]">
                            {u.address || <span className="text-[10px] text-slate-400 italic">No address populated</span>}
                          </td>
                          {/* delete */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={u.role === 'admin'}
                              className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-650 transition disabled:opacity-20 disabled:cursor-not-allowed"
                              title="Delete account mapping"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* INLINE CORE ADD / EDIT INVENTORY MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-55 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]" id="product-actions-modal">
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-slate-150 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {editingProduct ? 'Edit Catalog Specifications' : 'Upload New Product Listing'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-450 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Forms body */}
            <form onSubmit={handleProductSubmit} className="space-y-4" id="admin-product-specification-form">
              {formError && <p className="text-xs text-rose-650 bg-rose-50 p-2.5 rounded font-bold">{formError}</p>}

              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Product Title Name</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Astro Audio headset"
                    className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-emerald-555 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Section Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs outline-none focus:border-emerald-500"
                    title="Section Category"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Price and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Unit Cost PRICE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="e.g. 119.50"
                    className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Exact Stock Counter</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Image Unsplash URL Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Representative photography URL link</label>
                <input
                  type="url"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-emerald-500 select-all font-mono text-[10px]"
                />
              </div>

              {/* Row 4: full description text layout */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Detailed description text</label>
                <textarea
                  rows={4}
                  required
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Share a complete list of technical product properties, size specifications, fabric weave materials, power watt outputs..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 text-xs outline-none focus:border-emerald-500 transition"
                ></textarea>
              </div>

              {/* CTA row */}
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 rounded border border-slate-200 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:bg-emerald-850 shadow-sm transition"
                >
                  {formSubmitting ? 'Saving modifications...' : 'Save Product Specifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
