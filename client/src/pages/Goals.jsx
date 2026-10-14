import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle2, TrendingUp, Trash2, Edit2, X, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Contribution Modal
  const [contributionGoal, setContributionGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionError, setContributionError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    description: '',
  });
  const [formError, setFormError] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await goalService.getGoals();
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        description: goal.description || '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        description: '',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const targetNum = parseFloat(formData.targetAmount);
    const currNum = parseFloat(formData.currentAmount || 0);

    if (!targetNum || targetNum <= 0) {
      setFormError('Please enter a valid target amount greater than zero');
      return;
    }

    if (currNum < 0) {
      setFormError('Current saved amount cannot be negative');
      return;
    }

    try {
      if (editingGoal) {
        await goalService.updateGoal(editingGoal._id, {
          ...formData,
          targetAmount: targetNum,
          currentAmount: currNum,
        });
      } else {
        await goalService.createGoal({
          ...formData,
          targetAmount: targetNum,
          currentAmount: currNum,
        });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving savings goal');
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    setContributionError('');

    const amt = parseFloat(contributionAmount);
    if (!amt || amt <= 0) {
      setContributionError('Please enter a positive contribution amount');
      return;
    }

    try {
      await goalService.addContribution(contributionGoal._id, amt);
      setContributionGoal(null);
      setContributionAmount('');
      fetchGoals();
    } catch (err) {
      setContributionError(err.response?.data?.message || 'Failed to add savings');
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await goalService.deleteGoal(deleteTargetId);
      setDeleteTargetId(null);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal', err);
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
            Financial Goals
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Track future targets, emergency funds, and milestone savings
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Loading savings goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
          <Target className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Savings Goals Yet
          </h3>
          <p className="text-xs font-medium max-w-sm mx-auto text-slate-600 dark:text-slate-400">
            Set concrete targets like buying a laptop, building an emergency fund, or vacation travel.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            + Set Your First Financial Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const isCompleted = g.isCompleted || g.progressPercentage >= 100;

            return (
              <div
                key={g._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-500 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          {g.name}
                        </h3>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                        Target date: {formatDate(g.targetDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(g)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(g._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {g.description && (
                    <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2">
                      {g.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Saved so far</span>
                      <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(g.currentAmount, user?.currency || 'INR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Goal Target</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {formatCurrency(g.targetAmount, user?.currency || 'INR')}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{g.progressPercentage}% saved</span>
                      <span>
                        Remaining:{' '}
                        <strong className="text-slate-900 dark:text-white font-extrabold">
                          {formatCurrency(g.remainingAmount, user?.currency || 'INR')}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add Contribution button */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setContributionGoal(g);
                      setContributionAmount('');
                      setContributionError('');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Add Money to Goal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Goal' : 'Create Financial Goal'}
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
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New MacBook Pro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Amount ({user?.currency === 'INR' ? '₹' : '$'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="120000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Current Saved
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Description / Motivation
                </label>
                <textarea
                  rows="2"
                  placeholder="Notes on what this goal achieves..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution / Add Money Modal */}
      {contributionGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Add Money to "{contributionGoal.name}"
              </h3>
              <button
                onClick={() => setContributionGoal(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
              Current Saved: <strong className="text-emerald-700 dark:text-emerald-400">{formatCurrency(contributionGoal.currentAmount, user?.currency || 'INR')}</strong>
            </p>

            {contributionError && (
              <div className="mt-3 p-2.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300">
                {contributionError}
              </div>
            )}

            <form onSubmit={handleAddContribution} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Deposit Amount ({user?.currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="e.g. 5000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributionGoal(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Goal"
        message="Are you sure you want to delete this financial goal?"
        onConfirm={handleDeleteGoal}
        onCancel={() => setDeleteTargetId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default Goals;
