const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, switchMode, toggleMaintenance } = require('../controllers/configController');
const auth = require('../middleware/auth');

router.get('/', getConfig);
router.put('/', auth, updateConfig);
router.put('/mode', auth, switchMode);
router.put('/maintenance', auth, toggleMaintenance);

router.get('/track/:id', async (req, res) => {
  try {
    const Loan = require('../models/Loan');
    const User = require('../models/User');
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ msg: 'Application not found' });
    const user = await User.findById(loan.user).select('name');
    res.json({
      applicationId: loan._id,
      loanId: loan.loanId,
      applicant: user?.name,
      amount: loan.amount,
      status: loan.status,
      appliedOn: loan.createdAt
    });
  } catch (err) {
    res.status(500).send('Server Error or Invalid ID');
  }
});

module.exports = router;
