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
      'loan_approved',
      'loan_rejected',
      'loan_overdue',
      'investment_received',
      'investment_rejected',
      'investment_matured',
      'kyc_submitted',
      'kyc_approved',
      'kyc_rejected',
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
