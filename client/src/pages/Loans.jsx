import React, { useState, useEffect } from 'react';
import {
  Plus,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Percent,
  CheckCircle,
  Trash2,
  Edit2,
  X,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loanService } from '../services';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';

const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState({
    totalBorrowed: 0,
    totalLent: 0,
    outstandingBorrowed: 0,
    outstandingLent: 0,
    netLoanBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Repayment Modal
  const [repaymentTargetLoan, setRepaymentTargetLoan] = useState(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentNote, setRepaymentNote] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [repaymentError, setRepaymentError] = useState('');

  // History Modal
  const [historyLoan, setHistoryLoan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'borrowed',
    principalAmount: '',
    interestRate: '0',
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    repaymentFrequency: 'Monthly',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await loanService.getLoans();
      if (res.success) {
        setLoans(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch loans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleOpenModal = (loan = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        name: loan.name,
        type: loan.type,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate || '0',
        loanDate: loan.loanDate ? new Date(loan.loanDate).toISOString().split('T')[0] : '',
        dueDate: loan.dueDate ? new Date(loan.dueDate).toISOString().split('T')[0] : '',
        repaymentFrequency: loan.repaymentFrequency || 'Monthly',
        notes: loan.notes || '',
      });
    } else {
      setEditingLoan(null);
      setFormData({
        name: '',
        type: 'borrowed',
        principalAmount: '',
        interestRate: '0',
        loanDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        repaymentFrequency: 'Monthly',
        notes: '',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const principal = parseFloat(formData.principalAmount);
    const interest = parseFloat(formData.interestRate || 0);

    if (!principal || principal <= 0) {
      setFormError('Please enter a valid principal loan amount');
      return;
    }

    if (interest < 0) {
      setFormError('Interest rate cannot be negative');
      return;
    }

    try {
      if (editingLoan) {
        await loanService.updateLoan(editingLoan._id, {
          ...formData,
          principalAmount: principal,
          interestRate: interest,
        });
      } else {
        await loanService.createLoan({
          ...formData,
          principalAmount: principal,
          interestRate: interest,
        });
      }
      setIsModalOpen(false);
      fetchLoans();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving loan record');
    }
  };

  const handleRecordRepayment = async (e) => {
    e.preventDefault();
    setRepaymentError('');

    const amt = parseFloat(repaymentAmount);
    if (!amt || amt <= 0) {
      setRepaymentError('Please enter a valid repayment amount');
      return;
    }

    try {
      await loanService.recordRepayment(repaymentTargetLoan._id, {
        amount: amt,
        date: repaymentDate,
        note: repaymentNote,
      });
      setRepaymentTargetLoan(null);
      setRepaymentAmount('');
      setRepaymentNote('');
      fetchLoans();
    } catch (err) {
      setRepaymentError(err.response?.data?.message || 'Failed to record repayment');
    }
  };

  const handleDeleteLoan = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await loanService.deleteLoan(deleteTargetId);
      setDeleteTargetId(null);
      fetchLoans();
    } catch (err) {
      console.error('Failed to delete loan', err);
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
            Loans & Debts
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Track borrowed and lent amounts, interest, and repayment history
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Loan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              You Owe (Borrowed)
            </span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">
            {formatCurrency(summary.outstandingBorrowed, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
            Principal total: {formatCurrency(summary.totalBorrowed, user?.currency || 'INR')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Owed to You (Lent)
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(summary.outstandingLent, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
            Principal total: {formatCurrency(summary.totalLent, user?.currency || 'INR')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Net Outstanding Balance
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-extrabold mt-2 ${
              summary.netLoanBalance >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {formatCurrency(summary.netLoanBalance, user?.currency || 'INR')}
          </p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
            {summary.netLoanBalance >= 0 ? 'You are net positive' : 'You have net debt'}
          </span>
        </div>
      </div>

      {/* Loans Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Loading loan records...</span>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 space-y-3">
          <Banknote className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Active Loans Recorded
          </h3>
          <p className="text-xs font-medium max-w-sm mx-auto text-slate-600 dark:text-slate-400">
            Easily manage loans given to friends or debts taken from lenders and keep tabs on repayments.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
          >
            + Record First Loan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loans.map((loan) => {
            const isSettled = loan.outstandingAmount <= 0;
            const isBorrowed = loan.type === 'borrowed';

            return (
              <div
                key={loan._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase border ${
                            isBorrowed
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isBorrowed ? 'Borrowed' : 'Lent Out'}
                        </span>
                        {isSettled && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                            Fully Settled
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">
                        {loan.name}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                        Due: {formatDate(loan.dueDate)} • {loan.repaymentFrequency}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(loan)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Loan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(loan._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {loan.notes && (
                    <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2">
                      {loan.notes}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Principal</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {formatCurrency(loan.principalAmount, user?.currency || 'INR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Interest Rate</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {loan.interestRate}% p.a.
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Remaining Outstanding</span>
                    <span
                      className={`text-2xl font-extrabold ${
                        isSettled
                          ? 'text-slate-400'
                          : isBorrowed
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {formatCurrency(loan.outstandingAmount, user?.currency || 'INR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  {!isSettled && (
                    <button
                      onClick={() => {
                        setRepaymentTargetLoan(loan);
                        setRepaymentAmount('');
                        setRepaymentNote('');
                        setRepaymentError('');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-colors text-center"
                    >
                      Record Repayment
                    </button>
                  )}

                  <button
                    onClick={() => setHistoryLoan(loan)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="View Repayment History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Repayment Modal */}
      {repaymentTargetLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Record Repayment
              </h3>
              <button
                onClick={() => setRepaymentTargetLoan(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
              For: <strong className="text-slate-900 dark:text-white">{repaymentTargetLoan.name}</strong> • Outstanding: {formatCurrency(repaymentTargetLoan.outstandingAmount, user?.currency || 'INR')}
            </p>

            {repaymentError && (
              <div className="mt-3 p-2.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300">
                {repaymentError}
              </div>
            )}

            <form onSubmit={handleRecordRepayment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Repayment Amount ({user?.currency === 'INR' ? '₹' : '$'}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  max={repaymentTargetLoan.outstandingAmount}
                  step="0.01"
                  required
                  autoFocus
                  placeholder="e.g. 2500"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={repaymentDate}
                  onChange={(e) => setRepaymentDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="Installment or ref ID"
                  value={repaymentNote}
                  onChange={(e) => setRepaymentNote(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRepaymentTargetLoan(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-sm"
                >
                  Save Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment History Modal */}
      {historyLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Repayment History
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{historyLoan.name}</span>
              </div>
              <button
                onClick={() => setHistoryLoan(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {historyLoan.repayments.length === 0 ? (
                <p className="text-center text-xs font-semibold text-slate-500 py-6">
                  No repayments recorded yet for this loan.
                </p>
              ) : (
                historyLoan.repayments.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(r.amount, user?.currency || 'INR')}
                      </p>
                      {r.note && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{r.note}</span>}
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">{formatDate(r.date)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Loan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingLoan ? 'Edit Loan Record' : 'Record Loan'}
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
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  disabled={!!editingLoan}
                  onClick={() => setFormData({ ...formData, type: 'borrowed' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.type === 'borrowed'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  I Borrowed (Debt)
                </button>
                <button
                  type="button"
                  disabled={!!editingLoan}
                  onClick={() => setFormData({ ...formData, type: 'lent' })}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.type === 'lent'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  I Lent Out (Credit)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Title / Counterparty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma, HDFC Personal Loan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Principal Amount ({user?.currency === 'INR' ? '₹' : '$'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="50000"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Loan Date
                  </label>
                  <input
                    type="date"
                    value={formData.loanDate}
                    onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Repayment Frequency
                </label>
                <select
                  value={formData.repaymentFrequency}
                  onChange={(e) => setFormData({ ...formData, repaymentFrequency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Terms, collateral, or notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Loan Record"
        message="Are you sure you want to delete this loan record and its complete repayment history?"
        onConfirm={handleDeleteLoan}
        onCancel={() => setDeleteTargetId(null)}
        loading={isDeleting}
      />
    </div>
  );
};

export default Loans;
