const Product = require('../models/product');
const HttpError = require('../helpers/HttpError');
const ctrl = require('../decorators/ctrlWrapper');

const getAllProducts = async (req, res) => {};

const createProduct = async (req, res) => {
  const { body } = req;
  const product = await Product.create(body);
  res.status(201).json(product);
};

module.exports = {
  getAllProducts: ctrl(getAllProducts),
  createProduct: ctrl(createProduct),
};
