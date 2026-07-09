const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['FD', 'RD', 'Plan'],
    required: true
  },
  investmentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestmentPlan'
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  durationMonths: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'matured', 'withdrawn'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
