const mongoose = require('mongoose');

const AchieverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  achievedAt: {
    type: Date,
    default: Date.now
  },
  dateOfAchievement: {
    type: Date,
    default: Date.now
  },
  investmentType: {
    type: String,
    default: ''
  },
  planName: {
    type: String,
    default: ''
  },
  personName: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Achiever', AchieverSchema);
