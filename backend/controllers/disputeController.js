
const Dispute = require('../models/Dispute');
const Tender = require('../models/Tender');
const Submission = require('../models/Submission');

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private
exports.getDisputes = async (req, res) => {
  try {
    let query = {};
    
    // If user is vendor, only get their disputes
    if (req.user.role === 'vendor') {
      query.vendorId = req.user.id;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const disputes = await Dispute.find(query).sort({ createdAt: -1 });
    
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

// @desc    Get single dispute
// @route   GET /api/disputes/:id
// @access  Private
exports.getDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Make sure user is vendor who created this or admin
    if (
      dispute.vendorId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to access this dispute' });
    }
    
    res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new dispute
// @route   POST /api/disputes
// @access  Private/Vendor
exports.createDispute = async (req, res) => {
  try {
    const {
      tenderId,
      tenderTitle,
      winnerId,
      winnerName,
      reason,
      disputeType
    } = req.body;
    
    // Check if tender exists
    const tender = await Tender.findById(tenderId);
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }
    
    // Validate dispute time frame
    const now = new Date();
    let referenceDate;
    
    if (disputeType === 'winner') {
      // Winner dispute - check against tender end date
      if (!tender.endDate) {
        return res.status(400).json({ message: 'This tender does not have a winner yet' });
      }
      referenceDate = new Date(tender.endDate);
    } else {
      // Rejection dispute - check against rejection date
      const submission = await Submission.findOne({
        tenderId,
        vendorId: req.user.id,
        status: 'Rejected'
      });
      
      if (!submission) {
        return res.status(400).json({ message: 'No rejected submission found for this tender' });
      }
      
      if (!submission.rejectionDate) {
        return res.status(400).json({ message: 'Rejection date not available' });
      }
      
      referenceDate = new Date(submission.rejectionDate);
    }
    
    const disputeTimeFrameDays = disputeType === 'winner' 
      ? tender.disputeTimeFrameDays 
      : 3; // 3 days for rejection disputes
    
    const disputeDeadline = new Date(referenceDate);
    disputeDeadline.setDate(disputeDeadline.getDate() + disputeTimeFrameDays);
    
    if (now > disputeDeadline) {
      return res.status(400).json({ 
        message: `The ${disputeTimeFrameDays}-day window for filing ${disputeType} disputes has expired` 
      });
    }
    
    // Check if user already filed a dispute for this tender
    const existingDispute = await Dispute.findOne({
      tenderId,
      vendorId: req.user.id,
      disputeType
    });
    
    if (existingDispute) {
      return res.status(400).json({ 
        message: 'You have already filed a dispute for this tender' 
      });
    }
    
    // Create dispute
    const dispute = await Dispute.create({
      tenderId,
      tenderTitle,
      vendorId: req.user.id,
      vendorName: req.user.name,
      winnerId,
      winnerName,
      reason,
      status: 'pending',
      disputeType
    });
    
    res.status(201).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update dispute status
// @route   PUT /api/disputes/:id/status
// @access  Private/Admin
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { status, responseText } = req.body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status (accepted or rejected)' });
    }
    
    if (!responseText) {
      return res.status(400).json({ message: 'Please provide a response' });
    }
    
    let dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Update dispute
    dispute.status = status;
    dispute.responseText = responseText;
    dispute.resolvedAt = new Date();
    
    await dispute.save();
    
    // If dispute is accepted and it's a winner dispute, we need to handle tender winner change
    if (status === 'accepted' && dispute.disputeType === 'winner') {
      // Get the tender
      const tender = await Tender.findById(dispute.tenderId);
      
      if (!tender) {
        return res.status(404).json({ message: 'Tender not found' });
      }
      
      // Get the submission from the vendor who filed the dispute
      const submission = await Submission.findOne({
        tenderId: dispute.tenderId,
        vendorId: dispute.vendorId
      });
      
      if (submission) {
        // Update tender winner
        tender.winner = {
          vendorId: submission.vendorId,
          vendorName: submission.vendorName,
          score: submission.averageScore,
          submissionDate: submission.submissionDate
        };
        
        await tender.save();
        
        // Update submission statuses
        await Submission.updateMany(
          { tenderId: dispute.tenderId, status: 'Winner' },
          { status: 'Evaluated' }
        );
        
        // Set the disputing vendor's submission as winner
        submission.status = 'Winner';
        await submission.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
