const express = require('express');
const ctrl = require('../../controllers/products-controllers');
const validateBody = require('../../decorators/validateBody');
const { productAddSchema } = require('../../models/product');
// console.log(productAddSchema);
const checkAuth = require('../../middlewares/check-auth');

const router = express.Router();

router.get('/', checkAuth, ctrl.getAllProducts);
router.post('/', checkAuth, validateBody(productAddSchema), ctrl.createProduct);

module.exports = router;
