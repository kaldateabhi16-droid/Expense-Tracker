const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper to get start and end dates
const getDateRange = (period, customYear) => {
  const now = new Date();
  const year = customYear ? parseInt(customYear, 10) : now.getFullYear();

  const currentMonthStart = new Date(year, now.getMonth(), 1);
  const currentMonthEnd = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

  const prevMonthStart = new Date(year, now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(year, now.getMonth(), 0, 23, 59, 59, 999);

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  return { currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd, yearStart, yearEnd };
};

// @desc    Get dashboard 4 summary cards
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd } = getDateRange();

    // 1. All-time balances
    const allTransactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;

    allTransactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (t.type === 'income') {
        totalIncome += t.amount;
        if (tDate >= currentMonthStart && tDate <= currentMonthEnd) {
          currentMonthIncome += t.amount;
        } else if (tDate >= prevMonthStart && tDate <= prevMonthEnd) {
          prevMonthIncome += t.amount;
        }
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        if (tDate >= currentMonthStart && tDate <= currentMonthEnd) {
          currentMonthExpense += t.amount;
        } else if (tDate >= prevMonthStart && tDate <= prevMonthEnd) {
          prevMonthExpense += t.amount;
        }
      }
    });

    const totalBalance = totalIncome - totalExpense;

    // Percentage changes
    const incomeChange =
      prevMonthIncome > 0
        ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
        : currentMonthIncome > 0 ? 100 : 0;

    const expenseChange =
      prevMonthExpense > 0
        ? ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100
        : currentMonthExpense > 0 ? 100 : 0;

    // Balance change (current month net savings vs previous month net savings)
    const currentMonthNet = currentMonthIncome - currentMonthExpense;
    const prevMonthNet = prevMonthIncome - prevMonthExpense;
    const balanceChange =
      prevMonthNet !== 0
        ? ((currentMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100
        : currentMonthNet !== 0 ? 100 : 0;

    // 2. Total Budget vs Expenses
    const activeBudgets = await Budget.find({ user: userId });
    const totalBudgetLimit = activeBudgets.reduce((acc, b) => acc + b.amount, 0);

    const budgetUsedPercentage =
      totalBudgetLimit > 0
        ? Math.min(Math.round((currentMonthExpense / totalBudgetLimit) * 100), 999)
        : 0;

    res.json({
      success: true,
      data: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        balanceChange: Math.round(balanceChange * 10) / 10,
        totalIncome: Math.round(totalIncome * 100) / 100,
        currentMonthIncome: Math.round(currentMonthIncome * 100) / 100,
        incomeChange: Math.round(incomeChange * 10) / 10,
        totalExpense: Math.round(totalExpense * 100) / 100,
        currentMonthExpense: Math.round(currentMonthExpense * 100) / 100,
        expenseChange: Math.round(expenseChange * 10) / 10,
        totalBudget: Math.round(totalBudgetLimit * 100) / 100,
        budgetUsedPercentage,
        transactionCount: allTransactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly overview for Income vs Expenses Chart
// @route   GET /api/dashboard/monthly-overview
// @access  Private
const getMonthlyOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfYear, $lte: endOfYear },
    });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyData = monthNames.map((month) => ({
      name: month,
      income: 0,
      expense: 0,
      savings: 0,
    }));

    transactions.forEach((t) => {
      const monthIdx = new Date(t.date).getMonth();
      if (t.type === 'income') {
        monthlyData[monthIdx].income += t.amount;
      } else {
        monthlyData[monthIdx].expense += t.amount;
      }
    });

    monthlyData.forEach((m) => {
      m.savings = m.income - m.expense;
      m.income = Math.round(m.income);
      m.expense = Math.round(m.expense);
      m.savings = Math.round(m.savings);
    });

    res.json({
      success: true,
      data: {
        year,
        months: monthlyData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown for Pie / Donut Chart
// @route   GET /api/dashboard/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, type = 'expense' } = req.query;

    const query = { user: userId, type };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    const transactions = await Transaction.find(query);

    const categoryMap = {};
    let totalAmount = 0;

    transactions.forEach((t) => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
      totalAmount += t.amount;
    });

    const breakdown = Object.keys(categoryMap).map((cat) => {
      const amount = categoryMap[cat];
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        category: cat,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    // Sort descending by amount
    breakdown.sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        categories: breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getMonthlyOverview,
  getCategoryBreakdown,
};
