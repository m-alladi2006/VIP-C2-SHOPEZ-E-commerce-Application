import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await API.get("/cart");
      setCartItems(response.data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity || 0);
    }, 0);
    setTotalPrice(total);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return;

    try {
      await API.put(`/cart/${itemId}`, { quantity: newQuantity });
      const updatedItems = cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Error updating cart");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      setCartItems(cartItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Error removing item from cart");
    }
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading your cart...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="container">
          <h1 className="page-title">Your Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <div className="container">
        <h1 className="page-title">Your Cart</h1>

        <div className="cart-container">
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id} className="cart-item">
                    <td className="product-cell">
                      <Link to={`/product/${item.productId._id}`}>
                        <div className="cart-product-info">
                          <img
                            src={
                              item.productId.image ||
                              "https://via.placeholder.com/80"
                            }
                            alt={item.productId.name}
                            className="cart-product-img"
                          />
                          <span>{item.productId.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td>${item.productId.price}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item._id,
                            parseInt(e.target.value)
                          )
                        }
                        className="quantity-input-cart"
                      />
                    </td>
                    <td className="subtotal">
                      ${(item.productId.price * item.quantity).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <div className="summary-items">
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping:</span>
                <span>${(totalPrice > 50 ? 0 : 10).toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Tax (10%):</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>
                ${(
                  totalPrice +
                  (totalPrice > 50 ? 0 : 10) +
                  totalPrice * 0.1
                ).toFixed(2)}
              </span>
            </div>
            <div className="cart-actions">
              <button
                className="btn btn-secondary"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
              <button className="btn btn-primary" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;