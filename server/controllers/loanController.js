const Loan = require('../models/Loan');

// @desc    Get all loans for user with breakdown
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ dueDate: 1 });

    let totalBorrowed = 0;
    let totalLent = 0;
    let outstandingBorrowed = 0;
    let outstandingLent = 0;

    loans.forEach((loan) => {
      if (loan.type === 'borrowed') {
        totalBorrowed += loan.principalAmount;
        outstandingBorrowed += loan.outstandingAmount;
      } else {
        totalLent += loan.principalAmount;
        outstandingLent += loan.outstandingAmount;
      }
    });

    res.json({
      success: true,
      data: loans,
      summary: {
        totalBorrowed,
        totalLent,
        outstandingBorrowed,
        outstandingLent,
        netLoanBalance: outstandingLent - outstandingBorrowed, // positive if more lent out
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new loan
// @route   POST /api/loans
// @access  Private
const createLoan = async (req, res, next) => {
  try {
    const {
      name,
      type,
      principalAmount,
      interestRate = 0,
      loanDate,
      dueDate,
      repaymentFrequency = 'Monthly',
      notes,
    } = req.body;

    if (!name || !type || !principalAmount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide loan title/counterparty, type, principal amount, and due date',
      });
    }

    if (principalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount must be greater than zero',
      });
    }

    const loan = await Loan.create({
      user: req.user._id,
      name,
      type,
      principalAmount,
      interestRate: Math.max(0, interestRate),
      loanDate: loanDate || new Date(),
      dueDate,
      outstandingAmount: principalAmount,
      repaymentFrequency,
      notes: notes || '',
      repayments: [],
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Private
const updateLoan = async (req, res, next) => {
  try {
    let loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Record repayment on a loan
// @route   POST /api/loans/:id/repayments
// @access  Private
const recordRepayment = async (req, res, next) => {
  try {
    const { amount, date, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Repayment amount must be greater than zero',
      });
    }

    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    const repaymentAmount = parseFloat(amount);
    if (repaymentAmount > loan.outstandingAmount) {
      return res.status(400).json({
        success: false,
        message: `Repayment amount (₹${repaymentAmount}) cannot exceed outstanding balance (₹${loan.outstandingAmount})`,
      });
    }

    loan.repayments.push({
      amount: repaymentAmount,
      date: date || new Date(),
      note: note || '',
    });

    loan.outstandingAmount = Math.max(0, loan.outstandingAmount - repaymentAmount);
    await loan.save();

    res.json({
      success: true,
      message: 'Repayment recorded successfully',
      data: loan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a loan
// @route   DELETE /api/loans/:id
// @access  Private
const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    res.json({ success: true, message: 'Loan removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoans,
  createLoan,
  updateLoan,
  recordRepayment,
  deleteLoan,
};
