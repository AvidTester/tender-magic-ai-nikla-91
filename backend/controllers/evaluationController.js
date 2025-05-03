
const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Tender = require('../models/Tender');

// @desc    Get evaluations for a user
// @route   GET /api/evaluations
// @access  Private/Evaluator
exports.getEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ evaluatorId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single evaluation
// @route   GET /api/evaluations/:id
// @access  Private
exports.getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Make sure user is evaluator who created this or admin
    if (
      evaluation.evaluatorId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to access this evaluation' });
    }
    
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new evaluation
// @route   POST /api/evaluations
// @access  Private/Evaluator
exports.createEvaluation = async (req, res) => {
  try {
    const { submissionId, scores, comments } = req.body;
    
    // Find the submission
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if evaluator already evaluated this submission
    const existingEvaluation = await Evaluation.findOne({
      submissionId,
      evaluatorId: req.user.id
    });
    
    if (existingEvaluation) {
      return res.status(400).json({ message: 'You have already evaluated this submission' });
    }
    
    // Calculate overall score
    const overallScore = calculateOverallScore(scores);
    
    // Create evaluation
    const evaluation = await Evaluation.create({
      tenderId: submission.tenderId,
      submissionId,
      evaluatorId: req.user.id,
      evaluatorName: req.user.name,
      scores,
      comments,
      overallScore,
      evaluationDate: new Date()
    });
    
    // Update submission with new average score
    await updateSubmissionScore(submissionId);
    
    // Update submission status if not already evaluated
    if (submission.status !== 'Evaluated') {
      submission.status = 'Evaluated';
      await submission.save();
    }
    
    // Update rankings for this tender's submissions
    await updateSubmissionRankings(submission.tenderId);
    
    res.status(201).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private/Evaluator
exports.updateEvaluation = async (req, res) => {
  try {
    let evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    
    // Make sure user is evaluator who created this
    if (evaluation.evaluatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this evaluation' });
    }
    
    // Calculate new overall score if scores changed
    if (req.body.scores) {
      req.body.overallScore = calculateOverallScore(req.body.scores);
    }
    
    evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Update submission average score
    await updateSubmissionScore(evaluation.submissionId);
    
    // Update rankings
    await updateSubmissionRankings(evaluation.tenderId);
    
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all evaluations for a submission
// @route   GET /api/evaluations/submission/:id
// @access  Private/Admin
exports.getSubmissionEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({
      submissionId: req.params.id
    });
    
    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate overall score
const calculateOverallScore = (scores) => {
  const { technical, financial, experience, implementation } = scores;
  return ((technical + financial + experience + implementation) / 4).toFixed(2);
};

// Helper function to update submission average score
const updateSubmissionScore = async (submissionId) => {
  // Get all evaluations for this submission
  const evaluations = await Evaluation.find({ submissionId });
  
  // Calculate average score
  const totalScore = evaluations.reduce((sum, eval) => sum + parseFloat(eval.overallScore), 0);
  const averageScore = (totalScore / evaluations.length).toFixed(2);
  
  // Update submission
  await Submission.findByIdAndUpdate(submissionId, {
    averageScore: parseFloat(averageScore)
  });
};

// Helper function to update submission rankings
const updateSubmissionRankings = async (tenderId) => {
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
  
  // Also update evaluation rankings
  for (const submission of submissions) {
    const evaluations = await Evaluation.find({ submissionId: submission._id });
    
    // Sort evaluations by overall score
    evaluations.sort((a, b) => b.overallScore - a.overallScore);
    
    // Update ranks
    for (let i = 0; i < evaluations.length; i++) {
      evaluations[i].rank = i + 1;
      await evaluations[i].save();
    }
  }
};
