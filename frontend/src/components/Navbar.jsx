import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    updateCartCount();
  }, []);

  const updateCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await API.get("/cart");
        setCartCount(response.data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ShopEZ
        </Link>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                navigate(`/products?search=${e.target.value}`);
              }
            }}
          />
        </div>
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/products">Products</Link>
          </li>
          {user?.role === "admin" && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}
          <li>
            <Link to="/cart" className="cart-link">
              Cart <span className="cart-count">{cartCount}</span>
            </Link>
          </li>
          {user ? (
            <>
              <li style={{ color: "#fff" }}>Hi, {user.name}</li>
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="auth-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;