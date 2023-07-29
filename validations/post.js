const { body } = require('express-validator');

const postCreateValidation = [
  body('title', 'Add title').isLength({ min: 3 }).isString(),
  body('text', 'Add description text').isLength({ min: 10 }).isString(),
  body('tags', 'Wrong tag`s format. Please add array').optional().isString(),
  body('imageUrl', 'Wrong URL to image').optional().isString(),
];

module.exports = postCreateValidation;
