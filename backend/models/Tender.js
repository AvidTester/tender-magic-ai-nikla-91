
const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['IT', 'Construction', 'Equipment', 'Supply', 'Services', 'Other']
    },
    status: {
      type: String,
      enum: ['Draft', 'Open', 'Under Review', 'Evaluation', 'Awarded', 'Cancelled'],
      default: 'Draft'
    },
    budget: {
      type: String,
      required: [true, 'Please add a budget']
    },
    organization: {
      type: String,
      required: [true, 'Please add an organization']
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline']
    },
    endDate: {
      type: Date
    },
    documents: [
      {
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
    winner: {
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vendorName: String,
      score: Number,
      submissionDate: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    disputeTimeFrameDays: {
      type: Number,
      default: 7
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Reverse populate with submissions
TenderSchema.virtual('submissions', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'tenderId',
  justOne: false
});

// Reverse populate with disputes
TenderSchema.virtual('disputes', {
  ref: 'Dispute',
  localField: '_id',
  foreignField: 'tenderId',
  justOne: false
});

module.exports = mongoose.model('Tender', TenderSchema);
