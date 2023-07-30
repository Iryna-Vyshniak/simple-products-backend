const { Router } = require('express');
const ctrl = require('../../controllers/posts-controllers.js');
// import * as ctrl from '../../controllers/posts-controllers';
const { checkAuth, isValidId, uploadCloud, upload } = require('../../middlewares');
const validateBody = require('../../decorators/validateBody');
const postCreateValidation = require('../../validations/post');
// const validate = require('../../decorators/validation');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', isValidId, ctrl.getOne);
router.post('/', checkAuth, uploadCloud.single('image'), postCreateValidation, ctrl.createPost);
router.delete('/:id', checkAuth, isValidId, ctrl.deletePost);
router.patch('/:id', checkAuth, isValidId, ctrl.updatePost);

module.exports = router;
