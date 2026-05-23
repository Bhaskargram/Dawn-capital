const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'manager', 'support'], default: 'customer' },
  isBlocked: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['pending', 'submitted', 'verified', 'approved', 'rejected'], default: 'pending' },
  kyc: {
    panNumber: { type: String, default: '' },
    aadhaarNumber: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    occupation: { type: String, default: '' },
    annualIncome: { type: Number, default: 0 },
    nomineeName: { type: String, default: '' },
    nomineeRelation: { type: String, default: '' },
    panDocumentUrl: { type: String, default: '' },
    aadhaarDocumentUrl: { type: String, default: '' },
    addressProofUrl: { type: String, default: '' },
    selfieUrl: { type: String, default: '' },
    livePhotoUrl: { type: String, default: '' },
    liveVideoUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  creditScore: { type: Number, default: 0 },
  referralWallet: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  profileImage: { type: String, default: '' },
  address: { type: String, default: '' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  fcmTokens: [{ type: String }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate password reset token
UserSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return token;
};

module.exports = mongoose.model('User', UserSchema);
