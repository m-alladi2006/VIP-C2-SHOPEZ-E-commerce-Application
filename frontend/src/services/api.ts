// API Service for ShopEZ e-commerce platform

const API_BASE = '/api';

// Helper to fetch options with authorization token automatically added
const getFetchOptions = (method = 'GET', body = null as any) => {
  const token = localStorage.getItem('shopez_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

export const api = {
  // Auth endpoints
  auth: {
    register: async (userData: any) => {
      const response = await fetch(`${API_BASE}/auth/register`, getFetchOptions('POST', userData));
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(err.message || 'Registration failed');
      }
      return response.json();
    },
    login: async (credentials: any) => {
      const response = await fetch(`${API_BASE}/auth/login`, getFetchOptions('POST', credentials));
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(err.message || 'Login failed');
      }
      return response.json();
    },
    getProfile: async () => {
      const response = await fetch(`${API_BASE}/auth/profile`, getFetchOptions('GET'));
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
        throw new Error(err.message || 'Failed to fetch profile');
      }
      return response.json();
    },
  },

  // Products endpoints
  products: {
    getAll: async (page = 1) => {
      const response = await fetch(`${API_BASE}/products?page=${page}`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    search: async (keyword: string) => {
      const response = await fetch(`${API_BASE}/products/search?keyword=${encodeURIComponent(keyword)}`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to search products');
      return response.json();
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_BASE}/products/${id}`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
    create: async (productData: any) => {
      const response = await fetch(`${API_BASE}/products`, getFetchOptions('POST', productData));
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create product');
      }
      return response.json();
    },
    update: async (id: string, productData: any) => {
      const response = await fetch(`${API_BASE}/products/${id}`, getFetchOptions('PUT', productData));
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update product');
      }
      return response.json();
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE}/products/${id}`, getFetchOptions('DELETE'));
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    addReview: async (id: string, reviewData: any) => {
      const response = await fetch(`${API_BASE}/products/${id}/review`, getFetchOptions('POST', reviewData));
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to add review' }));
        throw new Error(err.message || 'Failed to add review');
      }
      return response.json();
    },
  },

  // Cart endpoints
  cart: {
    get: async () => {
      const response = await fetch(`${API_BASE}/cart`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
    add: async (productId: string, quantity: number) => {
      const response = await fetch(`${API_BASE}/cart`, getFetchOptions('POST', { productId, quantity }));
      if (!response.ok) throw new Error('Failed to add item to cart');
      return response.json();
    },
    remove: async (productId: string) => {
      const response = await fetch(`${API_BASE}/cart/remove/${productId}`, getFetchOptions('DELETE'));
      if (!response.ok) throw new Error('Failed to remove item from cart');
      return response.json();
    }
  },

  // Order endpoints
  order: {
    create: async (orderData: any) => {
      const response = await fetch(`${API_BASE}/order/create`, getFetchOptions('POST', orderData));
      if (!response.ok) throw new Error('Failed to place order');
      return response.json();
    },
    getUserOrders: async () => {
      const response = await fetch(`${API_BASE}/order/user`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to fetch user orders');
      return response.json();
    },
    getAllOrders: async () => {
      const response = await fetch(`${API_BASE}/order/all`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to fetch all orders');
      return response.json();
    }
  },

  // Stats endpoint
  admin: {
    getStats: async () => {
      const response = await fetch(`${API_BASE}/admin/stats`, getFetchOptions('GET'));
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      return response.json();
    }
  }
};
