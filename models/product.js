const { Schema, model } = require('mongoose');
const Joi = require('joi');

const productSchema = new Schema({});

productSchema.post('save');

const productAddSchema = Joi.object({});

const Product = model('product', productSchema);

module.exports = {
  Product,
};
