import { create } from 'zustand';
import { useFarmStore } from './useFarmStore.js';

/**
 * Universal Farmo Calculation Engine
 * Matches exact Gujarati farming hisab format ("હિસાબ કરવાનો ફરમો")
 */
export const calculateFarmoHisab = (crop) => {
  if (!crop) return {};

  // 1. કુલ ખર્ચ રકમ (Total Expenses)
  const totalKharch = (crop.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  
  // ખર્ચ ભાગે (Shared expense per partner ratio, e.g. 50% = / 2)
  const hasPartner = !!(crop.partner?.hasPartner);
  const partnerShareRatio = (hasPartner ? (parseFloat(crop.partner.sharePercent) || 50) : 0) / 100;
  const ownerShareRatio = 1 - partnerShareRatio;
  const kharchBhageOwner = Math.round(totalKharch * ownerShareRatio);
  const kharchBhagePartner = Math.round(totalKharch * partnerShareRatio);

  // 2. કુલ ઉપાડ રકમ (Total Upad / Advance taken by partner from owner)
  const totalUpad = (crop.upad || []).reduce((sum, u) => sum + (parseFloat(u.amount) || 0), 0);

  // 3. પાક વેચાણ / વજન વિગત (Sales & Weights)
  let totalGrossWeightKg = 0;
  let totalOtherWeightKg = 0;
  let totalWeightDeductionKg = 0;
  let totalNetWeightKg = 0;
  let totalWeightInMann = 0;
  let totalMadatar = 0;

  (crop.sales || []).forEach(s => {
    const gross = parseFloat(s.grossWeightKg) || 0;
    const other = parseFloat(s.otherWeightKg) || 0;
    const deduction = parseFloat(s.weightDeductionKg) || 0;
    const net = gross + other - deduction;
    const mann = s.weightInMann !== undefined ? (parseFloat(s.weightInMann) || 0) : (net / 20);
    const rate = parseFloat(s.ratePerMann) || 0;
    const madatar = s.totalMadatar !== undefined ? (parseFloat(s.totalMadatar) || 0) : (mann * rate);

    totalGrossWeightKg += gross;
    totalOtherWeightKg += other;
    totalWeightDeductionKg += deduction;
    totalNetWeightKg += net;
    totalWeightInMann += mann;
    totalMadatar += madatar;
  });

  // Support legacy profits if present
  if ((crop.sales || []).length === 0 && (crop.profits || []).length > 0) {
    totalMadatar = (crop.profits || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const qtl = (crop.profits || []).reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
    totalNetWeightKg = qtl * 100;
    totalGrossWeightKg = totalNetWeightKg;
    totalWeightInMann = totalNetWeightKg / 20; // 1 Mann = 20 kg
  }

  // 4. ખર્ચ કપાત મદતર (Net Profit after Expense Deduction)
  // "કુલ મદતર – કુલ ખર્ચ રકમ = ખર્ચ કપાત મદતર"
  const kharchKapatMadatar = totalMadatar - totalKharch;

  // 5. ભાગે આવતી રકમ (Share of Net Profit)
  // "ખર્ચ કપાત મદતર / ૨" (for 50-50, or per partner share %)
  const bhageAavtiRakamOwner = hasPartner 
    ? Math.round(kharchKapatMadatar * ownerShareRatio) 
    : kharchKapatMadatar;
  const bhageAavtiRakamPartner = hasPartner 
    ? Math.round(kharchKapatMadatar * partnerShareRatio) 
    : 0;

  // 6. પાર્ટનર ના ભાગ નો હિસાબ:
  // "ભાગે આવતી રકમ – કુલ ઉપાડ રકમ = પાર્ટનર ના ભાગે આવતી રકમ"
  const partnerNetShare = bhageAavtiRakamPartner - totalUpad;

  // 7. આખરી વિગત:
  const maneMadelRakam = bhageAavtiRakamOwner;
  const partnerNeMadelRakam = partnerNetShare;

  // પાર્ટનર ની જોડે લેવાની રકમ (If partner took more Upad than his share)
  const partnerJodeLevaniRakam = partnerNetShare < 0 ? Math.abs(partnerNetShare) : 0;

  // પાર્ટનર ને આપવાની રકમ (If partner's share exceeds Upad)
  const partnerNeAapvaniRakam = partnerNetShare > 0 ? partnerNetShare : 0;

  return {
    totalKharch,
    kharchBhageOwner,
    kharchBhagePartner,
    totalUpad,
    totalGrossWeightKg: Number(totalGrossWeightKg.toFixed(1)),
    totalOtherWeightKg: Number(totalOtherWeightKg.toFixed(1)),
    totalWeightDeductionKg: Number(totalWeightDeductionKg.toFixed(1)),
    totalNetWeightKg: Number(totalNetWeightKg.toFixed(1)),
    totalWeightInMann: Number(totalWeightInMann.toFixed(2)),
    totalMadatar: Math.round(totalMadatar),
    kharchKapatMadatar: Math.round(kharchKapatMadatar),
    bhageAavtiRakamOwner: Math.round(bhageAavtiRakamOwner),
    bhageAavtiRakamPartner: Math.round(bhageAavtiRakamPartner),
    partnerNetShare: Math.round(partnerNetShare),
    maneMadelRakam: Math.round(maneMadelRakam),
    partnerNeMadelRakam: Math.round(partnerNeMadelRakam),
    partnerJodeLevaniRakam: Math.round(partnerJodeLevaniRakam),
    partnerNeAapvaniRakam: Math.round(partnerNeAapvaniRakam)
  };
};

// Initial seed ongoing crops demonstrating the Farmo format
const getInitialOngoingCrops = (ownerId = 'default') => [
  {
    id: 'crop_seed_1',
    ownerId,
    farmId: '',
    farmName: 'Ghar nu Khet',
    cropName: 'Cotton (BT-2)',
    variety: 'RCH-659 Hybrid',
    season: 'kharif',
    sowingDate: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetYield: 36,
    yieldUnit: 'mann',
    status: 'ongoing',
    partner: {
      hasPartner: false,
      name: '',
      phone: '',
      sharePercent: 0,
      terms: 'Self-Managed'
    },
    expenses: [
      { id: 'exp_1', date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'seeds', amount: 4800, paidBy: 'owner', notes: 'BT Cotton certified seed packet (4 bags)' },
      { id: 'exp_2', date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'fertilizer', amount: 7200, paidBy: 'owner', notes: 'DAP & Urea basal application' },
      { id: 'exp_3', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'labour', amount: 4500, paidBy: 'owner', notes: 'First weeding & thinning labour' },
      { id: 'exp_4', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'pesticide', amount: 3200, paidBy: 'owner', notes: 'Sucking pest spray (Confidor)' },
      { id: 'exp_5', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'irrigation', amount: 2000, paidBy: 'owner', notes: 'Drip system fertigation & electricity' }
    ],
    upad: [],
    sales: [
      {
        id: 'sale_1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        grossWeightKg: 520,
        otherWeightKg: 0,
        weightDeductionKg: 20,
        netWeightKg: 500,
        weightInMann: 25,
        ratePerMann: 1550,
        totalMadatar: 38750,
        buyer: 'Anand APMC Mandi',
        notes: 'Early first flower picking'
      }
    ],
    createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'crop_seed_2',
    ownerId,
    farmId: '',
    farmName: 'Kaka nu Khet',
    cropName: 'Wheat (GW-496)',
    variety: 'GW-496 Certified Gold',
    season: 'rabi',
    sowingDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetYield: 150,
    yieldUnit: 'mann',
    status: 'ongoing',
    partner: {
      hasPartner: true,
      name: 'Bhavesh Patel',
      phone: '+91 98765 43211',
      sharePercent: 50,
      terms: 'Batai 50-50 Equal Expense & Profit'
    },
    expenses: [
      { id: 'exp_10', date: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'seeds', amount: 8000, paidBy: 'shared', notes: 'Wheat seeds 200 kg' },
      { id: 'exp_11', date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'machinery', amount: 9500, paidBy: 'shared', notes: 'Tractor rotavator & laser land leveling' },
      { id: 'exp_12', date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'fertilizer', amount: 11000, paidBy: 'shared', notes: 'IFFCO NPK 12-32-16 & Zinc' },
      { id: 'exp_13', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'irrigation', amount: 5000, paidBy: 'shared', notes: 'Canal water release fee & tubewell fuel' }
    ],
    upad: [
      {
        id: 'upad_1',
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 8000,
        notes: 'Household cash advance taken by Bhavesh',
        recipient: 'Bhavesh Patel'
      },
      {
        id: 'upad_2',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 4000,
        notes: 'Personal labour assistance advance',
        recipient: 'Bhavesh Patel'
      }
    ],
    sales: [],
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useCurrentCropStore = create((set, get) => ({
  crops: [],
  loading: false,
  error: null,

  fetchCrops: (ownerId = 'default') => {
    set({ loading: true });
    try {
      const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
      const saved = localStorage.getItem(storageKey);
      let cropsList = [];

      if (saved) {
        cropsList = JSON.parse(saved);
        // Ensure every crop conforms to Farmo structure
        cropsList = cropsList.map(c => ({
          ...c,
          expenses: c.expenses || [],
          upad: c.upad || [],
          sales: c.sales || (c.profits ? c.profits.map(p => ({
            id: p.id,
            date: p.date,
            grossWeightKg: (p.quantity || 1) * 100,
            otherWeightKg: 0,
            weightDeductionKg: 0,
            netWeightKg: (p.quantity || 1) * 100,
            weightInMann: (p.quantity || 1) * 5,
            ratePerMann: Math.round(p.amount / Math.max(1, (p.quantity || 1) * 5)),
            totalMadatar: p.amount,
            buyer: p.buyer,
            notes: p.notes
          })) : [])
        }));
      } else {
        cropsList = getInitialOngoingCrops(ownerId);
        const farms = useFarmStore.getState().farms || [];
        if (farms.length > 0 && cropsList.length > 0) {
          cropsList[0].farmId = farms[0]?.id || 'farm_1';
          cropsList[0].farmName = farms[0]?.name || cropsList[0].farmName;
          if (farms[1] && cropsList[1]) {
            cropsList[1].farmId = farms[1]?.id || 'farm_2';
            cropsList[1].farmName = farms[1]?.name || cropsList[1].farmName;
          }
        }
        localStorage.setItem(storageKey, JSON.stringify(cropsList));
      }

      set({ crops: cropsList, loading: false });
      return cropsList;
    } catch (err) {
      console.error('Error fetching ongoing crops:', err);
      set({ loading: false, error: err.message });
      return [];
    }
  },

  // Create crop with universal Farmo structure
  createCrop: (cropData, ownerId = 'default') => {
    const newCrop = {
      id: `crop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ownerId,
      farmId: cropData.farmId || '',
      farmName: cropData.farmName || '',
      cropName: cropData.cropName,
      variety: cropData.variety || '',
      season: cropData.season || 'kharif',
      sowingDate: cropData.sowingDate || new Date().toISOString().split('T')[0],
      expectedHarvestDate: cropData.expectedHarvestDate || '',
      targetYield: Number(cropData.targetYield) || 0,
      yieldUnit: cropData.yieldUnit || 'mann',
      status: 'ongoing',
      partner: cropData.partner || {
        hasPartner: false,
        name: '',
        phone: '',
        sharePercent: 0,
        terms: 'Self-Managed'
      },
      expenses: cropData.expenses || [],
      upad: cropData.upad || [],
      sales: cropData.sales || [],
      createdAt: new Date().toISOString()
    };

    const currentCrops = get().crops;
    const updated = [newCrop, ...currentCrops];
    set({ crops: updated });

    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (newCrop.farmId) {
      useFarmStore.getState().editFarm(newCrop.farmId, {
        currentCrop: newCrop.cropName,
        cropSeason: newCrop.season,
        currentPartner: newCrop.partner
      });
    }

    return newCrop;
  },

  // Log Expense (ખર્ચ)
  addCropExpense: (cropId, expenseData, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        const newExpense = {
          id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: expenseData.date || new Date().toISOString().split('T')[0],
          category: expenseData.category || 'other',
          amount: parseFloat(expenseData.amount) || 0,
          paidBy: expenseData.paidBy || 'owner',
          notes: expenseData.notes || ''
        };
        return {
          ...c,
          expenses: [newExpense, ...(c.expenses || [])]
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  deleteCropExpense: (cropId, expenseId, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        return {
          ...c,
          expenses: (c.expenses || []).filter(e => e.id !== expenseId)
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  // Log Upad (ઉપાડ - Partner Cash Advance)
  addCropUpad: (cropId, upadData, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        const newUpad = {
          id: `upad_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: upadData.date || new Date().toISOString().split('T')[0],
          amount: parseFloat(upadData.amount) || 0,
          recipient: upadData.recipient || c.partner?.name || 'Partner',
          notes: upadData.notes || 'Cash advance / drawings'
        };
        return {
          ...c,
          upad: [newUpad, ...(c.upad || [])]
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  deleteCropUpad: (cropId, upadId, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        return {
          ...c,
          upad: (c.upad || []).filter(u => u.id !== upadId)
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  // Log Sale & Weight (પાક વેચાણ / મદતર)
  addCropSale: (cropId, saleData, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        const gross = parseFloat(saleData.grossWeightKg) || 0;
        const other = parseFloat(saleData.otherWeightKg) || 0;
        const deduction = parseFloat(saleData.weightDeductionKg) || 0;
        const net = gross + other - deduction;
        const mann = saleData.weightInMann !== undefined ? (parseFloat(saleData.weightInMann) || 0) : (net / 20);
        const rate = parseFloat(saleData.ratePerMann) || 0;
        const madatar = saleData.totalMadatar !== undefined ? (parseFloat(saleData.totalMadatar) || 0) : (mann * rate);

        const newSale = {
          id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: saleData.date || new Date().toISOString().split('T')[0],
          grossWeightKg: gross,
          otherWeightKg: other,
          weightDeductionKg: deduction,
          netWeightKg: net,
          weightInMann: Number(mann.toFixed(2)),
          ratePerMann: rate,
          totalMadatar: Math.round(madatar),
          buyer: saleData.buyer || '',
          notes: saleData.notes || ''
        };

        return {
          ...c,
          sales: [newSale, ...(c.sales || [])]
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  deleteCropSale: (cropId, saleId, ownerId = 'default') => {
    const currentCrops = get().crops;
    const updated = currentCrops.map(c => {
      if (c.id === cropId) {
        return {
          ...c,
          sales: (c.sales || []).filter(s => s.id !== saleId)
        };
      }
      return c;
    });

    set({ crops: updated });
    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  },

  // Finalize Harvest & Settle into Farm History using Hisab Farmo
  harvestAndSettleCrop: (cropId, harvestData = {}, ownerId = 'default') => {
    const currentCrops = get().crops;
    const targetCrop = currentCrops.find(c => c.id === cropId);
    if (!targetCrop) throw new Error('Ongoing crop not found');

    // Run Farmo calculation
    const hisab = calculateFarmoHisab(targetCrop);

    const harvestDate = harvestData.harvestDate || new Date().toISOString().split('T')[0];

    // Build category breakdown
    const categoryBreakdown = {};
    (targetCrop.expenses || []).forEach(e => {
      const cat = e.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (parseFloat(e.amount) || 0);
    });

    // Complete snapshot of "હિસાબ કરવાનો ફરમો"
    const historyRecord = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cropId: targetCrop.id,
      cropName: targetCrop.cropName,
      variety: targetCrop.variety || '',
      season: targetCrop.season,
      year: new Date(harvestDate).getFullYear(),
      sowingDate: targetCrop.sowingDate,
      harvestDate,
      
      // Farmo fields:
      totalExpenses: hisab.totalKharch,
      totalUpad: hisab.totalUpad,
      grossWeightKg: hisab.totalGrossWeightKg,
      otherWeightKg: hisab.totalOtherWeightKg,
      weightDeductionKg: hisab.totalWeightDeductionKg,
      netWeightKg: hisab.totalNetWeightKg,
      weightInMann: hisab.totalWeightInMann,
      yieldAmount: hisab.totalWeightInMann, // in Mann
      yieldUnit: 'mann',
      ratePerMann: hisab.totalWeightInMann > 0 ? Math.round(hisab.totalMadatar / hisab.totalWeightInMann) : 0,
      totalRevenue: hisab.totalMadatar, // કુલ મદતર
      kharchKapatMadatar: hisab.kharchKapatMadatar, // ખર્ચ કપાત મદતર
      netProfit: hisab.kharchKapatMadatar,
      bhageAavtiRakamOwner: hisab.bhageAavtiRakamOwner,
      bhageAavtiRakamPartner: hisab.bhageAavtiRakamPartner,
      partnerNetShare: hisab.partnerNetShare,
      partnerNeAapvaniRakam: hisab.partnerNeAapvaniRakam,
      partnerJodeLevaniRakam: hisab.partnerJodeLevaniRakam,
      
      partner: targetCrop.partner?.hasPartner ? {
        name: targetCrop.partner.name,
        phone: targetCrop.partner.phone,
        sharePercent: targetCrop.partner.sharePercent || 50,
        settledAmount: hisab.partnerNeAapvaniRakam,
        totalUpadDeducted: hisab.totalUpad,
        status: 'cleared',
        clearedAt: new Date().toISOString()
      } : null,

      expensesByCategory: categoryBreakdown,
      farmoDetails: hisab,
      notes: harvestData.notes || 'Harvest finalized and full Hisab Farmo settled.'
    };

    // Save to Farm history
    if (targetCrop.farmId) {
      useFarmStore.getState().addFarmHistory(targetCrop.farmId, historyRecord);
      useFarmStore.getState().editFarm(targetCrop.farmId, {
        currentCrop: '',
        currentPartner: null
      });
    }

    // Remove active crop
    const updated = currentCrops.filter(c => c.id !== cropId);
    set({ crops: updated });

    const storageKey = `khet_kharcha_ongoing_crops_${ownerId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    return historyRecord;
  }
}));
