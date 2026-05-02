const Product = require('../models/Product');

// GET all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// GET single product
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ productId: req.params.id }, { _id: req.params.id }],
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// POST create product
const createProduct = async (req, res, next) => {
  try {
    const { costPrice, sellingPrice } = req.body;
    if (Number(costPrice) > Number(sellingPrice)) {
      res.status(400);
      throw new Error('Cost price cannot exceed selling price');
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ productId: req.params.id }, { _id: req.params.id }],
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    Object.assign(product, req.body);
    const updated = await product.save();
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE product
const deleteProduct = async (req, res, next) => {
  try {
    const result = await Product.findOneAndDelete({
      $or: [{ productId: req.params.id }, { _id: req.params.id }],
    });
    if (!result) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};