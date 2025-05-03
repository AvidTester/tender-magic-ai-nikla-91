
const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema(
  {
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: true
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    evaluatorName: {
      type: String,
      required: true
    },
    scores: {
      technical: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      financial: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      experience: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      implementation: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    },
    comments: {
      type: String
    },
    overallScore: {
      type: Number,
      required: true
    },
    rank: {
      type: Number,
      default: 0
    },
    evaluationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Evaluation', EvaluationSchema);
