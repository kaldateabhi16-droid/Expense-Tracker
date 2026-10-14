import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services';
import { formatCurrency } from '../utils/formatters';

const FILTERS = [
  { label: 'Current Month', value: 'current_month' },
  { label: 'Previous Month', value: 'previous_month' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'Current Year', value: 'current_year' },
  { label: 'Custom Range', value: 'custom' },
];

const Reports = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('current_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { filter };
      if (filter === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const res = await reportService.getSummary(params);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = { filter };
      if (filter === 'custom' && customStart && customEnd) {
        params.startDate = customStart;
        params.endDate = customEnd;
      }
      const blob = await reportService.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expense_Report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Reports
          </h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
            Deep dive financial analytics, savings rates, and automated CSV export
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          {exporting ? 'Exporting...' : 'Export CSV Report'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f.value
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 hover:text-slate-950'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            />
            <span className="text-slate-500 font-semibold">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            />
            <button
              onClick={fetchReports}
              className="px-3.5 py-1.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">Generating analytical report...</span>
        </div>
      ) : !reportData ? (
        <div className="py-20 text-center text-slate-500">No report data found.</div>
      ) : (
        <>
          {/* Key Metrics Row with Crystal Multicolor Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Total Inflow (Income)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
                {formatCurrency(reportData.totalIncome, user?.currency || 'INR')}
              </p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">During selected timeframe</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Total Outflow (Expenses)
              </span>
              <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">
                {formatCurrency(reportData.totalExpenses, user?.currency || 'INR')}
              </p>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">During selected timeframe</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-500 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Net Savings
              </span>
              <p
                className={`text-2xl font-extrabold mt-2 ${
                  reportData.netSavings >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {formatCurrency(reportData.netSavings, user?.currency || 'INR')}
              </p>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 block">
                Savings Rate: <strong className="text-cyan-700 dark:text-cyan-400 font-extrabold">{reportData.savingsRate}%</strong>
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 border-l-4 border-l-purple-500 shadow-xs">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Highest Expense Category
              </span>
              <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-2">
                {reportData.highestSpendingCategory.category}
              </p>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 block">
                {formatCurrency(reportData.highestSpendingCategory.amount, user?.currency || 'INR')} ({reportData.highestSpendingCategory.percentage}%)
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Financial Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                Monthly Breakdown Summary
              </h3>

              {reportData.monthlySummary.length === 0 ? (
                <p className="text-xs font-semibold text-slate-500 py-6 text-center">
                  No monthly transactions in this date interval
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                        <th className="pb-2.5">Period</th>
                        <th className="pb-2.5 text-right">Income</th>
                        <th className="pb-2.5 text-right">Expense</th>
                        <th className="pb-2.5 text-right">Net Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {reportData.monthlySummary.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 font-bold text-slate-900 dark:text-white">
                            {m.month}
                          </td>
                          <td className="py-3 text-right text-emerald-700 dark:text-emerald-400 font-extrabold">
                            {formatCurrency(m.income, user?.currency || 'INR')}
                          </td>
                          <td className="py-3 text-right text-rose-700 dark:text-rose-400 font-extrabold">
                            {formatCurrency(m.expenses, user?.currency || 'INR')}
                          </td>
                          <td
                            className={`py-3 text-right font-extrabold ${
                              m.savings >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {formatCurrency(m.savings, user?.currency || 'INR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Category-wise Spending */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                Category-wise Expense Allocation
              </h3>

              {reportData.categoryBreakdown.length === 0 ? (
                <p className="text-xs font-semibold text-slate-500 py-6 text-center">
                  No categorized expenses recorded in this period
                </p>
              ) : (
                <div className="space-y-4">
                  {reportData.categoryBreakdown.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        <span>{cat.category}</span>
                        <span>
                          {formatCurrency(cat.amount, user?.currency || 'INR')}{' '}
                          <span className="text-purple-600 font-extrabold">({cat.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
