const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const AccountingLedger = require('../models/AccountingLedger');

// @route   GET api/admin/accounting/ledger
// @desc    Get all ledger entries
router.get('/ledger', adminAuth, async (req, res) => {
  try {
    const entries = await AccountingLedger.find().populate('recordedBy', ['name']).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/accounting/ledger
// @desc    Add new ledger entry
router.post('/ledger', adminAuth, async (req, res) => {
  try {
    const { type, category, amount, date, description, receiptUrl } = req.body;
    
    if (!type || !category || !amount) {
      return res.status(400).json({ msg: 'Please provide type, category, and amount' });
    }

    const newEntry = new AccountingLedger({
      type,
      category,
      amount: Number(amount),
      date: date || new Date(),
      description,
      receiptUrl,
      recordedBy: req.user.id
    });

    const entry = await newEntry.save();
    res.json(entry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/accounting/ledger/:id
// @desc    Delete a ledger entry
router.delete('/ledger/:id', adminAuth, async (req, res) => {
  try {
    const entry = await AccountingLedger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ msg: 'Entry not found' });
    }
    
    await AccountingLedger.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/accounting/summary
// @desc    Get income, expense, and profit summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const entries = await AccountingLedger.find();
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    entries.forEach(entry => {
      if (entry.type === 'income') totalIncome += entry.amount;
      else if (entry.type === 'expense') totalExpense += entry.amount;
    });

    const netProfit = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      totalEntries: entries.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
