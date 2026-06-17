const User = require("../models/User");

// ADD TO CART
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const user = await User.findById(req.user.id);

  user.cart.push({
    productId,
    quantity,
  });

  await user.save();

  res.json(user.cart);
};

// GET CART
const getCart = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("cart.productId");

  res.json(user.cart);
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);

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