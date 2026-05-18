const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  loanAmount: { type: String, required: true },
  purpose: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'rejected', 'pending', 'closed'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
