import { create } from 'zustand';
import * as advanceService from '../../../shared/services/advanceService.js';

export const useAdvanceStore = create((set, get) => ({
  advances: [],
  loading: false,
  error: null,

  fetchAdvances: async (ownerId) => {
    set({ loading: true, error: null });
    try {
      const advances = await advanceService.getAdvancesByOwner(ownerId);
      set({ advances, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createAdvance: async (advanceData) => {
    try {
      await advanceService.addAdvance(advanceData);
    } catch (error) {
      throw error;
    }
  },

  updateAdvance: async (advanceId, data) => {
    try {
      await advanceService.updateAdvance(advanceId, data);
    } catch (error) {
      throw error;
    }
  },

  removeAdvance: async (advanceId) => {
    try {
      await advanceService.deleteAdvance(advanceId);
    } catch (error) {
      throw error;
    }
  },
}));
