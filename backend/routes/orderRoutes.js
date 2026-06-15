const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getAllOrders,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// USER
router.post("/create", protect, createOrder);
router.get("/user", protect, getUserOrders);

// ADMIN
router.get("/all", protect, adminOnly, getAllOrders);

module.exports = router;