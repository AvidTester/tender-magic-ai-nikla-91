
const express = require('express');
const { 
  getSubmissions, 
  getSubmission, 
  createSubmission, 
  updateSubmission, 
  deleteSubmission,
  rejectSubmission,
  updateSubmissionRankings
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(getSubmissions)
  .post(authorize('vendor'), createSubmission);

router.route('/:id')
  .get(getSubmission)
  .put(authorize('vendor'), updateSubmission)
  .delete(authorize('vendor'), deleteSubmission);

router.put('/:id/reject', authorize('admin'), rejectSubmission);
router.put('/update-rankings', authorize('admin'), updateSubmissionRankings);

module.exports = router;
