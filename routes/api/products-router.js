const express = require('express');
const ctrl = require('../../controllers/products-controllers');
const validateBody = require('../../decorators/validateBody');
const { productAddSchema } = require('../../models/product');
// console.log(productAddSchema);
const { checkAuth, isValidId } = require('../../middlewares');

const router = express.Router();

router.get('/', checkAuth, ctrl.getAllProducts);
router.get('/:id', isValidId, checkAuth, ctrl.createProduct);
router.post('/', checkAuth, validateBody(productAddSchema), ctrl.createProduct);

module.exports = router;
