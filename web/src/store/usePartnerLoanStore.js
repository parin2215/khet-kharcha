import { create } from 'zustand';
import * as loanService from '../../../shared/services/partnerLoanService.js';

export const usePartnerLoanStore = create((set, get) => ({
  loans: [],
  loading: false,
  error: null,

  fetchLoansByPartner: async (partnerId) => {
    set({ loading: true, error: null });
    try {
      const loans = await loanService.getLoansByPartner(partnerId);
      set({ loans, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createLoan: async (loanData) => {
    try {
      await loanService.addLoan(loanData);
    } catch (error) {
      throw error;
    }
  },

  updateLoan: async (loanId, data) => {
    try {
      await loanService.updateLoan(loanId, data);
    } catch (error) {
      throw error;
    }
  },

  removeLoan: async (loanId) => {
    try {
      await loanService.deleteLoan(loanId);
    } catch (error) {
      throw error;
    }
  },

  clearPendingLoans: async (partnerId) => {
    try {
      await loanService.clearPendingLoansForPartner(partnerId);
    } catch (error) {
      throw error;
    }
  }
}));
