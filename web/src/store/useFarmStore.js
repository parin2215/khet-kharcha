import { create } from 'zustand';
import { 
  addFarm, 
  updateFarm, 
  deleteFarm, 
  getFarmById, 
  getFarmsByOwner 
} from '../../../shared/services/farmService.js';

export const useFarmStore = create((set, get) => ({
  farms: [],
  selectedFarm: null,
  loading: false,
  error: null,

  fetchFarms: async (ownerId) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const farms = await getFarmsByOwner(ownerId);
      set({ farms, loading: false });
    } catch (error) {
      console.error('Error fetching farms:', error);
      set({ loading: false, error: error.message });
    }
  },

  createFarm: async (farmData) => {
    set({ loading: true, error: null });
    try {
      const id = await addFarm(farmData);
      const newFarm = { id, ...farmData };
      set((state) => ({ 
        farms: [newFarm, ...state.farms], 
        loading: false 
      }));
      return id;
    } catch (error) {
      console.error('Error creating farm:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editFarm: async (farmId, farmData) => {
    set({ loading: true, error: null });
    try {
      await updateFarm(farmId, farmData);
      set((state) => ({
        farms: state.farms.map((f) => (f.id === farmId ? { ...f, ...farmData } : f)),
        selectedFarm: state.selectedFarm && state.selectedFarm.id === farmId 
          ? { ...state.selectedFarm, ...farmData } 
          : state.selectedFarm,
        loading: false
      }));
    } catch (error) {
      console.error('Error editing farm:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  removeFarm: async (farmId) => {
    set({ loading: true, error: null });
    try {
      await deleteFarm(farmId);
      set((state) => ({
        farms: state.farms.filter((f) => f.id !== farmId),
        selectedFarm: state.selectedFarm && state.selectedFarm.id === farmId ? null : state.selectedFarm,
        loading: false
      }));
    } catch (error) {
      console.error('Error removing farm:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  setSelectedFarm: (farm) => set({ selectedFarm: farm }),
}));
