import React, { useState, useEffect } from 'react';
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SummaryCard from '../components/SummaryCard';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import CategoryPieChart from '../components/CategoryPieChart';
import TransactionModal from '../components/TransactionModal';
import { dashboardService, transactionService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, monthRes, catRes, transRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthlyOverview(selectedYear),
        dashboardService.getCategoryBreakdown({ type: 'expense' }),
        transactionService.getTransactions({ limit: 5, sort: '-date' }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (monthRes.success) setMonthlyData(monthRes.data.months || []);
      if (catRes.success) setCategoryData(catRes.data.categories || []);
      if (transRes.success) setRecentTransactions(transRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedYear]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleAddTransaction = async (formData) => {
    await transactionService.createTransaction(formData);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Loading financial dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Add Button Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-bold text-purple-700 dark:text-purple-400">{user?.name || 'User'}</span>! Here's your financial overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-purple-600 shadow-2xs transition-all ${
              refreshing ? 'animate-spin' : ''
            }`}
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Balance"
          amount={summary?.totalBalance || 0}
          change={summary?.balanceChange || 0}
          icon={Wallet}
          variant="purple"
          currency={user?.currency || 'INR'}
        />

        <SummaryCard
          title="Total Income"
          amount={summary?.totalIncome || 0}
          change={summary?.incomeChange || 0}
          icon={TrendingUp}
          variant="green"
          currency={user?.currency || 'INR'}
        />

        <SummaryCard
          title="Total Expenses"
          amount={summary?.totalExpense || 0}
          change={summary?.expenseChange || 0}
          icon={TrendingDown}
          variant="rose"
          currency={user?.currency || 'INR'}
        />

        <SummaryCard
          title="Budget Used"
          isProgress={true}
          progressValue={summary?.budgetUsedPercentage || 0}
          amount={summary?.totalBudget || 0}
          subtitle={`Limit: ${formatCurrency(summary?.totalBudget || 0, user?.currency || 'INR')}`}
          icon={Target}
          variant="amber"
          currency={user?.currency || 'INR'}
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart
            data={monthlyData}
            currency={user?.currency || 'INR'}
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
        </div>

        <div className="lg:col-span-1">
          <CategoryPieChart
            categories={categoryData}
            totalAmount={summary?.totalExpense || 0}
            currency={user?.currency || 'INR'}
          />
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Latest financial activity recorded on your account
            </p>
          </div>

          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 group"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <p className="font-medium">No transactions yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs font-bold text-purple-600 hover:underline"
            >
              + Add your first transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right pr-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-900 dark:text-slate-100">
                {recentTransactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-bold text-slate-900 dark:text-white">
                      {t.title}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {t.paymentMethod}
                    </td>
                    <td className="py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {formatDate(t.date)}
                    </td>
                    <td
                      className={`py-3.5 pr-2 text-right font-extrabold ${
                        t.type === 'income'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount, user?.currency || 'INR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        currency={user?.currency || 'INR'}
      />
    </div>
  );
};

export default Dashboard;
