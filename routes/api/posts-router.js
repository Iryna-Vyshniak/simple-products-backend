const { Router } = require('express');
const ctrl = require('../../controllers/posts-controllers.js');
// import * as ctrl from '../../controllers/posts-controllers';
const { checkAuth, isValidId, uploadCloud } = require('../../middlewares');
// const validateBody = require('../../decorators/validateBody');
const postCreateValidation = require('../../validations/post');
// const validate = require('../../decorators/validation');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/tags', ctrl.getAllTags);
router.get('/tags/:tag', ctrl.getPostsByTag);
router.get('/search', ctrl.getSearchPosts);
router.get('/:id', isValidId, ctrl.getOne);

// private

router.post('/:id/comments', checkAuth, ctrl.addComment);
router.get('/users/:user', checkAuth, ctrl.getUserPosts);
// router.get('/user/posts', checkAuth, ctrl.getUserPosts);
router.get('/:id/favorites', checkAuth, ctrl.getFavoritesPosts);
router.post('/', checkAuth, uploadCloud.single('image'), postCreateValidation, ctrl.createPost);
router.post('/:id/favorite', checkAuth, ctrl.setFavoritePost);
router.patch('/:id', checkAuth, isValidId, uploadCloud.single('image'), ctrl.updatePost);
router.delete('/:id', checkAuth, isValidId, ctrl.deletePost);

module.exports = router;
