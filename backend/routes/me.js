const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { notifyLoanSubmitted, notifyKYCSubmitted } = require('../utils/notificationService');
const auth = require('../middleware/auth');

// @route   GET api/me
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('GET /me ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/me — Update own profile
router.put('/', auth, async (req, res) => {
  try {
    const { name, phone, address, profileImage, kyc } = req.body;
    const updates = {};
    
    if (name) {
      if (name.trim().length < 2) return res.status(400).json({ msg: 'Name must be at least 2 characters' });
      updates.name = name.trim();
    }
    
    if (phone !== undefined) {
      if (phone && !/^[0-9\-\+()\ ]{6,}$/.test(phone)) return res.status(400).json({ msg: 'Invalid phone number' });
      updates.phone = phone;
    }
    
    if (address !== undefined) {
      if (address && address.trim().length < 5) return res.status(400).json({ msg: 'Address must be at least 5 characters' });
      updates.address = address;
    }
    
    if (profileImage !== undefined) updates.profileImage = profileImage;
    
    if (kyc !== undefined) {
      // KYC Validation
      const requiredFields = ['panNumber', 'aadhaarNumber', 'dateOfBirth', 'occupation', 'annualIncome', 'panDocumentUrl', 'aadhaarDocumentUrl', 'addressProofUrl'];
      const missingFields = requiredFields.filter(field => !kyc[field] || kyc[field].toString().trim() === '');
      
      const missingMedia = [];
      if (!kyc.livePhotoUrl && !kyc.selfieUrl) missingMedia.push('livePhotoUrl');
      if (!kyc.liveVideoUrl && !kyc.videoUrl) missingMedia.push('liveVideoUrl');

      if (missingFields.length > 0 || missingMedia.length > 0) {
        return res.status(400).json({ msg: `Missing required KYC fields: ${[...missingFields, ...missingMedia].join(', ')}` });
      }
      
      if (kyc.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(kyc.panNumber)) {
        return res.status(400).json({ msg: 'Invalid PAN format (should be like AAAAA1234A)' });
      }
      
      if (kyc.annualIncome && kyc.annualIncome < 0) {
        return res.status(400).json({ msg: 'Annual income cannot be negative' });
      }

      // ── Issue #8: KYC date validation ──
      if (kyc.dateOfBirth) {
        const dob = new Date(kyc.dateOfBirth);
        if (isNaN(dob.getTime())) {
          return res.status(400).json({ msg: 'Date of birth is not a valid date' });
        }
        if (dob > new Date()) {
          return res.status(400).json({ msg: 'Date of birth cannot be in the future' });
        }
        const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) {
          return res.status(400).json({ msg: 'You must be at least 18 years old' });
        }
      }
      
      const existing = await User.findById(req.user.id).select('kyc');
      updates.kyc = {
        ...(existing?.kyc?.toObject?.() || existing?.kyc || {}),
        panNumber: kyc.panNumber,
        aadhaarNumber: kyc.aadhaarNumber,
        dateOfBirth: kyc.dateOfBirth,
        occupation: kyc.occupation,
        annualIncome: Number(kyc.annualIncome),
        nomineeName: kyc.nomineeName,
        nomineeRelation: kyc.nomineeRelation,
        panDocumentUrl: kyc.panDocumentUrl,
        aadhaarDocumentUrl: kyc.aadhaarDocumentUrl,
        addressProofUrl: kyc.addressProofUrl,
        selfieUrl: kyc.selfieUrl || kyc.livePhotoUrl || '',
        livePhotoUrl: kyc.livePhotoUrl || kyc.selfieUrl || '',
        liveVideoUrl: kyc.liveVideoUrl || kyc.videoUrl || '',
        videoUrl: kyc.videoUrl || kyc.liveVideoUrl || '',
        rejectionReason: '',
        submittedAt: new Date()
      };
      updates.kycStatus = 'submitted';
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    if (updates.kycStatus === 'submitted' && user) {
      notifyKYCSubmitted(user._id, user.email, user.phone).catch(err => console.error('KYC notification failed:', err.message));
    }
    res.json(user);
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err.message);
    res.status(500).json({ msg: 'Failed to update profile', error: err.message });
  }
});

// @route   PUT api/me/password — Change own password
// ── Issue #3: Password length validation ──
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('PASSWORD CHANGE ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/me/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ── Issue #5: Mark notification as read ──
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    console.error('MARK READ ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('MARK ALL READ ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ── Issue #7: GET own loans ──
router.get('/loans', auth, async (req, res) => {
  try {
    const Loan = require('../models/Loan');
    const loans = await Loan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error('GET MY LOANS ERROR:', err.message);
    res.status(500).json({ msg: 'Failed to fetch loans' });
  }
});

// @route   POST api/me/loans — Apply for a new loan
router.post('/loans', auth, async (req, res) => {
  try {
    const { amount, durationMonths, purpose, monthlyIncome } = req.body;
    
    if (!amount || !durationMonths) {
      return res.status(400).json({ msg: 'Amount and duration are required' });
    }
    if (amount < 1000 || amount > 1000000) {
      return res.status(400).json({ msg: 'Loan amount must be between 1000 and 1000000' });
    }
    if (durationMonths < 1 || durationMonths > 360) {
      return res.status(400).json({ msg: 'Duration must be between 1 and 360 months' });
    }
    if (monthlyIncome && monthlyIncome < 0) {
      return res.status(400).json({ msg: 'Monthly income cannot be negative' });
    }

    const Loan = require('../models/Loan');
    const loan = new Loan({
      user: req.user.id,
      amount: Number(amount),
      durationMonths: Number(durationMonths),
      purpose: purpose || 'Personal',
      monthlyIncome: Number(monthlyIncome) || 0,
      interestRate: 12,
      status: 'pending',
      emiAmount: 0
    });
    
    const savedLoan = await loan.save();
    const populatedLoan = await Loan.findById(savedLoan._id).populate('user', 'name email phone');
    
    // Send notification asynchronously
    if (populatedLoan && populatedLoan.user) {
      notifyLoanSubmitted(populatedLoan.user._id, populatedLoan.amount, populatedLoan.loanId, populatedLoan.user.email, populatedLoan.user.phone)
        .catch(err => console.error('Loan submit notification failed:', err.message));
    }
    
    res.status(201).json(populatedLoan);
  } catch (err) {
    console.error('LOAN APPLICATION ERROR:', err.message);
    res.status(500).json({ msg: 'Failed to submit loan application', error: err.message });
  }
});

// ── Issue #6: GET own investments ──
router.get('/investments', auth, async (req, res) => {
  try {
    const Investment = require('../models/Investment');
    const investments = await Investment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    console.error('GET MY INVESTMENTS ERROR:', err.message);
    res.status(500).json({ msg: 'Failed to fetch investments' });
  }
});

// ── FCM Token Management ──
router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ msg: 'Token is required' });
    
    // Add token if not exists
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { fcmTokens: token }
    });
    res.json({ msg: 'FCM token registered' });
  } catch (err) {
    console.error('FCM TOKEN REGISTER ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/fcm-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ msg: 'Token is required' });
    
    // Remove specific token
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { fcmTokens: token }
    });
    res.json({ msg: 'FCM token removed' });
  } catch (err) {
    console.error('FCM TOKEN REMOVE ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

