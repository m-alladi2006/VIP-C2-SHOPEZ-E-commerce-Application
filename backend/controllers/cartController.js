const User = require("../models/User");

// ADD TO CART
const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  const user = await User.findById(userId);

  user.cart.push({ productId, quantity });

  await user.save();

  res.json(user.cart);
};

// GET CART
const getCart = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId).populate("cart.productId");

  res.json(user.cart);
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  const user = await User.findById(userId);

  user.cart = user.cart.filter(
    (item) => item.productId.toString() !== productId
  );

  await user.save();

  res.json(user.cart);
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
};