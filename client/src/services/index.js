import api from './api';

export const transactionService = {
  getTransactions: async (params = {}) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },
  getTransactionById: async (id) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },
  createTransaction: async (data) => {
    const res = await api.post('/transactions', data);
    return res.data;
  },
  updateTransaction: async (id, data) => {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  },
  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
  getMonthlyOverview: async (year) => {
    const res = await api.get('/dashboard/monthly-overview', { params: { year } });
    return res.data;
  },
  getCategoryBreakdown: async (params = {}) => {
    const res = await api.get('/dashboard/category-breakdown', { params });
    return res.data;
  },
};

export const budgetService = {
  getBudgets: async () => {
    const res = await api.get('/budgets');
    return res.data;
  },
  createBudget: async (data) => {
    const res = await api.post('/budgets', data);
    return res.data;
  },
  updateBudget: async (id, data) => {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },
  deleteBudget: async (id) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  },
};

export const goalService = {
  getGoals: async () => {
    const res = await api.get('/goals');
    return res.data;
  },
  createGoal: async (data) => {
    const res = await api.post('/goals', data);
    return res.data;
  },
  updateGoal: async (id, data) => {
    const res = await api.put(`/goals/${id}`, data);
    return res.data;
  },
  deleteGoal: async (id) => {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
  addContribution: async (id, amount) => {
    const res = await api.post(`/goals/${id}/contributions`, { amount });
    return res.data;
  },
};

export const loanService = {
  getLoans: async () => {
    const res = await api.get('/loans');
    return res.data;
  },
  createLoan: async (data) => {
    const res = await api.post('/loans', data);
    return res.data;
  },
  updateLoan: async (id, data) => {
    const res = await api.put(`/loans/${id}`, data);
    return res.data;
  },
  deleteLoan: async (id) => {
    const res = await api.delete(`/loans/${id}`);
    return res.data;
  },
  recordRepayment: async (id, data) => {
    const res = await api.post(`/loans/${id}/repayments`, data);
    return res.data;
  },
};

export const reportService = {
  getSummary: async (params = {}) => {
    const res = await api.get('/reports/summary', { params });
    return res.data;
  },
  exportCSV: async (params = {}) => {
    const res = await api.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },
};

export const settingsService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (data) => {
    const res = await api.put('/settings', data);
    return res.data;
  },
};
