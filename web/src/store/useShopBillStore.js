import { create } from 'zustand';
import { 
  addShop, 
  updateShop, 
  deleteShop, 
  getShopsByOwner,
  addShopBill, 
  updateShopBill, 
  deleteShopBill, 
  toggleShopBillPaid, 
  getShopBillsByOwner 
} from '../../../shared/services/shopBillService.js';

// Default initial demo shops if empty
const getDefaultShops = (ownerId = 'default') => [
  {
    id: `shop_seed_1_${ownerId}`,
    ownerId,
    name: 'Sardar Krushi Kendra',
    ownerName: 'Rameshbhai Patel',
    phone: '+91 98250 12345',
    location: 'APMC Market, Anand',
    category: 'Fertilizers & Pesticides',
    notes: 'Main agro dealer for IFFCO fertilizers & pest control sprays.',
    createdAt: new Date().toISOString()
  },
  {
    id: `shop_seed_2_${ownerId}`,
    ownerId,
    name: 'Kisan Agro Seeds & Tools',
    ownerName: 'Bhavesh Shah',
    phone: '+91 94260 67890',
    location: 'Station Road, Nadiad',
    category: 'Seeds & Agro Equipment',
    notes: 'Certified hybrid seeds and drip irrigation fittings.',
    createdAt: new Date().toISOString()
  }
];

const getDefaultBills = (ownerId = 'default') => [
  {
    id: `sbill_seed_101_${ownerId}`,
    shopId: `shop_seed_1_${ownerId}`,
    ownerId,
    billNumber: 'INV-4021',
    billDate: '2026-10-18',
    itemsSummary: 'IFFCO DAP (50kg) 3 Bags + Urea 2 Bags',
    category: 'fertilizer',
    amount: 4650,
    paid: false,
    paidDate: null,
    notes: 'Taken on 30-day khata for wheat preparation'
  },
  {
    id: `sbill_seed_102_${ownerId}`,
    shopId: `shop_seed_1_${ownerId}`,
    ownerId,
    billNumber: 'INV-3890',
    billDate: '2026-09-15',
    itemsSummary: 'Coragen Insecticide (60ml) 2 Bottles',
    category: 'pesticide',
    amount: 1950,
    paid: true,
    paidDate: '2026-09-20',
    notes: 'Paid via GPay'
  },
  {
    id: `sbill_seed_201_${ownerId}`,
    shopId: `shop_seed_2_${ownerId}`,
    ownerId,
    billNumber: 'B-1082',
    billDate: '2026-10-25',
    itemsSummary: 'GW-496 Wheat Certified Seeds (40kg)',
    category: 'seeds',
    amount: 3200,
    paid: false,
    paidDate: null,
    notes: 'Payment due on harvest advance'
  }
];

export const useShopBillStore = create((set, get) => ({
  shops: [],
  bills: [],
  selectedShopId: null,
  loading: false,
  error: null,

  fetchShopsAndBills: async (ownerId = 'default') => {
    set({ loading: true, error: null });

    // 1. Instant Cache retrieval
    const cachedShops = localStorage.getItem(`khet_kharcha_shops_${ownerId}`);
    const cachedBills = localStorage.getItem(`khet_kharcha_shop_bills_${ownerId}`);

    if (cachedShops) {
      try {
        set({
          shops: JSON.parse(cachedShops),
          bills: cachedBills ? JSON.parse(cachedBills) : [],
          loading: false
        });
      } catch (e) {
        console.warn('Failed parsing cached shops/bills', e);
      }
    } else {
      // Seed default demo shops
      const defaultShops = getDefaultShops(ownerId);
      const defaultBills = getDefaultBills(ownerId);
      set({ shops: defaultShops, bills: defaultBills, loading: false });
      localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(defaultShops));
      localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(defaultBills));
    }

    // 2. Network Firestore fetch if authenticated
    if (ownerId && ownerId !== 'default') {
      try {
        const [cloudShops, cloudBills] = await Promise.all([
          getShopsByOwner(ownerId),
          getShopBillsByOwner(ownerId)
        ]);

        if (cloudShops && cloudShops.length > 0) {
          set({ shops: cloudShops, bills: cloudBills || [], loading: false });
          localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(cloudShops));
          localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(cloudBills || []));
        }
      } catch (err) {
        console.warn('Firestore shop bills fetch error, running offline with cache:', err);
      }
    }
  },

  setSelectedShopId: (shopId) => {
    set({ selectedShopId: shopId });
  },

  // ==========================================
  // SHOP CRUD
  // ==========================================

  createShop: async (shopData) => {
    const tempId = `shop_${Date.now()}`;
    const newShop = {
      ...shopData,
      id: tempId,
      createdAt: new Date().toISOString()
    };

    const currentShops = get().shops;
    const updatedShops = [newShop, ...currentShops];
    const ownerId = shopData.ownerId || 'default';

    set({ shops: updatedShops, selectedShopId: tempId });
    localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(updatedShops));

    try {
      const docId = await addShop(shopData);
      if (docId) {
        const syncedShops = updatedShops.map(s => s.id === tempId ? { ...s, id: docId } : s);
        set({ shops: syncedShops, selectedShopId: docId });
        localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(syncedShops));
        return docId;
      }
    } catch (e) {
      console.warn('Firestore addShop failed, saved locally:', e);
    }
    return tempId;
  },

  editShop: async (shopId, updateData) => {
    const currentShops = get().shops;
    const updatedShops = currentShops.map(s => s.id === shopId ? { ...s, ...updateData } : s);
    const ownerId = currentShops[0]?.ownerId || 'default';

    set({ shops: updatedShops });
    localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(updatedShops));

    try {
      await updateShop(shopId, updateData);
    } catch (e) {
      console.warn('Firestore updateShop failed, saved locally:', e);
    }
  },

  removeShop: async (shopId) => {
    const currentShops = get().shops;
    const currentBills = get().bills;

    const updatedShops = currentShops.filter(s => s.id !== shopId);
    const updatedBills = currentBills.filter(b => b.shopId !== shopId);
    const ownerId = currentShops[0]?.ownerId || 'default';

    set({
      shops: updatedShops,
      bills: updatedBills,
      selectedShopId: get().selectedShopId === shopId ? null : get().selectedShopId
    });

    localStorage.setItem(`khet_kharcha_shops_${ownerId}`, JSON.stringify(updatedShops));
    localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(updatedBills));

    try {
      await deleteShop(shopId);
    } catch (e) {
      console.warn('Firestore deleteShop failed, removed locally:', e);
    }
  },

  // ==========================================
  // SHOP BILLS CRUD
  // ==========================================

  createBill: async (billData) => {
    const tempId = `sbill_${Date.now()}`;
    const newBill = {
      ...billData,
      id: tempId,
      amount: parseFloat(billData.amount) || 0,
      paid: Boolean(billData.paid),
      paidDate: billData.paid ? (billData.paidDate || new Date().toISOString()) : null,
      createdAt: new Date().toISOString()
    };

    const currentBills = get().bills;
    const updatedBills = [newBill, ...currentBills];
    const ownerId = billData.ownerId || 'default';

    set({ bills: updatedBills });
    localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(updatedBills));

    try {
      const docId = await addShopBill(billData);
      if (docId) {
        const syncedBills = updatedBills.map(b => b.id === tempId ? { ...b, id: docId } : b);
        set({ bills: syncedBills });
        localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(syncedBills));
        return docId;
      }
    } catch (e) {
      console.warn('Firestore addShopBill failed, saved locally:', e);
    }
    return tempId;
  },

  editBill: async (billId, updateData) => {
    const currentBills = get().bills;
    const updatedBills = currentBills.map(b => {
      if (b.id === billId) {
        const nextPaid = updateData.paid !== undefined ? Boolean(updateData.paid) : b.paid;
        return {
          ...b,
          ...updateData,
          amount: updateData.amount !== undefined ? parseFloat(updateData.amount) || 0 : b.amount,
          paid: nextPaid,
          paidDate: nextPaid ? (updateData.paidDate || b.paidDate || new Date().toISOString()) : null
        };
      }
      return b;
    });

    const ownerId = currentBills[0]?.ownerId || 'default';
    set({ bills: updatedBills });
    localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(updatedBills));

    try {
      await updateShopBill(billId, updateData);
    } catch (e) {
      console.warn('Firestore updateShopBill failed, saved locally:', e);
    }
  },

  removeBill: async (billId) => {
    const currentBills = get().bills;
    const updatedBills = currentBills.filter(b => b.id !== billId);
    const ownerId = currentBills[0]?.ownerId || 'default';

    set({ bills: updatedBills });
    localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(updatedBills));

    try {
      await deleteShopBill(billId);
    } catch (e) {
      console.warn('Firestore deleteShopBill failed, removed locally:', e);
    }
  },

  toggleBillPaid: async (billId) => {
    const currentBills = get().bills;
    const target = currentBills.find(b => b.id === billId);
    if (!target) return;

    const nextPaid = !target.paid;
    const updatedBills = currentBills.map(b => {
      if (b.id === billId) {
        return {
          ...b,
          paid: nextPaid,
          paidDate: nextPaid ? new Date().toISOString() : null
        };
      }
      return b;
    });

    const ownerId = currentBills[0]?.ownerId || 'default';
    set({ bills: updatedBills });
    localStorage.setItem(`khet_kharcha_shop_bills_${ownerId}`, JSON.stringify(updatedBills));

    try {
      await toggleShopBillPaid(billId, target.paid);
    } catch (e) {
      console.warn('Firestore toggleShopBillPaid failed, updated locally:', e);
    }
  }
}));

