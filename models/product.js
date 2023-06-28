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

productSchema.post('save');

const productAddSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
});

const Product = model('product', productSchema);

module.exports = {
  Product,
};
