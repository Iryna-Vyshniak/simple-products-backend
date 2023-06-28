const { Schema, model } = require('mongoose');
const Joi = require('joi');
const handleMongooseError = require('../helpers/handleMongooseError');

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

productSchema.post('save', handleMongooseError);

const productAddSchema = Joi.object({
  name: Joi.string().required().messages({ 'any.required': `name must be exists` }),
  price: Joi.number().required().messages({ 'any.required': `price must be exists` }),
  type: Joi.string().required().messages({ 'any.required': `type must be exists` }),
  description: Joi.string().required().messages({ 'any.required': `description must be exists` }),
  url: Joi.string().required().messages({ 'any.required': `url must be exists` }),
});

const Product = model('product', productSchema);

module.exports = {
  Product,
  productAddSchema,
};
