import { create } from 'zustand';
import { 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  getExpenses, 
  getExpenseTotals, 
  getCategoryBreakdown, 
  getFarmWiseTotals 
} from '../../../shared/services/expenseService.js';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  totals: { total: 0, own: 0, partner: 0 },
  categoryBreakdown: [],
  farmWiseTotals: [],

  fetchExpenses: async (ownerId, filters = {}) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const expenses = await getExpenses({ ownerId, ...filters });
      set({ expenses, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  createExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const id = await addExpense(expenseData);
      set({ loading: false });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editExpense: async (expenseId, expenseData) => {
    set({ loading: true, error: null });
    try {
      await updateExpense(expenseId, expenseData);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  removeExpense: async (expenseId) => {
    set({ loading: true, error: null });
    try {
      await deleteExpense(expenseId);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchStats: async (ownerId, filters = {}) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const totals = await getExpenseTotals(ownerId, filters);
      const categoryBreakdown = await getCategoryBreakdown(ownerId, filters);
      const farmWiseTotals = await getFarmWiseTotals(ownerId, filters);
      set({ totals, categoryBreakdown, farmWiseTotals, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  }
}));
