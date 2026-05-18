const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET api/portfolio
// @desc    Get user's complete financial portfolio
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user financial documents
    const investments = await Investment.find({ user: userId }).sort({ createdAt: -1 });
    const loans = await Loan.find({ user: userId }).sort({ createdAt: -1 });
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

    // Calculate total portfolio value (mock logic: sum of active investments)
    const totalInvestments = investments.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.amount : 0), 0);
    const totalLoans = loans.reduce((acc, curr) => acc + (curr.status !== 'closed' ? curr.amount : 0), 0);

    res.json({
      summary: {
        totalInvestments,
        totalLoans,
        netWorth: totalInvestments - totalLoans
      },
      investments,
      loans,
      recentTransactions: transactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
