import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    shippingMethod: "standard",
    paymentMethod: "credit-card",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart();
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await API.get("/cart");
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity || 0);
    }, 0);

    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    setTotalPrice(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate form
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    if (!requiredFields.every((field) => formData[field])) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await API.post("/orders", {
        shippingInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
      });

      alert("Order placed successfully!");
      navigate(`/order/${response.data.orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order: " + (error.response?.data?.message || error.message));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-container">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="form-section">
              <h2>Shipping Information</h2>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Method</h2>
              <div className="shipping-methods">
                <label className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === "standard"}
                    onChange={handleInputChange}
                  />
                  <span>Standard Shipping (5-7 days) - $10</span>
                </label>
                <label className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === "express"}
                    onChange={handleInputChange}
                  />
                  <span>Express Shipping (2-3 days) - $25</span>
                </label>
                <label className="shipping-option">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="overnight"
                    checked={formData.shippingMethod === "overnight"}
                    onChange={handleInputChange}
                  />
                  <span>Overnight Shipping - $50</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === "credit-card"}
                    onChange={handleInputChange}
                  />
                  <span>Credit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit-card"
                    checked={formData.paymentMethod === "debit-card"}
                    onChange={handleInputChange}
                  />
                  <span>Debit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleInputChange}
                  />
                  <span>PayPal</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <span>{item.productId.name}</span>
                  <span>
                    x{item.quantity} = ${(item.productId.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-summary-details">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>${(subtotal + shipping + tax).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Checkout;