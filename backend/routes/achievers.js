const express = require('express');
const router = express.Router();
const Achiever = require('../models/Achiever');

// @route   GET api/achievers
// @desc    Get all achievers for public landing page
// @access  Public
router.get('/', async (req, res) => {
  try {
    const achievers = await Achiever.find().sort({ achievedAt: -1 });
    res.json(achievers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
