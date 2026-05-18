const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

// @route   GET api/public/track-loan/:loanId
// @desc    Track loan status publicly using the unique loan ID
// @access  Public
router.get('/track-loan/:loanId', async (req, res) => {
  try {
    const loan = await Loan.findOne({ loanId: req.params.loanId })
      .populate('user', 'name')
      .select('amount status loanId createdAt updatedAt durationMonths');
    
    if (!loan) {
      return res.status(404).json({ msg: 'Loan application not found.' });
    }
    
    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/public/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/announcements', async (req, res) => {
  try {
    const { target } = req.query;
    const Announcement = require('../models/Announcement');
    const query = { isActive: true };
    if (target) {
      query.target = { $in: [target, 'both'] };
    }
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
