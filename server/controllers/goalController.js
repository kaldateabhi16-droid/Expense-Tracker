const Goal = require('../models/Goal');

// @desc    Get all user savings goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ targetDate: 1 });

    const goalsWithProgress = goals.map((g) => {
      const percentage =
        g.targetAmount > 0
          ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100)
          : 0;
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);

      return {
        _id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        description: g.description,
        progressPercentage: percentage,
        remainingAmount: remaining,
        isCompleted: g.currentAmount >= g.targetAmount,
        createdAt: g.createdAt,
      };
    });

    res.json({ success: true, data: goalsWithProgress });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount = 0, targetDate, description } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide goal name, target amount, and target date',
      });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than zero',
      });
    }

    if (currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Initial saved amount cannot be negative',
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      currentAmount: Math.max(0, currentAmount),
      targetDate,
      description: description || '',
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal details
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (req.body.targetAmount && req.body.targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than zero',
      });
    }

    if (req.body.currentAmount !== undefined && req.body.currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative',
      });
    }

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Add money / deposit contribution to a goal
// @route   POST /api/goals/:id/contributions
// @access  Private
const addGoalContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contribution amount must be greater than zero',
      });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    goal.currentAmount += parseFloat(amount);
    await goal.save();

    res.json({
      success: true,
      message: 'Savings added successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  addGoalContribution,
  deleteGoal,
};
