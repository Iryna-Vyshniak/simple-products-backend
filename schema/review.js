const Joi = require('joi');

const reveiwSchema = Joi.object({
  rating: Joi.number().max(5).min(0).integer().required(),
  comment: Joi.string().required().messages({
    'any.required': `Missing required comment field`,
  }),
});

const updateReveiwSchema = Joi.object({
  rating: Joi.number().max(5).min(0).integer().required(),
  comment: Joi.string().required().messages({
    'any.required': `Missing required comment field`,
  }),
}).min(1);

const reviewSchemas = {
  reveiwSchema,
  updateReveiwSchema,
};

module.exports = reviewSchemas;
