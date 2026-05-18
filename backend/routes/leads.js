const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

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

module.exports = router;
