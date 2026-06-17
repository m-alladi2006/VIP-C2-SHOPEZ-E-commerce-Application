import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import API from "../services/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [cartRefresh, setCartRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/products");

      // Backend returns an array directly
      setProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    setCartRefresh((prev) => prev + 1);
  };

  return (
    <div className="home-page">
      <Navbar key={cartRefresh} />

      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to ShopEZ</h1>

            <p>Your one-stop online shopping destination.</p>

            <p>Discover amazing products at the best prices.</p>

            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
            </Link>
          </div>

          <div className="hero-image">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="#e8f5e9" />
              <rect x="60" y="80" width="80" height="100" fill="#17a2b8" />
              <circle cx="100" cy="50" r="30" fill="#17a2b8" />
              <rect x="70" y="100" width="15" height="60" fill="#333" />
              <rect x="115" y="100" width="15" height="60" fill="#333" />
            </svg>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-section">
          <h2 className="section-title">Featured Products</h2>

          <p className="section-subtitle">
            Check out our best-selling products
          </p>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <p>No products found</p>
              )}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>

          <div className="categories-grid">
            <Link
              to="/products?category=Electronics"
              className="category-card"
            >
              <div className="category-icon">📱</div>
              <h3>Electronics</h3>
            </Link>

            <Link to="/products?category=Clothing" className="category-card">
              <div className="category-icon">👕</div>
              <h3>Clothing</h3>
            </Link>

            <Link
              to="/products?category=Accessories"
              className="category-card"
            >
              <div className="category-icon">👜</div>
              <h3>Accessories</h3>
            </Link>

            <Link to="/products?category=Shoes" className="category-card">
              <div className="category-icon">👟</div>
              <h3>Shoes</h3>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;