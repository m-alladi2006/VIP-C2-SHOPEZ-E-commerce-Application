import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import API from "../services/api";

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const [sortBy, setSortBy] = useState("name");

  const [priceRange, setPriceRange] = useState(100000);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [cartRefresh, setCartRefresh] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    products,
    selectedCategory,
    sortBy,
    priceRange,
    searchTerm,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/products");

      // Backend returns an array directly
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search Filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Category Filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Price Filter
    filtered = filtered.filter(
      (product) => product.price <= priceRange
    );

    // Sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
    } else {
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  return (
    <div className="products-page">
      <Navbar key={cartRefresh} />

      <div className="container">
        <h1 className="page-title">All Products</h1>

        <div className="products-container">

          {/* Sidebar */}
          <aside className="sidebar">

            {/* Search */}
            <div className="filter-section">
              <h3>Search</h3>

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="search-input"
              />
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h3>Categories</h3>

              <div className="filter-options">
                <label>
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ""}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value)
                    }
                  />
                  All Categories
                </label>

                {categories.map((category) => (
                  <label key={category}>
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={
                        selectedCategory === category
                      }
                      onChange={(e) =>
                        setSelectedCategory(
                          e.target.value
                        )
                      }
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-section">
              <h3>Price Range</h3>

              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(
                    Number(e.target.value)
                  )
                }
                className="price-range"
              />

              <p>Max: ₹{priceRange}</p>
            </div>

            {/* Sort */}
            <div className="filter-section">
              <h3>Sort By</h3>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="sort-select"
              >
                <option value="name">
                  Name (A-Z)
                </option>

                <option value="price-low">
                  Price (Low to High)
                </option>

                <option value="price-high">
                  Price (High to Low)
                </option>

                <option value="rating">
                  Rating
                </option>
              </select>
            </div>
          </aside>

          {/* Products */}
          <main className="products-main">
            {loading ? (
              <div className="loading">
                Loading products...
              </div>
            ) : (
              <>
                <p className="results-count">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1
                    ? "s"
                    : ""}
                  {" "}found
                </p>

                {filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map(
                      (product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          onAddToCart={() =>
                            setCartRefresh(
                              (prev) => prev + 1
                            )
                          }
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="no-products">
                    <p>
                      No products found matching
                      your criteria.
                    </p>
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Products;