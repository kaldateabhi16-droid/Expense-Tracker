import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const COLORS = [
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#64748b', // Slate
];

const CustomPieTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          {data.category}
        </p>
        <p className="text-purple-600 dark:text-purple-400 font-bold">
          {formatCurrency(data.amount, currency)}
        </p>
        <p className="text-slate-400 text-[11px]">
          {data.percentage}% of total expenses
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ categories = [], totalAmount = 0, currency = 'INR' }) => {
  const hasData = categories && categories.length > 0 && totalAmount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Spending by Category
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribution of expenses across key categories
        </p>
      </div>

      {!hasData ? (
        <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-sm">
          <p>No expense data for this period.</p>
          <span className="text-xs text-slate-400 mt-1">Add transactions to see distribution</span>
        </div>
      ) : (
        <div className="w-full h-72 sm:h-80 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="amount"
                nameKey="category"
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip currency={currency} />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
            <span className="text-[11px] text-slate-400 font-medium block">Total</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
