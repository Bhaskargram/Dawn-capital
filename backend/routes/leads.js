const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const LeadInteraction = require('../models/LeadInteraction');
const AgentTask = require('../models/AgentTask');
const auth = require('../middleware/auth');

// POST: Create a new lead (public inquiry form)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, loanAmount, purpose, message } = req.body;
    if (!name || !email || !phone || !loanAmount) {
      return res.status(400).json({ msg: 'Name, email, phone, and loan amount are required.' });
    }
    const lead = new Lead({ name, email, phone, loanAmount, purpose, message });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Fetch all leads (Admin / Assigned Agent)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    // If not admin, only show assigned leads
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.assignedAgentId = req.user.id;
    }
    const leads = await Lead.find(query).populate('assignedAgentId', 'name email').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// GET: Fetch specific lead details including interactions and tasks
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedAgentId', 'name email');
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    
    const interactions = await LeadInteraction.find({ leadId: lead._id }).populate('agentId', 'name').sort({ createdAt: -1 });
    const tasks = await AgentTask.find({ leadId: lead._id }).sort({ dueDate: 1 });
    
    res.json({ lead, interactions, tasks });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT: Update lead (assign agent, change stage, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Add an interaction
router.post('/:id/interactions', auth, async (req, res) => {
  try {
    const { type, notes, durationMinutes } = req.body;
    const interaction = new LeadInteraction({
      leadId: req.params.id,
      agentId: req.user.id,
      type,
      notes,
      durationMinutes
    });
    await interaction.save();
    res.status(201).json(interaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST: Add a task
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const { taskType, description, dueDate } = req.body;
    const task = new AgentTask({
      agentId: req.user.id,
      leadId: req.params.id,
      taskType,
      description,
      dueDate
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// PUT: Mark task complete
router.put('/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await AgentTask.findByIdAndUpdate(req.params.taskId, { isCompleted: req.body.isCompleted }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
