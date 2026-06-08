const mongoose = require('mongoose');

const AgentTaskSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  taskType: { type: String, enum: ['Follow-up Call', 'Send Document', 'Meeting', 'Other'], required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('AgentTask', AgentTaskSchema);
