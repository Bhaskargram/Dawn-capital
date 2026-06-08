const mongoose = require('mongoose');

const AccountingLedgerSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  description: { 
    type: String 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  receiptUrl: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('AccountingLedger', AccountingLedgerSchema);
