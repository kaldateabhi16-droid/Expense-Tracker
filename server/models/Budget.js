const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide budget name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide budget limit amount'],
      min: [1, 'Budget limit must be at least 1'],
    },
    period: {
      type: String,
      enum: ['monthly', 'weekly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category budget for the same user if active
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: false });

module.exports = mongoose.model('Budget', budgetSchema);
