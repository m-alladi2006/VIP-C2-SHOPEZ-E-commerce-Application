const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {

    if (req.body.price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    if (req.body.stock < 0) {
  return res.status(400).json({
    message: "Stock cannot be negative",
  });
}

    const product = await Product.create(req.body);

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = 10;

    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEARCH PRODUCTS
const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ONE
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {

    if (req.body.price !== undefined && req.body.price <= 0) {
  return res.status(400).json({
    message: "Price must be greater than 0",
  });
}

if (req.body.stock !== undefined && req.body.stock < 0) {
  return res.status(400).json({
    message: "Stock cannot be negative",
  });
}
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  
};