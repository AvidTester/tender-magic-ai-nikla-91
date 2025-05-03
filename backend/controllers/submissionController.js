
const Submission = require('../models/Submission');
const Tender = require('../models/Tender');
const Evaluation = require('../models/Evaluation');

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    let query = {};
    
    // If user is a vendor, only show their submissions
    if (req.user.role === 'vendor') {
      query.vendorId = req.user.id;
    }
    
    const submissions = await Submission.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'evaluations',
        select: 'evaluatorName scores comments overallScore rank'
      });
    
    // Check if submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Make sure user is submission owner or admin/evaluator
    if (
      submission.vendorId.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'evaluator'
    ) {
      return res.status(403).json({ message: 'Not authorized to access this submission' });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private/Vendor
exports.createSubmission = async (req, res) => {
  try {
    // Get tender details
    const tender = await Tender.findById(req.body.tenderId);
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    // Check if tender is open for submissions
    if (tender.status !== 'Open') {
      return res.status(400).json({ message: 'Tender is not open for submissions' });
    }
    
    // Check if vendor already submitted
    const existingSubmission = await Submission.findOne({
      tenderId: req.body.tenderId,
      vendorId: req.user.id
    });
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this tender' });
    }
    
    // Add vendor details
    req.body.vendorId = req.user.id;
    req.body.vendorName = req.user.name;
    req.body.tenderTitle = tender.title;
    
    const submission = await Submission.create(req.body);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private/Vendor
exports.updateSubmission = async (req, res) => {
  try {
    let submission = await Submission.findById(req.params.id);
    
    // Check if submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Make sure user is submission owner
    if (submission.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }
    
    // Check if submission is still updatable
    if (submission.status !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot update submission that is under review or evaluated' });
    }
    
    submission = await Submission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Vendor
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    // Check if submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Make sure user is submission owner
    if (submission.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }
    
    // Check if submission is still deletable
    if (submission.status !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot delete submission that is under review or evaluated' });
    }
    
    await Submission.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject submission
// @route   PUT /api/submissions/:id/reject
// @access  Private/Admin
exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    // Check if submission exists
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.status = 'Rejected';
    submission.rejectionDate = new Date();
    
    await submission.save();
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update submission rankings
// @route   PUT /api/submissions/update-rankings
// @access  Private/Admin
exports.updateSubmissionRankings = async (req, res) => {
  try {
    const { tenderId } = req.body;
    
    if (!tenderId) {
      return res.status(400).json({ message: 'Tender ID is required' });
    }
    
    // Get all evaluated submissions for this tender
    const submissions = await Submission.find({
      tenderId,
      status: 'Evaluated'
    }).sort({ averageScore: -1 });
    
    // Update rankings
    let rank = 1;
    for (const submission of submissions) {
      submission.rank = rank++;
      await submission.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Submission rankings updated',
      data: submissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
