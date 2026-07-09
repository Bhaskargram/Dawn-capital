const mongoose = require('mongoose');

const InvestmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  returnPercentage: {
    type: String, // e.g., '8-12%' or '10%'
    required: true
  },
  returnType: {
    type: String, // e.g., 'Fixed', 'Variable'
    default: 'Fixed'
  },
  frequency: {
    type: String, // e.g., 'Monthly', 'Yearly'
    default: 'Monthly'
  },
  dateRange: {
    type: String, // e.g., '15 to 25'
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InvestmentPlan', InvestmentPlanSchema);
