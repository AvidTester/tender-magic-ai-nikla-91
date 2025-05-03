
const express = require('express');
const { 
  getDisputes, 
  getDispute, 
  createDispute,
  updateDisputeStatus
} = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(getDisputes)
  .post(authorize('vendor'), createDispute);

router.route('/:id')
  .get(getDispute);

router.put('/:id/status', authorize('admin'), updateDisputeStatus);

module.exports = router;
