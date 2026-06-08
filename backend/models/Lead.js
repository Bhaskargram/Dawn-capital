const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  loanAmount: { type: String, required: true },
  purpose: { type: String, default: '' },
  message: { type: String, default: '' },
  
  // New CRM Fields
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  funnelStage: { 
    type: String, 
    enum: ['New', 'Attempted to Contact', 'In Discussion', 'Document Collection', 'Converted', 'Lost'], 
    default: 'New' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  expectedLoanValue: { type: Number, default: 0 },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  
  // Legacy status mapping
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'rejected', 'pending', 'closed'], default: 'new' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
