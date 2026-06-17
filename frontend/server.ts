import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// --- IN-MEMORY DATABASE STRUCTURES ---

interface Review {
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  reviews: Review[];
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  address?: string;
  cart: CartItem[];
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  _id: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  createdAt: string;
}

// Global collections
let products: Product[] = [];
let users: User[] = [];
let orders: Order[] = [];

// Helper helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

// Seed Initial Data
function seedDatabase() {
  // Pre-seed some default beautiful products
  products = [
    {
      _id: 'p1',
      name: 'AeroSound Indigo ANC Headphones',
      price: 149.99,
      description: 'Immersive active noise-cancelling headphones featuring premium drivers, smart environmental transparency modes, ultra-soft protein leather earcups, and up to 45 hours of deep musical playback capacity.',
      category: 'Electronics',
      stock: 15,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'],
      rating: 4.8,
      reviews: [
        { name: 'Alice Smith', rating: 5, comment: 'Hands down the best headphones I have ever owned! Noise cancellation is flawless.', createdAt: '2026-04-10T14:30:00Z' },
        { name: 'John Doe', rating: 4, comment: 'Incredible bass depth and very comfortable. Battery easily lasts all week.', createdAt: '2026-05-12T09:15:00Z' }
      ]
    },
    {
      _id: 'p2',
      name: 'Velo Track Fit V2 Smartwatch',
      price: 199.99,
      description: 'Rugged dust-proof fitness companion containing high-precision blood oxygen sensors, continuous optical heart monitors, dual-band satellite GPS, and customized notifications.',
      category: 'Electronics',
      stock: 8,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'],
      rating: 4.5,
      reviews: [
        { name: 'David Lee', rating: 5, comment: 'Extremely accurate trails GPS tracker. Highly recommend the heart monitoring tools.', createdAt: '2026-05-20T11:20:00Z' }
      ]
    },
    {
      _id: 'p3',
      name: 'Urban Explorer Heavy Denim Jacket',
      price: 79.99,
      description: 'Classic utilitarian styling tailored from rugged 100% organic heavy denim. Built with premium brass rivets, hand-brushed fading, double-lined insulation, and six deep smart utility pockets.',
      category: 'Clothing',
      stock: 22,
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600'],
      rating: 4.6,
      reviews: [
        { name: 'Emma Watson', rating: 5, comment: 'Phenomenal retro fit! The organic denim feels heavy and holds up beautifully under repeat washing cycles.', createdAt: '2026-05-02T16:04:00Z' }
      ]
    },
    {
      _id: 'p4',
      name: 'Apex Nova Breathable Sneakers',
      price: 119.50,
      description: 'Superlight shock-absorbing athletic running sneakers manufactured with responsive memory mesh structures alongside multi-directional grid patterned durable rubber traction soles.',
      category: 'Clothing',
      stock: 12,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'],
      rating: 4.7,
      reviews: []
    },
    {
      _id: 'p5',
      name: 'Artisanal Terra Mug Set (4-Pack)',
      price: 34.00,
      description: 'Earth-born heavy stoneware mugs meticulously glazed in unique reactive earth layers. Comfortably holding 14oz, microwave and dishwasher safe with thermal insulating pottery walling.',
      category: 'Home & Living',
      stock: 35,
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600'],
      rating: 4.9,
      reviews: [
        { name: 'Sarah Miller', rating: 5, comment: 'Absolutely gorgeous mugs. No two are completely identical! Very nice tactile grips.', createdAt: '2026-06-01T08:12:00Z' }
      ]
    },
    {
      _id: 'p6',
      name: 'Halo Minimalist Wireless Lamp',
      price: 65.00,
      description: 'Architectural ring light providing glare-free overhead warmth. Equipped with customized seamless dial regulators, touch color switches, and active fast-charge 15W Qi integrated charging bases.',
      category: 'Home & Living',
      stock: 5,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600'],
      rating: 4.2,
      reviews: []
    },
    {
      _id: 'p7',
      name: 'HydroShield Vacuum Thermal Flask',
      price: 28.00,
      description: 'Double-walled sweatless kitchen Grade 304 food-grade stainless insulation keeping your arctic beverages ice-cold for 24 hours, or winter teas hot for 12 complete hours.',
      category: 'Sports & Outdoors',
      stock: 40,
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600'],
      rating: 4.4,
      reviews: []
    },
    {
      _id: 'p8',
      name: 'Atlas Trail Expedition Daypack',
      price: 89.00,
      description: 'All-weather extreme hiking and daily laptop modular pack featuring ripstop hydrophobic fabric weave, integrated water exit lines, and ergonomic load-balancing weight bands.',
      category: 'Sports & Outdoors',
      stock: 0, // Mock out of stock item to test out-of-stock badges
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'],
      rating: 4.7,
      reviews: []
    }
  ];

  // Pre-seed some default users (including an Admin and Standard user)
  users = [
    {
      _id: 'u1',
      name: 'ShopEZ Admin',
      email: 'admin@shopez.com',
      passwordHash: 'admin123', // Clean text match or simple comparison
      role: 'admin',
      address: '100 Infinite Loop, Cupertino, CA',
      cart: []
    },
    {
      _id: 'u2',
      name: 'John Shopper',
      email: 'user@shopez.com',
      passwordHash: 'user123',
      role: 'user',
      address: '42 Galaxy Highway, Seattle, WA',
      cart: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p5', quantity: 2 }
      ]
    }
  ];

  // Preseed mock history orders for dynamic statistics charts and data lists
  orders = [
    {
      _id: 'ord-101',
      userId: 'u2',
      products: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p3', quantity: 1 }
      ],
      totalAmount: 229.98,
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      shippingAddress: {
        fullName: 'John Shopper',
        address: '42 Galaxy Highway',
        city: 'Seattle',
        postalCode: '98101',
        country: 'USA',
        phone: '123-456-7890'
      },
      createdAt: '2026-06-10T12:00:00Z'
    },
    {
      _id: 'ord-102',
      userId: 'u2',
      products: [
        { productId: 'p5', quantity: 3 }
      ],
      totalAmount: 102.00,
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      shippingAddress: {
        fullName: 'John Shopper',
        address: '42 Galaxy Highway',
        city: 'Seattle',
        postalCode: '98101',
        country: 'USA',
        phone: '123-456-7890'
      },
      createdAt: '2026-06-15T15:45:00Z'
    }
  ];
}

seedDatabase();

// --- AUTH METRIC TOKEN MECHANISM (BASE64) ---
// Base64 JSON simulation of standard secure bearer tokens
function encodeToken(userId: string, role: string): string {
  const jsonStr = JSON.stringify({ userId, role, timestamp: Date.now() });
  return Buffer.from(jsonStr).toString('base64');
}

function decodeToken(token: string): { userId: string; role: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    return { userId: parsed.userId, role: parsed.role };
  } catch (e) {
    return null;
  }
}

// --- EXPRESS INITIALIZATION ---

const app = express();
app.use(express.json());

// --- MIDDLEWARES ---

// Auth payload protection
const protect = (req: any, res: any, next: any) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (decoded) {
      req.user = users.find(u => u._id === decoded.userId);
      if (req.user) {
        return next();
      }
    }
  }
  return res.status(401).json({ message: 'Not authorized, token validation failed' });
};

// Admin only gatekeeper
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Merchant and Admin access keys required' });
  }
};

// User only gatekeeper
const userOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    return res.status(403).json({ message: 'User account mapping required' });
  }
};

// Log requests out simple console format
app.use((req, res, next) => {
  console.log(`[ShopEZ HTTP] ${req.method} ${req.url}`);
  next();
});

// --- API PORT ROOT ---

// --- 1. AUTH API ENTRYS ---

// Register
app.post('/api/auth/register', (req: any, res: any) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Required details are missing' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email format provided' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const newUser: User = {
    _id: 'u-' + generateId(),
    name,
    email: email.toLowerCase(),
    passwordHash: password, // simple storage mock
    role: 'user',
    cart: []
  };

  users.push(newUser);
  const token = encodeToken(newUser._id, newUser.role);
  res.status(201).json({
    token,
    user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// Login
app.post('/api/auth/login', (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Credentials cannot be blank' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials. User not found' });
  }

  if (user.passwordHash !== password) {
    return res.status(400).json({ message: 'Invalid credentials. Password incorrect' });
  }

  const token = encodeToken(user._id, user.role);
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// Fetch Active Profile
app.get('/api/auth/profile', protect, (req: any, res: any) => {
  const { passwordHash, ...safeUserData } = req.user;
  res.json(safeUserData);
});

// Update Profile
app.put('/api/users/profile', protect, (req: any, res: any) => {
  const { name, address, email } = req.body;
  const user = users.find(u => u._id === req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User profile mapping failure' });
  }

  if (name) user.name = name;
  if (address) user.address = address;
  if (email && email.includes('@')) user.email = email.toLowerCase();

  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

// Admin fetches user list
app.get('/api/users', protect, adminOnly, (req: any, res: any) => {
  const safeUsers = users.map(({ passwordHash, ...safe }) => safe);
  res.json(safeUsers);
});

// Admin deletes user record
app.delete('/api/users/:id', protect, adminOnly, (req: any, res: any) => {
  const targetId = req.params.id;
  if (targetId === req.user._id) {
    return res.status(400).json({ message: 'Admin cannot delete their own active record' });
  }

  const userIndex = users.findIndex(u => u._id === targetId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User record not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User record deleted successfully' });
});

// --- 2. PRODUCT API ENTRYS ---

// Get products (with optional page query)
app.get('/api/products', (req: any, res: any) => {
  res.json(products);
});

// Search products
app.get('/api/products/search', (req: any, res: any) => {
  const keyword = (req.query.keyword || '').toString().toLowerCase();
  if (!keyword) {
    return res.json(products);
  }
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.description.toLowerCase().includes(keyword) ||
    p.category.toLowerCase().includes(keyword)
  );
  res.json(filtered);
});

// Get individual product detail
app.get('/api/products/:id', (req: any, res: any) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'No e-commerce product found with that catalog key' });
  }
  res.json(product);
});

// Admin creates product
app.post('/api/products', protect, adminOnly, (req: any, res: any) => {
  const { name, price, description, category, stock, images } = req.body;
  if (!name || price === undefined || !description || !category || stock === undefined) {
    return res.status(400).json({ message: 'All listing parameters must be filled' });
  }
  if (Number(price) <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0' });
  }
  if (Number(stock) < 0) {
    return res.status(400).json({ message: 'Stock cannot be negative' });
  }

  const imgArray = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'];

  const newProduct: Product = {
    _id: 'p-' + generateId(),
    name,
    price: Number(price),
    description,
    category,
    stock: Number(stock),
    images: imgArray,
    rating: 0,
    reviews: []
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Admin updates product
app.put('/api/products/:id', protect, adminOnly, (req: any, res: any) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Specification key does not match existing records' });
  }

  const { name, price, description, category, stock, images } = req.body;

  if (price !== undefined) {
    if (Number(price) <= 0) return res.status(400).json({ message: 'Price must be greater than 0' });
    product.price = Number(price);
  }
  if (stock !== undefined) {
    if (Number(stock) < 0) return res.status(400).json({ message: 'Stock cannot be negative' });
    product.stock = Number(stock);
  }
  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (images) product.images = Array.isArray(images) ? images : [images];

  res.json(product);
});

// Admin deletes product
app.delete('/api/products/:id', protect, adminOnly, (req: any, res: any) => {
  const productIndex = products.findIndex(p => p._id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Specification key does not match existing records' });
  }
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted' });
});

// Post consumer review
app.post('/api/products/:id/review', protect, (req: any, res: any) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and review comment text required' });
  }

  const product = products.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const newReview: Review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  product.reviews.push(newReview);

  // Re-compute average rating
  const total = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
  product.rating = Number((total / product.reviews.length).toFixed(1));

  res.status(201).json(product);
});

// --- 3. CART API ENTRYS ---

// Fetch active shopping cart
app.get('/api/cart', protect, (req: any, res: any) => {
  // Return items populated with full product details
  const populatedCart = req.user.cart.map((item: CartItem) => {
    const product = products.find(p => p._id === item.productId);
    return {
      productId: product || { _id: item.productId, name: 'Unavailable Product', price: 0, images: [''], stock: 0 },
      quantity: item.quantity
    };
  });
  res.json(populatedCart);
});

// Add metadata to active card
app.post('/api/cart', protect, (req: any, res: any) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  const product = products.find(p => p._id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Unresolved product code' });
  }

  const user = users.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ message: 'User session error' });

  // Check if item already exists in user cart
  const cartItem = user.cart.find(c => c.productId === productId);
  if (cartItem) {
    cartItem.quantity += qty;
  } else {
    user.cart.push({ productId, quantity: qty });
  }

  res.json(user.cart);
});

// Delete target item from active container
app.delete('/api/cart/remove/:productId', protect, (req: any, res: any) => {
  const targetId = req.params.productId;
  const user = users.find(u => u._id === req.user._id);
  if (!user) return res.status(404).json({ message: 'User session error' });

  user.cart = user.cart.filter(item => item.productId !== targetId);
  res.json(user.cart);
});

// --- 4. ORDER API ENTRYS ---

// Place e-commerce order
app.post('/api/order/create', protect, (req: any, res: any) => {
  const { products: orderProducts, totalAmount, shippingAddress } = req.body;

  if (!orderProducts || !Array.isArray(orderProducts) || orderProducts.length === 0) {
    return res.status(400).json({ message: 'Order must contain at least one item' });
  }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
    return res.status(400).json({ message: 'Please provide full shipping details' });
  }

  // Double check and decrement active product stock
  for (const item of orderProducts) {
    const matchedProduct = products.find(p => p._id === item.productId);
    if (!matchedProduct) {
      return res.status(404).json({ message: `Product ${item.productId} was not found in catalog` });
    }
    if (matchedProduct.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${matchedProduct.name}. Only ${matchedProduct.stock} left.` });
    }
  }

  // Decrement actual invent counters
  orderProducts.forEach(item => {
    const matchedProduct = products.find(p => p._id === item.productId)!;
    matchedProduct.stock -= item.quantity;
  });

  // Build high-concept Order schema
  const newOrder: Order = {
    _id: 'ord-' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(10 + Math.random() * 90),
    userId: req.user._id,
    products: orderProducts.map(p => ({ productId: p.productId, quantity: p.quantity })),
    totalAmount: Number(totalAmount),
    paymentStatus: 'paid', // Simulate automated card confirmation
    orderStatus: 'processing',
    shippingAddress,
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);

  // Automatically flush consumer active checkouts cart
  const userObj = users.find(u => u._id === req.user._id)!;
  userObj.cart = [];

  res.status(201).json(newOrder);
});

// Get individual order details
app.get('/api/order/:id', protect, (req: any, res: any) => {
  const order = orders.find(o => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Transaction tracking reference not found' });
  }
  if (req.user.role !== 'admin' && order.userId !== req.user._id) {
    return res.status(403).json({ message: 'Access denied to this order detail' });
  }

  // Populate products
  const populatedProducts = order.products.map(item => {
    const info = products.find(p => p._id === item.productId);
    return {
      productId: info || { _id: item.productId, name: 'Discontinued Item', price: 0 },
      quantity: item.quantity
    };
  });

  res.json({
    ...order,
    products: populatedProducts
  });
});

// Fetch active profile records
app.get('/api/order/user', protect, (req: any, res: any) => {
  const userOrders = orders.filter(o => o.userId === req.user._id);

  // Populate details
  const populated = userOrders.map(o => {
    const populatedProds = o.products.map(item => {
      const info = products.find(p => p._id === item.productId);
      return {
        productId: info || { _id: item.productId, name: 'Discontinued Item', price: 0, images: [''] },
        quantity: item.quantity
      };
    });
    return { ...o, products: populatedProds };
  });

  res.json(populated);
});

// Admin reads all logged transactions
app.get('/api/order/all', protect, adminOnly, (req: any, res: any) => {
  const populated = orders.map(o => {
    const matchedUser = users.find(u => u._id === o.userId);
    const populatedProds = o.products.map(item => {
      const info = products.find(p => p._id === item.productId);
      return {
        productId: info || { _id: item.productId, name: 'Discontinued Item', price: 0 },
        quantity: item.quantity
      };
    });
    return {
      ...o,
      userId: matchedUser ? { _id: matchedUser._id, name: matchedUser.name, email: matchedUser.email } : { _id: o.userId, name: 'Unknown Shopper', email: 'deleted@shopez.com' },
      products: populatedProds
    };
  });
  res.json(populated);
});

// Update individual tracking status (shipped, delivered, etc.)
app.put('/api/order/:id/status', protect, adminOnly, (req: any, res: any) => {
  const { orderStatus } = req.body;
  if (!orderStatus) {
    return res.status(400).json({ message: 'Full tracking string value is required' });
  }

  const order = orders.find(o => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order transaction tracking reference failure' });
  }

  order.orderStatus = orderStatus;
  res.json(order);
});

// --- 5. ADMIN METRICS STATISTICS ---

app.get('/api/admin/stats', protect, adminOnly, (req: any, res: any) => {
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;

  // Calcul totals from paid receipts
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Group revenues by month or create modern series
  const sampleSalesSeries = [
    { name: 'Jan', sales: totalRevenue * 0.1 },
    { name: 'Feb', sales: totalRevenue * 0.15 },
    { name: 'Mar', sales: totalRevenue * 0.2 },
    { name: 'Apr', sales: totalRevenue * 0.15 },
    { name: 'May', sales: totalRevenue * 0.1 },
    { name: 'Jun', sales: totalRevenue * 0.3 }
  ];

  // Group by category counts
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categorySeries = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    value: count
  }));

  res.json({
    metrics: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(totalRevenue.toFixed(2))
    },
    salesHistory: sampleSalesSeries,
    categoryShare: categorySeries
  });
});

// --- VITE DEV AND EXPRESS PRODUCTION INTEGRATION ---

const PORT = 3000;

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[ShopEZ Server] Active development Vite routing mounted.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[ShopEZ Server] Running Express production server static compiler.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopEZ Port] Server actively spinning at http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('[ShopEZ Error] Failure booting Express pipeline:', err);
});
