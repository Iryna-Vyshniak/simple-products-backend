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
    poster: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
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
  poster: Joi.string().required().messages({ 'any.required': `url must be exists` }),
  favorite: Joi.boolean().required(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required().messages({ 'any.required': 'Missing field favorite' }),
});

const schemas = { productAddSchema, updateFavoriteSchema };

const Product = model('product', productSchema);

module.exports = {
  Product,
  schemas,
};
