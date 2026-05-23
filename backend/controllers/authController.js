const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ── Helpers ──
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @route   POST api/auth/register
exports.register = async (req, res) => {
  const { name, username, email, password, phone, role, address, kyc = {} } = req.body;

  // ── Issue #1: Registration validation ──
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ msg: 'Name is required and must be at least 2 characters' });
  }
  if (username && username.trim().length < 3) {
    return res.status(400).json({ msg: 'Username must be at least 3 characters' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ msg: 'A valid email address is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) return res.status(400).json({ msg: 'User already exists with this email' });
    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
      if (existingUsername) return res.status(400).json({ msg: 'Username is already taken' });
    }

    const hasKyc = Boolean(kyc.panNumber || kyc.aadhaarNumber || kyc.dateOfBirth || kyc.occupation || kyc.annualIncome);
    user = new User({
      name: name.trim(),
      username: username ? username.toLowerCase().trim() : undefined,
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      address: address || '',
      role: role || 'customer',
      kycStatus: hasKyc ? 'submitted' : 'pending',
      kyc: {
        panNumber: kyc.panNumber || '',
        aadhaarNumber: kyc.aadhaarNumber || '',
        dateOfBirth: kyc.dateOfBirth || '',
        occupation: kyc.occupation || '',
        annualIncome: Number(kyc.annualIncome) || 0,
        nomineeName: kyc.nomineeName || '',
        nomineeRelation: kyc.nomineeRelation || '',
        panDocumentUrl: kyc.panDocumentUrl || '',
        aadhaarDocumentUrl: kyc.aadhaarDocumentUrl || '',
        addressProofUrl: kyc.addressProofUrl || '',
        submittedAt: hasKyc ? new Date() : undefined
      }
    });
    await user.save();

    // ── Issue #2: Fire-and-forget welcome email ──
    const welcomeHtml = `
      <h3 style="color: #333;">Welcome to Dawn Capital, ${name.trim()}!</h3>
      <p style="color: #555; line-height: 1.6;">We're thrilled to have you onboard. Your financial journey begins now. With Dawn Capital, you can track investments, apply for loans, and monitor your credit health all in one place.</p>
      <p style="color: #555;">Log in to your dashboard to get started.</p>
      <a href="https://dawncapital.online/login" style="display: inline-block; padding: 10px 20px; background-color: #C21B2F; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
    `;
    sendEmail({ email: user.email, subject: 'Welcome to Dawn Capital!', html: welcomeHtml })
      .catch(err => console.error('Welcome email failed (non-blocking):', err.message));

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, kycStatus: user.kycStatus } });
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST api/auth/login
exports.login = async (req, res) => {
  const { identifier, email, password } = req.body;
  const loginKey = (identifier || email || '').trim();

  if (!loginKey || !password) {
    return res.status(400).json({ msg: 'Email/username and password are required' });
  }

  try {
    let user;
    if (EMAIL_RE.test(loginKey)) {
      user = await User.findOne({ email: loginKey.toLowerCase() });
    } else {
      user = await User.findOne({ username: loginKey.toLowerCase() });
    }
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    if (user.isBlocked) return res.status(403).json({ msg: 'Your account is blocked. Please contact support.' });

    // Maintenance Mode Check
    const SystemConfig = require('../models/SystemConfig');
    const config = await SystemConfig.findOne();
    if (config?.maintenance?.enabled && user.role !== 'admin') {
      return res.status(503).json({ 
        msg: 'System is under maintenance. Please try again later.', 
        maintenance: config.maintenance 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, kycStatus: user.kycStatus } });
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // ── Issue #4: Forgot-password email validation ──
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ msg: 'A valid email address is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ msg: 'No account with that email' });

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Send Reset Email
    const resetUrl = `https://dawncapital.online/reset-password/${resetToken}`;
    const resetHtml = `
      <h3 style="color: #333;">Password Reset Request</h3>
      <p style="color: #555; line-height: 1.6;">You requested a password reset. Please click the button below to set a new password. This link will expire in 30 minutes.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #C21B2F; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
    `;
    // Fire-and-forget for reset email too
    sendEmail({ to: user.email, subject: 'Password Reset Request - Dawn Capital', html: resetHtml })
      .catch(err => console.error('Reset email failed (non-blocking):', err.message));

    res.json({ msg: 'Password reset link has been sent to your email' });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ msg: 'New password must be at least 6 characters' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired reset token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
