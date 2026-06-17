import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/products/${id}`);
      setProduct(response.data.product || response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsAdding(true);

    await API.post(
      "/cart/add",
      {
        productId: product._id,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product added to cart!");

    navigate("/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);

    alert("Error adding to cart");
  } finally {
    setIsAdding(false);
  }
};

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />
        <div className="container">
          <div className="loading">Loading product details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar />
        <div className="container">
          <p>Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;

  return (
    <div className="product-details-page">
      <Navbar />
      <div className="container">
        <button className="back-link" onClick={() => navigate("/products")}>
          ← Back to Products
        </button>

        <div className="product-details-container">
          <div className="product-details-image">
            <img
              src={product.image || "https://via.placeholder.com/400"}
              alt={product.name}
              className="product-detail-img"
            />
            {product.stock <= 0 && (
              <div className="out-of-stock-overlay">Out of Stock</div>
            )}
          </div>

          <div className="product-details-info">
            <h1>{product.name}</h1>
            <p className="product-category-label">Category: {product.category}</p>

            <div className="product-rating-section">
              <span className="rating-stars">⭐ {rating.toFixed(1)}</span>
              <span className="rating-count">({reviews} reviews)</span>
            </div>

            <div className="price-section">
              <span className="price">₹{product.price}</span>
              {product.originalPrice && (
                <span className="original-price">
  ₹{product.originalPrice}
</span>
              )}
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.specifications && (
              <div className="specifications-section">
                <h3>Specifications</h3>
                <ul>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock || 100}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
              </div>

              <div className="stock-status">
                {product.stock > 0 ? (
                  <p className="in-stock">
                    ✓ In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="out-of-stock">Out of Stock</p>
                )}
              </div>

              <button
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
                disabled={isAdding || product.stock <= 0}
              >
                {isAdding ? "Adding to Cart..." : "Add to Cart"}
              </button>
            </div>

            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <ul>
                <li>🚚 Free shipping on orders over $50</li>
                <li>📦 Standard delivery: 5-7 business days</li>
                <li>🔄 Easy returns within 30 days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-container">
            <div className="review-item">
              <div className="review-header">
                <span className="reviewer-name">John Smith</span>
                <span className="review-rating">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="review-text">Great quality product! Highly recommend.</p>
            </div>
            <div className="review-item">
              <div className="review-header">
                <span className="reviewer-name">Sarah Johnson</span>
                <span className="review-rating">⭐⭐⭐⭐</span>
              </div>
              <p className="review-text">Good value for money. Fast delivery.</p>
            </div>
            <div className="review-item">
              <div className="review-header">
                <span className="reviewer-name">Mike Davis</span>
                <span className="review-rating">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="review-text">Excellent! Exactly as described.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetails;