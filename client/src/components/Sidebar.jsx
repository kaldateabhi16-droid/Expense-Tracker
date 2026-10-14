import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Banknote,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'text-purple-600 dark:text-purple-400' },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight, color: 'text-blue-600 dark:text-blue-400' },
  { name: 'Budgets', path: '/budgets', icon: PieChart, color: 'text-amber-600 dark:text-amber-400' },
  { name: 'Goals', path: '/goals', icon: Target, color: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'Loans', path: '/loans', icon: Banknote, color: 'text-rose-600 dark:text-rose-400' },
  { name: 'Reports', path: '/reports', icon: FileBarChart2, color: 'text-cyan-600 dark:text-cyan-400' },
  { name: 'Settings', path: '/settings', icon: Settings, color: 'text-indigo-600 dark:text-indigo-400' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Logo */}
        <div>
          <div className="flex items-center justify-between h-20 px-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
                    Expense Tracker
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Financial Management
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                    `
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : item.color
                        }`}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Attribution */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {!isCollapsed ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Expense Tracker v1.0</p>
              <p>© 2026 Personal Finance</p>
              <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Pure Crystal UI</p>
            </div>
          ) : (
            <div className="flex justify-center text-[10px] text-purple-600 font-bold">
              v1.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
