const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const Achiever = require('../models/Achiever');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const {
  createNotification,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyInvestmentReceived,
  notifyInvestmentRejected,
  notifyKYCApproved,
  notifyKYCRejected
} = require('../utils/notificationService');

// Middleware to ensure user is admin
const adminAuth = [auth, async (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied. Admins only.' });
  next();
}];

// @route   POST api/admin/investments
// @desc    Assign an Investment (FD/RD) to a user
router.post('/investments', adminAuth, async (req, res) => {
  try {
    const { userId, type, amount, interestRate, rate, durationMonths, duration } = req.body;
    const finalInterestRate = Number(interestRate ?? rate ?? 0);
    const months = Number(durationMonths ?? duration ?? 0);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + months);

    const investment = new Investment({ user: userId, type, amount, interestRate: finalInterestRate, durationMonths: months, maturityDate });
    await investment.save();
    
    // Send investment received notification
    const user = await User.findById(userId);
    if (user) {
      await notifyInvestmentReceived(user._id, amount, type, user.email, user.phone).catch(err => console.error('Notification failed:', err));
    }
    
    res.json(investment);
  } catch (err) {
    console.error('INVESTMENT CREATE ERROR:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/loans
// @desc    Assign a Loan to a user
router.post('/loans', adminAuth, async (req, res) => {
  try {
    const { userId, amount, interestRate, durationMonths, emiAmount } = req.body;
    const loan = new Loan({ user: userId, amount, interestRate, durationMonths, emiAmount, status: 'active', disbursedDate: new Date() });
    await loan.save();
    res.json(loan);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/loans/pending
// @desc    Get all pending loan applications
router.get('/loans/pending', adminAuth, async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'pending' }).populate('user', 'name email phone');
    res.json(loans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/loans/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, emiAmount, interestRate, rejectionReason } = req.body;
    const updates = {};

    if (status !== undefined) updates.status = status;
    if (status === 'approved') {
      updates.status = 'active';
      updates.disbursedDate = new Date();
    }
    if (emiAmount !== undefined) updates.emiAmount = Number(emiAmount);
    if (interestRate !== undefined) updates.interestRate = Number(interestRate);
    if (rejectionReason !== undefined) updates.rejectionReason = rejectionReason;

    const loan = await Loan.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).populate('user', 'name email phone');
    
    // Send notification based on status
    if (loan && loan.user) {
      if (status === 'approved' || status === 'active') {
        await notifyLoanApproved(
          loan.user._id,
          loan.amount,
          loan.loanId,
          loan.user.email,
          loan.user.phone
        ).catch(err => console.error('Notification failed:', err));
      } else if (status === 'rejected') {
        await notifyLoanRejected(
          loan.user._id,
          loan.loanId,
          rejectionReason || 'Application criteria not met',
          loan.user.email,
          loan.user.phone
        ).catch(err => console.error('Notification failed:', err));
      }
    }
    
    res.json(loan);
  } catch (err) {
    console.error('LOAN STATUS UPDATE ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/notifications
// @desc    Send a notification to one or more users
router.post('/notifications', adminAuth, async (req, res) => {
  try {
    const { userId, userIds, all = false, title, message, type = 'general', sendSMS = false } = req.body;
    let recipients = [];

    if (all) {
      recipients = await User.find({ isBlocked: { $ne: true } }).select('_id email phone');
    } else if (Array.isArray(userIds) && userIds.length > 0) {
      recipients = await User.find({ _id: { $in: userIds } }).select('_id email phone');
    } else if (userId) {
      const user = await User.findById(userId).select('_id email phone');
      if (user) recipients = [user];
    }

    if (recipients.length === 0) {
      return res.status(400).json({ msg: 'No recipients selected or found.' });
    }

    const notifications = await Promise.all(recipients.map(user => {
      return createNotification(user._id, title, message, type === 'announcement' ? 'announcement' : type, {
        email: user.email,
        phone: user.phone,
        sms: sendSMS
      });
    }));

    res.json({ count: notifications.length, recipients: recipients.map(u => u._id), notifications });
  } catch (err) {
    console.error('SEND NOTIFICATIONS ERROR:', err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update a user's details (name, phone, KYC, credit score, wallet)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, kycStatus, creditScore, referralWallet, walletBalance, address, role, isBlocked, kyc } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    
    // KYC status change - trigger notification
    if (kycStatus !== undefined) {
      updates.kycStatus = kycStatus;
      updates['kyc.reviewedAt'] = new Date();
      updates['kyc.reviewedBy'] = req.user.id;
      if (kycStatus === 'verified') updates['kyc.rejectionReason'] = '';
    }
    
    if (creditScore !== undefined) updates.creditScore = Number(creditScore);
    if (referralWallet !== undefined) updates.referralWallet = Number(referralWallet);
    if (walletBalance !== undefined) updates.walletBalance = Number(walletBalance);
    if (address !== undefined) updates.address = address;
    if (role !== undefined) updates.role = role;
    if (isBlocked !== undefined) updates.isBlocked = isBlocked;
    if (kyc?.rejectionReason !== undefined) updates['kyc.rejectionReason'] = kyc.rejectionReason;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select('-password');
    
    // Send KYC notifications
    if (user && kycStatus) {
      if (kycStatus === 'verified') {
        await notifyKYCApproved(user._id, user.email, user.phone).catch(err => console.error('Notification failed:', err));
      } else if (kycStatus === 'rejected') {
        await notifyKYCRejected(user._id, kyc?.rejectionReason || 'Documents not clear', user.email, user.phone).catch(err => console.error('Notification failed:', err));
      }
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/achievers
// @desc    Add an Achiever to the public board
router.post('/achievers', adminAuth, async (req, res) => {
  try {
    const { name, title, description, imageUrl } = req.body;
    const achiever = new Achiever({ name, title, description, imageUrl });
    await achiever.save();
    res.json(achiever);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/announcements
// @desc    Add a global Announcement
router.post('/announcements', adminAuth, async (req, res) => {
  try {
    const { title, message, type, isActive, target } = req.body;
    const Announcement = require('../models/Announcement');
    const announcement = new Announcement({ title, message, type, isActive, target });
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/announcements/:id
// @desc    Update a global Announcement
router.put('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/loans
// @desc    Get all loans (active, pending, rejected)
router.get('/loans', adminAuth, async (req, res) => {
  try {
    const loans = await Loan.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/loans/all
// @desc    Explicit alias for listing loans
router.get('/loans/all', adminAuth, async (req, res) => {
  try {
    const loans = await Loan.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/leads
// @desc    List all landing page leads/quote requests
router.get('/leads', adminAuth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/leads/all
// @desc    Explicit alias for listing leads
router.get('/leads/all', adminAuth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/leads/:id/status
// @desc    Update a lead status
router.put('/leads/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/leads/:id
// @desc    Update a lead status (alias)
router.put('/leads/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/leads/:id
// @desc    Delete a lead record
router.delete('/leads/:id', adminAuth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Lead deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/loans/:id
// @desc    Delete a loan
router.delete('/loans/:id', adminAuth, async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Loan deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/announcements
// @desc    Get all global Announcements
router.get('/announcements', adminAuth, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/announcements/all
// @desc    Explicit alias for listing announcements
router.get('/announcements/all', adminAuth, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/announcements/:id
// @desc    Delete a global Announcement
router.delete('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Announcement deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/investments/all
// @desc    Get all user investments
router.get('/investments/all', adminAuth, async (req, res) => {
  try {
    const investments = await Investment.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/investments/:id/status
// @desc    Update investment status
router.put('/investments/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, rejectionReason, maturityAmount } = req.body;
    const investment = await Investment.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true }).populate('user', 'name email phone');
    
    // Send status notifications
    if (investment && investment.user) {
      if (status === 'rejected') {
        await notifyInvestmentRejected(
          investment.user._id,
          investment.type,
          rejectionReason || 'Documents not complete',
          investment.user.email,
          investment.user.phone
        ).catch(err => console.error('Notification failed:', err));
      } else if (status === 'matured') {
        const totalMaturity = maturityAmount || investment.amount * (1 + investment.interestRate / 100);
        await notifyInvestmentMatured(
          investment.user._id,
          investment.amount,
          totalMaturity,
          investment.type,
          investment.user.email,
          investment.user.phone
        ).catch(err => console.error('Notification failed:', err));
      }
    }
    
    res.json(investment);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/investments/:id
// @desc    Delete an investment record
router.delete('/investments/:id', adminAuth, async (req, res) => {
  try {
    await Investment.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Investment deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
