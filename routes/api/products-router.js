const express = require('express');
const ctrl = require('../../controllers/products-controllers');
const validateBody = require('../../decorators/validateBody');
const { schemas } = require('../../models/product');
const { checkAuth, isValidId } = require('../../middlewares');

const router = express.Router();

router.get('/', checkAuth, ctrl.getAllProducts);
router.get('/:id', isValidId, checkAuth, ctrl.createProduct);
router.post('/create-products', checkAuth, validateBody(schemas.productAddSchema), ctrl.createProduct);
router.patch(
  '/:id/favorite',
  checkAuth,
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusProduct
);

module.exports = router;
