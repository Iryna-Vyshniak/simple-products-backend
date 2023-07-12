const { Router } = require('express');
const ctrl = require('../../controllers/auth-controllers');
const validateBody = require('../../decorators/validateBody');
const { schemas } = require('../../models/user');
const { checkAuth, upload } = require('../../middlewares');

const router = Router();

router.post('/signup', validateBody(schemas.registerSchema), ctrl.signUp);
router.post('/signin', validateBody(schemas.loginSchema), ctrl.signIn);
router.get('/current', checkAuth, ctrl.getCurrent);
router.post('/logout', checkAuth, ctrl.logout);
router.patch('/avatars', checkAuth, upload.single('avatar'), ctrl.updateAvatar);

module.exports = router;
