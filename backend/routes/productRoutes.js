const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// PUBLIC
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);


// ADMIN ONLY
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;