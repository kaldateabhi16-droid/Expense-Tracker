const Transaction = require('../models/Transaction');

// Helper to filter dates
const getFilterDateRange = (filter, customStart, customEnd) => {
  const now = new Date();
  let start = new Date(0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filter === 'current_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === 'previous_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter === 'last_3_months') {
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else if (filter === 'last_6_months') {
    start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  } else if (filter === 'current_year') {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (filter === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

// @desc    Get detailed report summary and financial metrics
// @route   GET /api/reports/summary
// @access  Private
const getReportSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { filter = 'current_month', startDate, endDate } = req.query;
    const { start, end } = getFilterDateRange(filter, startDate, endDate);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenses = {};
    const monthlySummaryMap = {};

    transactions.forEach((t) => {
      const monthKey = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlySummaryMap[monthKey]) {
        monthlySummaryMap[monthKey] = { month: monthKey, income: 0, expenses: 0, savings: 0 };
      }

      if (t.type === 'income') {
        totalIncome += t.amount;
        monthlySummaryMap[monthKey].income += t.amount;
      } else {
        totalExpenses += t.amount;
        monthlySummaryMap[monthKey].expenses += t.amount;
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      }
    });

    Object.values(monthlySummaryMap).forEach((m) => {
      m.savings = m.income - m.expenses;
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;

    // Highest spending category
    let highestCategory = { category: 'None', amount: 0, percentage: 0 };
    const categoryBreakdown = Object.keys(categoryExpenses).map((cat) => {
      const amount = categoryExpenses[cat];
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      if (amount > highestCategory.amount) {
        highestCategory = { category: cat, amount, percentage: Math.round(percentage * 10) / 10 };
      }
      return {
        category: cat,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    // Average monthly expenses
    const numMonths = Math.max(1, Object.keys(monthlySummaryMap).length);
    const averageMonthlyExpenses = Math.round((totalExpenses / numMonths) * 100) / 100;

    res.json({
      success: true,
      data: {
        filter,
        dateRange: { start, end },
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate,
        highestSpendingCategory: highestCategory,
        averageMonthlyExpenses,
        monthlySummary: Object.values(monthlySummaryMap),
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as CSV for reports
// @route   GET /api/reports/export
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { filter = 'all', startDate, endDate } = req.query;

    const query = { user: userId };
    if (filter !== 'all') {
      const { start, end } = getFilterDateRange(filter, startDate, endDate);
      query.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const headers = [
      'ID',
      'Title',
      'Type',
      'Category',
      'Amount',
      'Date',
      'Payment Method',
      'Description',
    ];

    const rows = transactions.map((t) => [
      `"${t._id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${new Date(t.date).toISOString().split('T')[0]}"`,
      `"${t.paymentMethod}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="expense_report_${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportSummary,
  exportTransactionsCSV,
};
