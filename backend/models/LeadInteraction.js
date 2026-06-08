const mongoose = require('mongoose');

const LeadInteractionSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Call', 'Email', 'WhatsApp', 'Meeting', 'Note'], required: true },
  notes: { type: String, required: true },
  durationMinutes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LeadInteraction', LeadInteractionSchema);
