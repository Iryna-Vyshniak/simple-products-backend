const { Schema, model } = require('mongoose');
const Joi = require('joi');

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

// productSchema.post('save');

const productAddSchema = Joi.object({
  name: Joi.string().required().messages({ 'any.required': `name must be exists` }),
  price: Joi.number().required().messages({ 'any.required': `price must be exists` }),
});

const Product = model('product', productSchema);

module.exports = {
  Product,
  productAddSchema,
};
