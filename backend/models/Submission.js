
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tender',
      required: true
    },
    tenderTitle: {
      type: String,
      required: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vendorName: {
      type: String,
      required: true
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Evaluated', 'Winner', 'Rejected'],
      default: 'Submitted'
    },
    rejectionDate: {
      type: Date
    },
    documents: [
      {
        id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        size: {
          type: String,
          required: true
        },
        url: {
          type: String
        }
      }
    ],
    averageScore: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Reverse populate with evaluations
SubmissionSchema.virtual('evaluations', {
  ref: 'Evaluation',
  localField: '_id',
  foreignField: 'submissionId',
  justOne: false
});

module.exports = mongoose.model('Submission', SubmissionSchema);
