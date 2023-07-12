const { Product } = require('../models/product');
// const HttpError = require('../helpers/HttpError');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');

const getAllProducts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const products = await Product.find({ owner }, '-createdAt, -updatedAt', {
    skip,
    limit: Number(limit),
  }).populate('owner', 'name email');
  res.json(products);
};

const createProduct = async (req, res) => {
  const { body } = req;
  const { _id: owner } = req.user;
  const product = await Product.create({ ...body, owner });
  res.status(201).json(product);
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Product.findOne({ _id: id, owner });
  if (!result) {
    throw HttpError(404, 'Not Found');
  }
  res.json(result);
};

module.exports = {
  getAllProducts: ctrlWrapper(getAllProducts),
  createProduct: ctrlWrapper(createProduct),
  getProductById: ctrlWrapper(getProductById),
};
