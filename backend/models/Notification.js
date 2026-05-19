const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'general',
      'loan_submitted',
      'loan_pending',
      'loan_approved',
      'loan_rejected',
      'loan_overdue',
      'investment_received',
      'investment_rejected',
      'investment_matured',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
      'credit_score_update',
      'account_activity',
      'announcement'
    ],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for efficient user-based queries
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
