import React, { useState, useEffect } from 'react';
import { Plus, PieChart as PieIcon, AlertTriangle, AlertCircle, CheckCircle, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { budgetService } from '../services';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/formatters';

const CATEGORIES = [
  'Food',
  'Bills',
  'Shopping',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Education',
  'Housing',
  'Groceries',
  'Other',
];

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Food',
    amount: '',
    period: 'monthly',
  });

  const fetchBudgets = async () => {
    try {
      const res = await budgetService.getBudgets();
      if (res.success) {
        setBudgets(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        period: budget.period || 'monthly',
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: '',
        category: 'Food',
        amount: '',
        period: 'monthly',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      setFormError('Please enter a valid budget limit amount');
      return;
    }

    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, {
          name: formData.name,
          amount: amt,
        });
      } else {
        await budgetService.createBudget({
          ...formData,
          amount: amt,
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving budget');
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await budgetService.deleteBudget(deleteTargetId);
      setDeleteTargetId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Budget Management
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Set category spending limits and monitor budget utilization
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Budget
        </button>
      </div>

      {/* Top Overview Cards with Multicolor Crystal Borders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-600 shadow-xs">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Total Monthly Budget
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(summary.totalBudget, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Across {budgets.length} active categories
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-600 shadow-xs">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Actual Spent This Month
          </span>
          <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-2">
            {formatCurrency(summary.totalSpent, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {summary.overallPercentage}% total limit consumed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-600 shadow-xs">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Remaining Budget
          </span>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(summary.totalRemaining, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Available until end of month
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Loading budgets...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
          <PieIcon className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Budgets Set Yet
          </h3>
          <p className="text-xs font-medium max-w-sm mx-auto text-slate-600 dark:text-slate-400">
            Creating monthly category limits helps keep expenses under control and highlights spending spikes early.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
          >
            + Set Your First Category Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.percentageUsed >= 100;
            const isWarning = b.percentageUsed >= 80 && b.percentageUsed < 100;

            return (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Status Warning Banner */}
                {isExceeded ? (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 px-3 py-1 rounded-lg mb-3">
                    <AlertCircle className="w-4 h-4" />
                    Budget limit exceeded by {b.percentageUsed - 100}%!
                  </div>
                ) : isWarning ? (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-3 py-1 rounded-lg mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    Warning: 80% threshold reached
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-lg mb-3">
                    <CheckCircle className="w-4 h-4" />
                    On track
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {b.name}
                      </h3>
                      <span className="text-xs text-purple-700 dark:text-purple-400 font-bold">
                        {b.category} • Monthly
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Limit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(b._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Spent</span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(b.spent, user?.currency || 'INR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Limit</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(b.amount, user?.currency || 'INR')}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-600'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>{b.percentageUsed}% used</span>
                      <span>
                        Remaining:{' '}
                        <strong className="text-slate-900 dark:text-white font-extrabold">
                          {formatCurrency(b.remaining, user?.currency || 'INR')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Set Category Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Budget Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dining Out Budget"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Category *
                </label>
                <select
                  disabled={!!editingBudget}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Monthly Limit Amount ({user?.currency === 'INR' ? '₹' : '$'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 8000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/30"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Budget"
        message="Are you sure you want to remove this budget? Existing expense records will remain untouched."
        onConfirm={handleDeleteBudget}
        onCancel={() => setDeleteTargetId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default Budgets;
