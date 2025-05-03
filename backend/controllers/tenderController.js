
const Tender = require('../models/Tender');
const Submission = require('../models/Submission');
const Dispute = require('../models/Dispute');

// @desc    Get all tenders
// @route   GET /api/tenders
// @access  Public
exports.getTenders = async (req, res) => {
  try {
    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    const tenders = await Tender.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tenders.length,
      data: tenders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single tender
// @route   GET /api/tenders/:id
// @access  Public
exports.getTender = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('winner.vendorId', 'name');
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    res.status(200).json({
      success: true,
      data: tender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new tender
// @route   POST /api/tenders
// @access  Private/Admin
exports.createTender = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const tender = await Tender.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update tender
// @route   PUT /api/tenders/:id
// @access  Private/Admin
exports.updateTender = async (req, res) => {
  try {
    let tender = await Tender.findById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    tender = await Tender.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: tender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete tender
// @route   DELETE /api/tenders/:id
// @access  Private/Admin
exports.deleteTender = async (req, res) => {
  try {
    let tender = await Tender.findById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    await Tender.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get submissions for a tender
// @route   GET /api/tenders/:id/submissions
// @access  Private
exports.getTenderSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ tenderId: req.params.id })
      .sort({ rank: 1, averageScore: -1 });
    
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

// @desc    Publish tender winner
// @route   PUT /api/tenders/:id/winner
// @access  Private/Admin
exports.publishWinner = async (req, res) => {
  try {
    const { submissionId } = req.body;
    
    if (!submissionId) {
      return res.status(400).json({ message: 'Please provide a submission ID' });
    }
    
    // Find the tender
    const tender = await Tender.findById(req.params.id);
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    // Find the submission
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Update the tender with winner info
    tender.winner = {
      vendorId: submission.vendorId,
      vendorName: submission.vendorName,
      score: submission.averageScore,
      submissionDate: submission.submissionDate
    };
    tender.status = 'Awarded';
    tender.endDate = new Date();
    
    await tender.save();
    
    // Update the submission status to Winner
    submission.status = 'Winner';
    await submission.save();
    
    res.status(200).json({
      success: true,
      data: tender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get disputes for a tender
// @route   GET /api/tenders/:id/disputes
// @access  Private/Admin
exports.getTenderDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ tenderId: req.params.id }).sort({
      createdAt: -1
    });
    
    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
