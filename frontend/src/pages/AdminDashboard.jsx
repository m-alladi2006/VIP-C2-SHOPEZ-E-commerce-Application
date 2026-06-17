import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        API.get("/orders"),
        API.get("/products"),
      ]);

      const ordersList = ordersRes.data.orders || ordersRes.data || [];
      const productsList = productsRes.data.products || productsRes.data || [];

      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setProducts(Array.isArray(productsList) ? productsList : []);

      const revenue = ordersList.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      setStats({
        totalOrders: ordersList.length,
        totalProducts: productsList.length,
        totalRevenue: revenue,
        totalUsers: 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await API.post("/products", {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        image: newProduct.image,
        stock: parseInt(newProduct.stock) || 0,
      });

      alert("Product added successfully");
      setShowModal(false);
      setNewProduct({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
        stock: "",
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/products/${productId}`);
        alert("Product deleted successfully");
        fetchDashboardData();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}`, { status: newStatus });
      alert("Order status updated");
      fetchDashboardData();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading Dashboard...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        <div className="admin-container">
          <div className="admin-sidebar">
            <h3>Admin Menu</h3>
            <ul>
              <li>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`admin-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
                >
                  📊 Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`admin-nav-btn ${activeTab === "products" ? "active" : ""}`}
                >
                  📦 Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`admin-nav-btn ${activeTab === "orders" ? "active" : ""}`}
                >
                  📋 Orders
                </button>
              </li>
            </ul>
          </div>

          <div className="admin-content">
            {activeTab === "dashboard" && (
              <div>
                <h2>Dashboard Overview</h2>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats.totalOrders}</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats.totalProducts}</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <h3>Total Revenue</h3>
                    <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <h3>Total Users</h3>
                    <p className="stat-value">--</p>
                  </div>
                </div>

                <h2 style={{ marginTop: "40px" }}>Recent Orders</h2>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).length > 0 ? (
                        orders.slice(0, 5).map((order) => (
                          <tr key={order._id}>
                            <td>{order._id?.slice(-6) || "--"}</td>
                            <td>{order.shippingInfo?.fullName || "--"}</td>
                            <td>${(order.totalPrice || 0).toFixed(2)}</td>
                            <td>
                              <span
                                className={`status-badge status-${(order.status || "pending").toLowerCase()}`}
                              >
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-state">No orders yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="admin-header">
                  <h2>Product Management</h2>
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Product
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map((product) => (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>{product.stock}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn btn-secondary btn-small">
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleDeleteProduct(product._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-state">No products yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add Product Modal */}
                {showModal && (
                  <div className="modal-overlay">
                    <div className="modal-dialog">
                      <div className="modal-header">
                        <h2>Add New Product</h2>
                        <button
                          className="modal-close"
                          onClick={() => setShowModal(false)}
                        >
                          ×
                        </button>
                      </div>
                      <form onSubmit={handleAddProduct} className="modal-form">
                        <div className="form-group">
                          <label htmlFor="name">Product Name *</label>
                          <input
                            type="text"
                            id="name"
                            value={newProduct.name}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                name: e.target.value,
                              })
                            }
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="price">Price *</label>
                          <input
                            type="number"
                            id="price"
                            step="0.01"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                price: e.target.value,
                              })
                            }
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="category">Category *</label>
                          <input
                            type="text"
                            id="category"
                            value={newProduct.category}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                category: e.target.value,
                              })
                            }
                            className="form-input"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="description">Description</label>
                          <textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                description: e.target.value,
                              })
                            }
                            className="form-input"
                            rows="4"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="image">Image URL</label>
                          <input
                            type="url"
                            id="image"
                            value={newProduct.image}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                image: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="stock">Stock</label>
                          <input
                            type="number"
                            id="stock"
                            min="0"
                            value={newProduct.stock}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                stock: e.target.value,
                              })
                            }
                            className="form-input"
                          />
                        </div>

                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2>Orders Management</h2>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <tr key={order._id}>
                            <td>{order._id?.slice(-6) || "--"}</td>
                            <td>{order.shippingInfo?.fullName || "--"}</td>
                            <td>${(order.totalPrice || 0).toFixed(2)}</td>
                            <td>
                              <select
                                value={order.status || "Pending"}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order._id, e.target.value)
                                }
                                className="status-select"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td>{order.items?.length || 0}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="btn btn-secondary btn-small">
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="empty-state">No orders yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;