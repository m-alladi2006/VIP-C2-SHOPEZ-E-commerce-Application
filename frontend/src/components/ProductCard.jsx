import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function ProductCard({ product, onAddToCart }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setIsLoading(true);
      await API.post("/cart/add", {
        productId: product._id,
        quantity: 1,
      });
      onAddToCart && onAddToCart();
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-link">
        <div className="product-image-container">
          <img
            src={product.image || "https://via.placeholder.com/200"}
            alt={product.name}
            className="product-image"
          />
          {product.stock <= 0 && <div className="out-of-stock">Out of Stock</div>}
        </div>
      </Link>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">${product.price}</p>
        <div className="product-rating">
          <span className="stars">⭐ {rating.toFixed(1)}</span>
          <span className="reviews">({reviews} reviews)</span>
        </div>
        <div className="product-actions">
          <Link
            to={`/product/${product._id}`}
            className="btn btn-secondary"
            style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            View
          </Link>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={isLoading || product.stock <= 0}
            style={{ flex: 1 }}
          >
            {isLoading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
