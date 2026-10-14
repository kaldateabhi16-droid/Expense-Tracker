const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets with real calculated spent amount and status
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ user: userId });

    // Fetch this month's expense transactions
    const expenses = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Map spending per category
    const categorySpent = {};
    expenses.forEach((e) => {
      categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
    });

    const budgetsWithProgress = budgets.map((b) => {
      const spent = categorySpent[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentageUsed = Math.round((spent / b.amount) * 100);

      let status = 'normal';
      if (percentageUsed >= 100) status = 'exceeded';
      else if (percentageUsed >= 80) status = 'warning';

      return {
        _id: b._id,
        name: b.name,
        category: b.category,
        amount: b.amount,
        period: b.period,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentageUsed,
        status,
        createdAt: b.createdAt,
      };
    });

    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const totalSpent = budgetsWithProgress.reduce((acc, b) => acc + b.spent, 0);
    const totalRemaining = Math.max(0, totalBudget - totalSpent);

    res.json({
      success: true,
      data: budgetsWithProgress,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { name, category, amount, period } = req.body;

    if (!name || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide budget name, category, and limit amount',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be greater than zero',
      });
    }

    // Check duplicate category budget
    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      period: period || 'monthly',
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A budget for category "${category}" already exists for this period. Edit the existing one instead.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      name,
      category,
      amount,
      period: period || 'monthly',
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (req.body.amount && req.body.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget limit amount must be greater than zero',
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
