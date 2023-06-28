const { Product } = require('../models/product');
const HttpError = require('../helpers/HttpError');
const ctrlWrapper = require('../decorators/ctrlWrapper');

const getAllProducts = async (req, res) => {
  const products = await Product.find({}, '-createdAt, -updatedAt');
  res.json(products);
};

const createProduct = async (req, res) => {
  const { body } = req;
  const product = await Product.create(body);
  res.status(201).json(product);
};

module.exports = {
  getAllProducts: ctrlWrapper(getAllProducts),
  createProduct: ctrlWrapper(createProduct),
};
