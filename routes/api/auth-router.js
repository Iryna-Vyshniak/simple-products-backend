const { Router } = require('express');
const ctrl = require('../../controllers/auth-controllers');
const validateBody = require('../../decorators/validateBody');
const { schemas } = require('../../models/user');
const checkAuth = require('../../middlewares/check-auth');

const router = Router();

router.post('/signup', validateBody(schemas.registerSchema), ctrl.signUp);
router.post('/signin', validateBody(schemas.loginSchema), ctrl.signIn);
router.post('/logout', checkAuth, ctrl.logout);

module.exports = router;
