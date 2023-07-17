const { Product } = require('../models/product');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const fs = require('fs/promises');
const path = require('path');

const productPublicDir = path.resolve('public', 'products');

const getAllProducts = async (req, res) => {
  console.log(req.user);
  const { _id: owner } = req.user;
  const { page = 1, limit = 10, favorite } = req.query;
  const skip = (page - 1) * limit;
  const products = await Product.find(
    // {},
    favorite ? { owner, favorite } : { owner },
    '-createdAt, -updatedAt',
    //  );
    {
      skip,
      limit: Number(limit),
    }
  ).populate('owner', 'name email');
  res.json(products);
};

const createProduct = async (req, res) => {
  const { body, file } = req;
  // console.log('body', body);
  // console.log('file', file);
  const { path: oldPath, filename } = file;
  const newPath = path.join(productPublicDir, filename);
  // console.log('newPath', newPath);
  // console.log('oldPath', oldPath);
  fs.rename(oldPath, newPath);
  const poster = path.join('products', filename);
  const { _id: owner } = req.user;
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
