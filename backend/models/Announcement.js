const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
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
    enum: ['info', 'warning', 'success', 'danger'],
    default: 'info'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  target: {
    type: String,
    enum: ['landing', 'portal', 'both'],
    default: 'both'
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
