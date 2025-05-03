
const express = require('express');
const { 
  getEvaluations, 
  getEvaluation, 
  createEvaluation, 
  updateEvaluation,
  getSubmissionEvaluations
} = require('../controllers/evaluationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(authorize('evaluator', 'admin'), getEvaluations)
  .post(authorize('evaluator'), createEvaluation);

router.route('/:id')
  .get(getEvaluation)
  .put(authorize('evaluator'), updateEvaluation);

router.get('/submission/:id', authorize('admin', 'evaluator'), getSubmissionEvaluations);

module.exports = router;
