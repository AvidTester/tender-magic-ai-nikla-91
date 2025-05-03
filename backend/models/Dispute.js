
const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema(
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
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    winnerName: {
      type: String
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    responseText: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: {
      type: Date
    },
    disputeType: {
      type: String,
      enum: ['winner', 'rejection'],
      default: 'winner'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Dispute', DisputeSchema);
