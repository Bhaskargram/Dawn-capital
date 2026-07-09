const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000
  },
  purpose: { type: String, default: 'Personal' },
  loanType: { type: String, default: 'Personal' },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  monthlyIncome: { type: Number, default: 0, min: 0 },
  interestRate: {
    type: Number,
    default: 12
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1,
    max: 360
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'],
    default: 'pending'
  },
  emiAmount: {
    type: Number,
    default: 0
  },
  loanId: {
    type: String,
    unique: true
  },
  disbursedDate: {
    type: Date
  },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

LoanSchema.pre('save', async function() {
  if (!this.loanId) {
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      try {
        const count = await this.constructor.countDocuments();
        const nextId = 1000 + count + 1 + attempts;
        const candidateId = `DAWN${nextId}`;
        const existing = await this.constructor.findOne({ loanId: candidateId });
        if (!existing) {
          this.loanId = candidateId;
          isUnique = true;
        } else {
          attempts++;
        }
      } catch (err) {
        console.error('Loan ID generation error:', err);
        this.loanId = `DAWN${Math.floor(Math.random() * 90000) + 10000}`;
        isUnique = true;
      }
    }
    if (!isUnique) {
      this.loanId = `DAWN${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900) + 100}`;
    }
  }
});

module.exports = mongoose.model('Loan', LoanSchema);
