import { create } from 'zustand';
import { 
  addFarm, 
  updateFarm, 
  deleteFarm, 
  getFarmById, 
  getFarmsByOwner 
} from '../../../shared/services/farmService.js';

// Default initial farms with realistic historical crop archives & parameters
const getDefaultFarms = (ownerId = 'default') => [
  {
    id: 'farm_seed_1',
    ownerId,
    name: 'Ghar nu Khet',
    location: 'Anand, Gujarat',
    sizeValue: 3,
    size: 3,
    sizeUnit: 'bigha',
    ownershipType: 'own',
    soilType: 'Black Cotton',
    irrigationSource: 'Canal & Drip System',
    notes: 'Main agricultural field near homestead, fertile black soil with micro-irrigation.',
    cropSeason: 'kharif',
    currentCrop: 'Cotton (BT-2)',
    currentPartner: null,
    active: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 200 },
    cropHistory: [
      {
        id: 'hist_101',
        cropName: 'Wheat (Sharbati)',
        variety: 'GW-496',
        season: 'rabi',
        year: 2025,
        sowingDate: '2024-11-10',
        harvestDate: '2025-03-25',
        yieldAmount: 48,
        yieldUnit: 'quintal',
        mandiRate: 2250,
        totalExpenses: 24000,
        totalRevenue: 108000,
        netProfit: 84000,
        roiPercent: 350,
        partner: null,
        expensesByCategory: { seeds: 4000, fertilizer: 7500, labour: 4500, machinery: 5000, irrigation: 3000 },
        notes: 'Premium grain quality, sold to Sharbati traders at top mandi rate.'
      },
      {
        id: 'hist_102',
        cropName: 'Cotton',
        variety: 'RCH-659 Hybrid',
        season: 'kharif',
        year: 2024,
        sowingDate: '2024-06-12',
        harvestDate: '2024-11-18',
        yieldAmount: 39,
        yieldUnit: 'quintal',
        mandiRate: 7200,
        totalExpenses: 36000,
        totalRevenue: 97500,
        netProfit: 61500,
        roiPercent: 170.8,
        partner: null,
        expensesByCategory: { seeds: 5200, fertilizer: 9800, pesticide: 8500, labour: 7500, machinery: 5000 },
        notes: 'Good season, minimal bollworm damage with timely sprays.'
      },
      {
        id: 'hist_103',
        cropName: 'Mustard',
        variety: 'Pusa Bold',
        season: 'rabi',
        year: 2024,
        sowingDate: '2023-10-25',
        harvestDate: '2024-02-28',
        yieldAmount: 30,
        yieldUnit: 'quintal',
        mandiRate: 5400,
        totalExpenses: 18000,
        totalRevenue: 81000,
        netProfit: 63000,
        roiPercent: 350,
        partner: null,
        expensesByCategory: { seeds: 2500, fertilizer: 5500, irrigation: 3000, labour: 4000, machinery: 3000 },
        notes: 'High oil percentage bonus received from local oil mill.'
      },
      {
        id: 'hist_104',
        cropName: 'Moong (Green Gram)',
        variety: 'GM-4',
        season: 'zaid',
        year: 2024,
        sowingDate: '2024-03-10',
        harvestDate: '2024-05-22',
        yieldAmount: 15,
        yieldUnit: 'quintal',
        mandiRate: 7800,
        totalExpenses: 12000,
        totalRevenue: 48000,
        netProfit: 36000,
        roiPercent: 300,
        partner: null,
        expensesByCategory: { seeds: 3000, irrigation: 3500, labour: 3500, pesticide: 2000 },
        notes: 'Zaid catch crop between wheat and cotton, enriched soil nitrogen.'
      }
    ]
  },
  {
    id: 'farm_seed_2',
    ownerId,
    name: 'Kaka nu Khet',
    location: 'Nadiad, Gujarat',
    sizeValue: 5,
    size: 5,
    sizeUnit: 'bigha',
    ownershipType: 'partner',
    soilType: 'Loamy Alluvial',
    irrigationSource: 'Tubewell & Borewell',
    notes: 'Joint cultivation parcel with uncle Bhavesh Patel under equal 50-50 partnership.',
    cropSeason: 'rabi',
    currentCrop: 'Wheat (GW-496)',
    currentPartner: {
      hasPartner: true,
      name: 'Bhavesh Patel',
      phone: '+91 98765 43211',
      sharePercent: 50,
      terms: 'Batai 50-50 Equal Expense & Profit'
    },
    active: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 180 },
    cropHistory: [
      {
        id: 'hist_201',
        cropName: 'Groundnut',
        variety: 'GG-20 Bold',
        season: 'kharif',
        year: 2025,
        sowingDate: '2025-06-20',
        harvestDate: '2025-10-28',
        yieldAmount: 65,
        yieldUnit: 'quintal',
        mandiRate: 6400,
        totalExpenses: 52000,
        totalRevenue: 182000,
        netProfit: 130000,
        roiPercent: 250,
        partner: {
          name: 'Bhavesh Patel',
          phone: '+91 98765 43211',
          sharePercent: 50,
          settledAmount: 65000,
          status: 'cleared',
          clearedAt: '2025-11-05'
        },
        expensesByCategory: { seeds: 16000, fertilizer: 12000, machinery: 9000, labour: 10000, pesticide: 5000 },
        notes: 'Groundnut bumper yield, harvested with thresher, partner share cleared via bank transfer.'
      },
      {
        id: 'hist_202',
        cropName: 'Wheat',
        variety: 'GW-496',
        season: 'rabi',
        year: 2024,
        sowingDate: '2023-11-15',
        harvestDate: '2024-03-29',
        yieldAmount: 80,
        yieldUnit: 'quintal',
        mandiRate: 2275,
        totalExpenses: 40000,
        totalRevenue: 180000,
        netProfit: 140000,
        roiPercent: 350,
        partner: {
          name: 'Bhavesh Patel',
          phone: '+91 98765 43211',
          sharePercent: 50,
          settledAmount: 70000,
          status: 'cleared',
          clearedAt: '2024-04-02'
        },
        expensesByCategory: { seeds: 7000, fertilizer: 13000, irrigation: 6000, machinery: 8000, labour: 6000 },
        notes: 'Flour mill bulk purchase at premium rate, equal 70,000 profit settled.'
      },
      {
        id: 'hist_203',
        cropName: 'Soybean',
        variety: 'JS-335',
        season: 'kharif',
        year: 2024,
        sowingDate: '2024-06-22',
        harvestDate: '2024-10-10',
        yieldAmount: 55,
        yieldUnit: 'quintal',
        mandiRate: 4600,
        totalExpenses: 45000,
        totalRevenue: 143000,
        netProfit: 98000,
        roiPercent: 217.8,
        partner: {
          name: 'Bhavesh Patel',
          phone: '+91 98765 43211',
          sharePercent: 50,
          settledAmount: 49000,
          status: 'cleared',
          clearedAt: '2024-10-20'
        },
        expensesByCategory: { seeds: 11000, fertilizer: 11000, labour: 9000, machinery: 8000, pesticide: 6000 },
        notes: 'Direct delivery to oil extraction processing plant.'
      }
    ]
  },
  {
    id: 'farm_seed_3',
    ownerId,
    name: 'Pagdi Khet',
    location: 'Petlad, Gujarat',
    sizeValue: 2,
    size: 2,
    sizeUnit: 'bigha',
    ownershipType: 'leased',
    soilType: 'Sandy Loam',
    irrigationSource: 'Canal Sub-distributary',
    notes: 'Leased plot for high value spice & cash crops, annual lease rent ₹35,000.',
    cropSeason: 'rabi',
    currentCrop: 'None',
    currentPartner: null,
    active: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 150 },
    cropHistory: [
      {
        id: 'hist_301',
        cropName: 'Cumin (Jeera)',
        variety: 'Gujarat Cumin-4',
        season: 'rabi',
        year: 2025,
        sowingDate: '2024-11-05',
        harvestDate: '2025-02-24',
        yieldAmount: 18,
        yieldUnit: 'quintal',
        mandiRate: 24500,
        totalExpenses: 32000,
        totalRevenue: 220000,
        netProfit: 188000,
        roiPercent: 587.5,
        partner: null,
        expensesByCategory: { seeds: 6000, pesticide: 12000, fertilizer: 6000, labour: 5000, machinery: 3000 },
        notes: 'Record export-grade cumin prices in Unjha APMC market!'
      },
      {
        id: 'hist_302',
        cropName: 'Bajra (Pearl Millet)',
        variety: 'GHB-558',
        season: 'kharif',
        year: 2024,
        sowingDate: '2024-07-02',
        harvestDate: '2024-09-28',
        yieldAmount: 32,
        yieldUnit: 'quintal',
        mandiRate: 2150,
        totalExpenses: 16000,
        totalRevenue: 51000,
        netProfit: 35000,
        roiPercent: 218.8,
        partner: null,
        expensesByCategory: { seeds: 2500, fertilizer: 5000, labour: 4500, machinery: 4000 },
        notes: 'Good fodder plus grain harvest.'
      }
    ]
  }
];

export const useFarmStore = create((set, get) => ({
  farms: [],
  selectedFarm: null,
  loading: false,
  error: null,

  fetchFarms: async (ownerId) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const storageKey = `khet_kharcha_farms_${ownerId}`;
      const localData = localStorage.getItem(storageKey);
      
      let fetchedFarms = [];
      try {
        fetchedFarms = await getFarmsByOwner(ownerId);
      } catch (fbErr) {
        console.warn('Firestore fetch failed, checking local cache:', fbErr);
      }

      let farmsList = [];
      if (fetchedFarms && fetchedFarms.length > 0) {
        farmsList = fetchedFarms;
        // Merge with local cropHistory if available
        if (localData) {
          const parsed = JSON.parse(localData);
          farmsList = farmsList.map(f => {
            const cached = parsed.find(p => p.id === f.id);
            return {
              ...f,
              size: f.size || f.sizeValue || 1,
              sizeValue: f.sizeValue || f.size || 1,
              soilType: f.soilType || cached?.soilType || 'Black Cotton',
              irrigationSource: f.irrigationSource || cached?.irrigationSource || 'Canal & Tubewell',
              cropHistory: f.cropHistory && f.cropHistory.length > 0 ? f.cropHistory : (cached?.cropHistory || [])
            };
          });
        }
      } else if (localData) {
        farmsList = JSON.parse(localData);
      } else {
        // Initialize default farms
        farmsList = getDefaultFarms(ownerId);
        localStorage.setItem(storageKey, JSON.stringify(farmsList));
      }

      set({ farms: farmsList, loading: false });
      return farmsList;
    } catch (error) {
      console.error('Error fetching farms:', error);
      const fallback = getDefaultFarms(ownerId);
      set({ farms: fallback, loading: false, error: error.message });
      return fallback;
    }
  },

  createFarm: async (farmData) => {
    set({ loading: true, error: null });
    try {
      const ownerId = farmData.ownerId || 'default';
      let id = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      
      try {
        id = await addFarm(farmData);
      } catch (e) {
        console.warn('Firestore addFarm failed, storing locally:', e);
      }

      const newFarm = { 
        id, 
        ...farmData,
        size: farmData.size || farmData.sizeValue || 1,
        sizeValue: farmData.sizeValue || farmData.size || 1,
        soilType: farmData.soilType || 'Loamy Soil',
        irrigationSource: farmData.irrigationSource || 'Borewell',
        cropHistory: farmData.cropHistory || []
      };

      const currentFarms = get().farms;
      const updated = [newFarm, ...currentFarms];
      set({ farms: updated, loading: false });

      localStorage.setItem(`khet_kharcha_farms_${ownerId}`, JSON.stringify(updated));
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
      try {
        await updateFarm(farmId, farmData);
      } catch (e) {
        console.warn('Firestore updateFarm failed, saving locally:', e);
      }

      const currentFarms = get().farms;
      const updated = currentFarms.map(f => {
        if (f.id === farmId) {
          return {
            ...f,
            ...farmData,
            size: farmData.size || farmData.sizeValue || f.size || f.sizeValue,
            sizeValue: farmData.sizeValue || farmData.size || f.sizeValue || f.size
          };
        }
        return f;
      });

      const updatedSelected = get().selectedFarm && get().selectedFarm.id === farmId 
        ? { ...get().selectedFarm, ...farmData } 
        : get().selectedFarm;

      set({ farms: updated, selectedFarm: updatedSelected, loading: false });

      const ownerId = updated[0]?.ownerId || 'default';
      localStorage.setItem(`khet_kharcha_farms_${ownerId}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error editing farm:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  addFarmHistory: (farmId, historyRecord) => {
    const currentFarms = get().farms;
    const updated = currentFarms.map(f => {
      if (f.id === farmId) {
        const existingHistory = f.cropHistory || [];
        const newHistory = [historyRecord, ...existingHistory];
        return {
          ...f,
          cropHistory: newHistory,
          currentCrop: '' // crop has been harvested
        };
      }
      return f;
    });

    const updatedSelected = get().selectedFarm && get().selectedFarm.id === farmId
      ? { ...get().selectedFarm, cropHistory: [historyRecord, ...(get().selectedFarm.cropHistory || [])], currentCrop: '' }
      : get().selectedFarm;

    set({ farms: updated, selectedFarm: updatedSelected });

    const ownerId = updated[0]?.ownerId || 'default';
    localStorage.setItem(`khet_kharcha_farms_${ownerId}`, JSON.stringify(updated));
  },

  removeFarm: async (farmId) => {
    set({ loading: true, error: null });
    try {
      try {
        await deleteFarm(farmId);
      } catch (e) {
        console.warn('Firestore deleteFarm failed:', e);
      }

      const currentFarms = get().farms;
      const updated = currentFarms.filter((f) => f.id !== farmId);
      set({
        farms: updated,
        selectedFarm: get().selectedFarm && get().selectedFarm.id === farmId ? null : get().selectedFarm,
        loading: false
      });

      const ownerId = updated[0]?.ownerId || 'default';
      localStorage.setItem(`khet_kharcha_farms_${ownerId}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing farm:', error);
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  setSelectedFarm: (farm) => set({ selectedFarm: farm }),
}));
