import { create } from 'zustand';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getTransactions 
} from '../../../shared/services/transactionService.js';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (ownerId, filters = {}) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactions({ ownerId, ...filters });
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ loading: false, error: error.message });
    }
  },

  createTransaction: async (txData) => {
    set({ loading: true, error: null });
    try {
      const id = await addTransaction(txData);
      // Wait for fetchTransactions to be called later or append locally
      set({ loading: false });
      return id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editTransaction: async (txId, txData) => {
    set({ loading: true, error: null });
    try {
      await updateTransaction(txId, txData);
      set({ loading: false });
    } catch (error) {
      console.error('Error editing transaction:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  removeTransaction: async (txId) => {
    set({ loading: true, error: null });
    try {
      await deleteTransaction(txId);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== txId),
        loading: false
      }));
    } catch (error) {
      console.error('Error removing transaction:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  }
}));
