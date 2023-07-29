const { Router } = require('express');
const ctrl = require('../../controllers/posts-controllers.js');
const { shemas } = require('../../models/post');
const { checkAuth, isValidId, upload } = require('../../middlewares');
const postCreateValidation = require('../../validations/post');

const router = Router();

router.get('/');

module.exports = router;
