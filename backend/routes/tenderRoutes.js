
const express = require('express');
const { 
  getTenders, 
  getTender, 
  createTender, 
  updateTender, 
  deleteTender,
  getTenderSubmissions,
  publishWinner,
  getTenderDisputes
} = require('../controllers/tenderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTenders)
  .post(protect, authorize('admin'), createTender);

router.route('/:id')
  .get(getTender)
  .put(protect, authorize('admin'), updateTender)
  .delete(protect, authorize('admin'), deleteTender);

router.get('/:id/submissions', protect, getTenderSubmissions);
router.put('/:id/winner', protect, authorize('admin'), publishWinner);
router.get('/:id/disputes', protect, authorize('admin'), getTenderDisputes);

module.exports = router;
