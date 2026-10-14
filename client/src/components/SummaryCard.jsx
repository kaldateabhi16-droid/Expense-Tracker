import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const SummaryCard = ({
  title,
  amount,
  change,
  icon: Icon,
  variant = 'purple',
  isProgress = false,
  progressValue = 0,
  currency = 'INR',
  subtitle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'purple':
        return {
          iconBg: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
          badgeText: 'text-purple-700 dark:text-purple-300 font-bold',
          badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
          borderAccent: 'border-l-4 border-l-purple-600',
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
          badgeText: 'text-emerald-700 dark:text-emerald-300 font-bold',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
          borderAccent: 'border-l-4 border-l-emerald-600',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
          badgeText: 'text-rose-700 dark:text-rose-300 font-bold',
          badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
          borderAccent: 'border-l-4 border-l-rose-600',
        };
      case 'amber':
      default:
        return {
          iconBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
          badgeText: 'text-amber-700 dark:text-amber-300 font-bold',
          badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
          borderAccent: 'border-l-4 border-l-amber-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${styles.borderAccent}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {title}
        </span>
        <div className={`p-3 rounded-xl ${styles.iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isProgress ? `${progressValue}%` : formatCurrency(amount, currency)}
        </h3>

        {/* Progress or Trend Percentage Indicator */}
        <div className="mt-3 flex items-center justify-between">
          {isProgress ? (
            <div className="w-full">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                <span>{subtitle || 'Monthly Limit'}</span>
                <span>{amount ? formatCurrency(amount, currency) : '₹0'}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressValue > 100
                      ? 'bg-rose-600'
                      : progressValue >= 80
                      ? 'bg-amber-500'
                      : 'bg-purple-600'
                  }`}
                  style={{ width: `${Math.min(progressValue, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              {change > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-800 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  +{change}%
                </span>
              ) : change < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-800 dark:text-rose-300 font-extrabold bg-rose-100 dark:bg-rose-950/70 px-2.5 py-1 rounded-md">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                  {change}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-slate-700 dark:text-slate-300 font-bold bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <Minus className="w-3.5 h-3.5" />
                  0%
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400 font-medium text-xs ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
