const { Router } = require('express');
const ctrl = require('../../controllers/review-controller');
const validateBody = require('../../decorators/validateBody');
const reviewSchemas = require('../../schema/review');
const { checkAuth } = require('../../middlewares');

const router = Router();

// returns all feedback: GET http://localhost:5000/api/reviews
router.get('/', ctrl.getAll);

// returns all feedback to the user: GET http://localhost:5000/api/reviews/own
router.get('/own', checkAuth, ctrl.getReviewByUser);

// add feedback by user: POST http://localhost:5000/api/reviews/own
// body raw { "rating": 4, "comment": "The current todo application ...."}
router.post('/own', checkAuth, validateBody(reviewSchemas.reveiwSchema), ctrl.addReview);

// edit feedback by user: PATCH http://localhost:5000/api/reviews/own
// body raw { "rating": 4, "comment": "This app ...."}
router.patch('/own', checkAuth, validateBody(reviewSchemas.updateReveiwSchema), ctrl.updateReview);

// delete feedback by user: DELETE http://localhost:5000/api/reviews/own
router.delete('/own', checkAuth, ctrl.deleteReview);

module.exports = router;
