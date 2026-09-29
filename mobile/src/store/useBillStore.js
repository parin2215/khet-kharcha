import { create } from 'zustand';
import { 
  addBill, 
  updateBill, 
  deleteBill, 
  markBillPaid, 
  getBillsByOwner, 
  getPendingBillsCount 
} from '../../../shared/services/billService.js';

export const useBillStore = create((set, get) => ({
  bills: [],
  pendingCount: { count: 0, total: 0 },
  loading: false,
  error: null,

  fetchBills: async (ownerId) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const bills = await getBillsByOwner(ownerId);
      set({ bills, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  createBill: async (billData) => {
    set({ loading: true, error: null });
    try {
      const id = await addBill(billData);
      set({ loading: false });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editBill: async (billId, data) => {
    set({ loading: true, error: null });
    try {
      await updateBill(billId, data);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  payBill: async (billId) => {
    set({ loading: true, error: null });
    try {
      await markBillPaid(billId);
      set((state) => ({
        bills: state.bills.map((b) => b.id === billId ? { ...b, paid: true, paidDate: new Date() } : b),
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  removeBill: async (billId) => {
    set({ loading: true, error: null });
    try {
      await deleteBill(billId);
      set((state) => ({
        bills: state.bills.filter((b) => b.id !== billId),
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchPendingSummary: async (ownerId) => {
    if (!ownerId) return;
    try {
      const pendingCount = await getPendingBillsCount(ownerId);
      set({ pendingCount });
    } catch (error) {
      console.error('Error fetching pending bills summary', error);
    }
  }
}));
