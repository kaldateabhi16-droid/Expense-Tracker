const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Repayment amount must be positive'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide loan title or counterparty name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify loan type: borrowed or lent'],
      enum: ['borrowed', 'lent'],
    },
    principalAmount: {
      type: Number,
      required: [true, 'Please provide principal amount'],
      min: [1, 'Principal must be at least 1'],
    },
    interestRate: {
      type: Number,
      default: 0,
      min: [0, 'Interest rate cannot be negative'],
    },
    loanDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide loan due date'],
    },
    outstandingAmount: {
      type: Number,
      required: true,
    },
    repaymentFrequency: {
      type: String,
      enum: ['One-time', 'Monthly', 'Weekly', 'Quarterly'],
      default: 'Monthly',
    },
    notes: {
      type: String,
      default: '',
    },
    repayments: [repaymentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Loan', loanSchema);
