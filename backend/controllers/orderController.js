const Order = require("../models/Order");

// CREATE ORDER
const createOrder = async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
};

// USER ORDERS
const getUserOrders = async (req, res) => {
  const { userId } = req.body;

  const orders = await Order.find({ userId }).populate("products.productId");

  res.json(orders);
};

// ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("userId");
  res.json(orders);
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
};