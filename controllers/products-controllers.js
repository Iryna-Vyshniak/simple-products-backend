const { Product } = require('../models/product');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const fs = require('fs/promises');
const path = require('path');
const pagination = require('../utils/pagination');

const productPublicDir = path.resolve('public', 'products');

const getAllProducts = async (req, res) => {
  console.log(req.user);
  const { _id: owner } = req.user;
  // const { page = 1, limit = 10, favorite } = req.query;
  const { page: currentPage, limit: currentLimit, favorite } = req.query;
  const { page, limit, skip } = pagination(currentPage, currentLimit);

  const products = await Product.find(
    favorite ? { owner, favorite } : { owner },
    '-createdAt, -updatedAt',
    { limit, skip }
  )
    // .limit()
    // .skip()
    .populate('owner'); // отримуємо усі дані власника
  // .populate('owner', 'name email');
  const count = await Product.countDocuments();
  // const count = await Product.where({ owner, ...req.query }).countDocuments();
  // console.log('COUNT', count);
  res.json({ products, totalPages: Math.ceil(count / limit), currentPage: page });
};

const createProduct = async (req, res) => {
  const { body, file } = req;
  const { _id: owner } = req.user;
  // console.log('body', body);
  // console.log('file', file);
  const { path: oldPath, filename } = file;
  const newPath = path.join(productPublicDir, filename);
  // console.log('newPath', newPath);
  // console.log('oldPath', oldPath);
  await fs.rename(oldPath, newPath);
  const poster = path.join('products', filename);

  const product = await Product.create({ ...body, owner, poster });
  // const product = await Product.create({ ...body, poster });
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

const updateStatusProduct = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { _id: owner } = req.user;
  const result = await Product.findOneAndUpdate({ _id: id, owner }, body, { new: true });
  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json(result);
};

module.exports = {
  getAllProducts: ctrlWrapper(getAllProducts),
  createProduct: ctrlWrapper(createProduct),
  getProductById: ctrlWrapper(getProductById),
  updateStatusProduct: ctrlWrapper(updateStatusProduct),
};
