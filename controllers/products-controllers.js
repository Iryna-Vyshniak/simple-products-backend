const { Product } = require('../models/product');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const cloudinary = require('../helpers/cloudinary');
const fs = require('fs/promises');
// const path = require('path');
const pagination = require('../utils/pagination');

// const productPublicDir = path.resolve('public', 'products');

const typeOptions = ['fruit', 'berry', 'vegetable', 'dairy'];

// http://localhost:3500/api/products?page=1&limit=5&type=berry,fruit&sort=price,desc&search=lemon
// http://localhost:3500/api/products?page=1&limit=5&type=dairy&sort=price,desc&search=smoothie
// http://localhost:3500/api/products?page=1&limit=5&type=berry,fruit&sort=price,desc&favorite=true

/* const getAllProducts = async (req, res) => {
  // console.log(req.user);
  const { _id: owner } = req.user;
  const { page: currentPage, limit: currentLimit, favorite, name = '' } = req.query;

  let type = req.query.type || 'all';
  let sort = req.query.sort || 'price';

  const { page, limit, skip } = pagination(currentPage, currentLimit);

  type === 'all' ? (type = [...typeOptions]) : (type = req.query.type.split(','));
  req.query.sort ? (sort = req.query.sort.split(',')) : (sort = [sort]);

  const sortBy = {};
  if (sort[1]) {
    sortBy[sort[0]] = sort[1];
  } else {
    sortBy[sort[0]] = 'asc';
  }

  const products = await Product.find(
    favorite ? { owner, favorite } : { owner },
    // : { owner, name: { $regex: name, $options: 'i' } },
    '-createdAt, -updatedAt',
    { limit, skip }
  )
    .where('type')
    .in([...type])
    .sort(sortBy)
    .populate('owner'); // отримуємо усі дані власника
  // .populate('owner', 'name email');
 
  const count = await Product.countDocuments({
    type: { $in: [...type] },
    name: { $regex: name, $options: 'i' },
  });

  res.json({
    products,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    limit,
    type: typeOptions,
  });
}; */

const getAllProducts = async (req, res) => {
  // console.log(req.user);
  const { _id: owner } = req.user;
  // const { page = 1, limit = 10, favorite } = req.query;
  const { page: currentPage, limit: currentLimit, favorite, name = '' } = req.query;
  const { page, limit, skip } = pagination(currentPage, currentLimit);

  const products = await Product.find(
    favorite ? { owner, favorite } : { owner, name: { $regex: name, $options: 'i' } },
    '-createdAt, -updatedAt',
    { limit, skip }
  )
    // .limit()
    // .skip()
    .populate('owner'); // отримуємо усі дані власника
  // .populate('owner', 'name email');
  const count = await Product.countDocuments({ name: { $regex: name, $options: 'i' } });
  // const count = await Product.where({ owner, ...req.query }).countDocuments();
  // console.log('COUNT', count);
  res.json({ products, totalPages: Math.ceil(count / limit), currentPage: page });
};

const createProduct = async (req, res) => {
  const { body, file } = req;
  const { _id: owner } = req.user;
  // console.log('body', body);
  // console.log('file', file);

  const { path: oldPath } = file;

  /*
  save local 
  const { path: oldPath, filename } = file;
  const newPath = path.join(productPublicDir, filename);
  console.log('newPath', newPath);
  console.log('oldPath', oldPath);
  await fs.rename(oldPath, newPath);
  const poster = path.join('products', filename);
  const product = await Product.create({ ...body, owner, poster });
  res.status(201).json(product);
  */

  const fileData = await cloudinary.uploader.upload(oldPath, {
    folder: 'posters',
  });
  // console.log(fileData);
  // збережений в папку temp файл - видаляємо
  await fs.unlink(oldPath);
  const product = await Product.create({ ...body, owner, poster: fileData.url });
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

/* const getProductsByQuery = async (req, res) => {
  const searchQuery = req.query.query;
  const { _id: owner } = req.user;

  if (!searchQuery || searchQuery.length < 2) {
    res.json([]);
    return;
  }

  const filter = { name: { $regex: searchQuery, $options: 'i' } };
  // const filter = { $text: { $search: searchQuery } };

  const findProduct = await Product.find(filter, owner);

  // const findProduct = await Product.find(
  //   {
  //     name: { $regex: req.query.name, $options: 'i' },
  //   },
  //   { new: true }
  // );
  // const findProduct = await Product.find({ name: new RegExp(req.query.name, 'i') });

  console.log(findProduct);

  res.json(findProduct);

  // const { _id: owner } = req.user;

  // const findProduct = await Product.find(
  //   {
  //     owner,
  //     name: { $regex: req.query.name, $options: 'i' },
  //   },
  //   { new: true }
  // ).populate('owner');

  // const findProducts = await Product.aggregate({
  //   $match: { $or: [{ name: { $regex: name, $options: 'i' } }] },
  // });
  // res.json([findProducts]);

  // const findProducts = await Product.find({ name: { $regex: name, $options: 'i' } })
  //   .select('name')
  // console.log('Products:', findProducts);
  // if (findProducts.length === 0) {
  //   throw HttpError(404, `Not found`);
  // }
  // res.json(products, totalPages);
};
 */
module.exports = {
  getAllProducts: ctrlWrapper(getAllProducts),
  createProduct: ctrlWrapper(createProduct),
  getProductById: ctrlWrapper(getProductById),
  updateStatusProduct: ctrlWrapper(updateStatusProduct),
  // getProductsByQuery: ctrlWrapper(getProductsByQuery),
};
