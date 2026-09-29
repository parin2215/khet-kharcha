import { create } from 'zustand';
import { 
  addPartner, 
  updatePartner, 
  deletePartner, 
  getPartnersByFarm, 
  getPartnersByOwner, 
  addSettlement, 
  getSettlementsByFarm 
} from '../../../shared/services/partnerService.js';

export const usePartnerStore = create((set, get) => ({
  partners: [],
  settlements: [],
  loading: false,
  error: null,

  fetchPartners: async (ownerId) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const partners = await getPartnersByOwner(ownerId);
      set({ partners, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  fetchPartnersByFarm: async (farmId) => {
    if (!farmId) return;
    set({ loading: true, error: null });
    try {
      const partners = await getPartnersByFarm(farmId);
      set({ partners, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  createPartner: async (partnerData) => {
    set({ loading: true, error: null });
    try {
      const id = await addPartner(partnerData);
      set({ loading: false });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editPartner: async (partnerId, data) => {
    set({ loading: true, error: null });
    try {
      await updatePartner(partnerId, data);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  removePartner: async (partnerId, farmId) => {
    set({ loading: true, error: null });
    try {
      await deletePartner(partnerId);
      set((state) => ({
        partners: state.partners.filter((p) => p.id !== partnerId),
        loading: false
      }));
      if (farmId) {
        const db = await import('../../../shared/services/farmService.js');
        const farm = await db.getFarmById(farmId);
        if (farm && farm.partners) {
          const updatedPartners = farm.partners.filter((p) => p.partnerId !== partnerId);
          await db.updateFarm(farmId, { partners: updatedPartners });
        }
      }
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  fetchSettlements: async (farmId) => {
    if (!farmId) return;
    set({ loading: true, error: null });
    try {
      const settlements = await getSettlementsByFarm(farmId);
      set({ settlements, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  createSettlement: async (settlementData) => {
    set({ loading: true, error: null });
    try {
      const id = await addSettlement(settlementData);
      const farmId = settlementData.farmId;
      const settlements = await getSettlementsByFarm(farmId);
      const partners = await getPartnersByFarm(farmId);
      set({ settlements, partners, loading: false });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  }
}));
