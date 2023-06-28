const express = require('express');
const ctrl = require('../../controllers/products-controllers');
const validateBody = require('../../decorators/validateBody');
const { productAddSchema } = require('../../models/product');
// console.log(productAddSchema);

const router = express.Router();

router.get('/');
router.post('/', validateBody(productAddSchema), ctrl.createProduct);

module.exports = router;
