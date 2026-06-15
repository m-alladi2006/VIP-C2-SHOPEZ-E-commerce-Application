const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getAllOrders,
} = require("../controllers/orderController");

router.post("/create", createOrder);
router.get("/user", getUserOrders);
router.get("/all", getAllOrders);

module.exports = router;