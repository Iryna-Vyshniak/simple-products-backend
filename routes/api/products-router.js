const express = require('express');

const ctrl = require('../../controllers/products-controllers');
const validateBody = require('../../decorators/validateBody');
const { schemas } = require('../../models/product');
const { checkAuth, isValidId, upload } = require('../../middlewares');

const router = express.Router();

router.use(checkAuth);

router.get('/', ctrl.getAllProducts);
router.get('/:id', isValidId, ctrl.getProductById);

// upload.fields({name: 'poster', maxCount: 1}, {name: 'cards', maxCount: 2})
// upload.array('poster', 8)
router.post(
  '/',
  upload.single('poster'),
  validateBody(schemas.productAddSchema),
  ctrl.createProduct
);
router.patch(
  '/:id/favorite',
  isValidId,
  validateBody(schemas.updateFavoriteSchema),
  ctrl.updateStatusProduct
);

module.exports = router;
