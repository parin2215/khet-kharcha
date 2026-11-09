import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Store, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  IndianRupee, 
  Sparkles, 
  Share2, 
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  FlaskConical,
  Wheat,
  Tag
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useShopBillStore } from '../../store/useShopBillStore.js';
import { formatINR, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import Toast from '../../components/Toast.jsx';

export default function ShopBillsPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    shops, 
    bills, 
    selectedShopId, 
    setSelectedShopId, 
    fetchShopsAndBills,
    createShop, 
    editShop, 
    removeShop, 
    createBill, 
    editBill, 
    removeBill, 
    toggleBillPaid,
    loading 
  } = useShopBillStore();

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('all'); // 'all' | 'pending' | 'paid'
  const [billCategoryFilter, setBillCategoryFilter] = useState('all');

  // Modal states
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [shopToDelete, setShopToDelete] = useState(null);

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  // Form states - Shop
  const [shopName, setShopName] = useState('');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopCategory, setShopCategory] = useState('Fertilizers & Pesticides');
  const [shopNotes, setShopNotes] = useState('');

  // Form states - Bill
  const [billShopId, setBillShopId] = useState('');
  const [billItemsSummary, setBillItemsSummary] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(toLocalDateString());
  const [billCategory, setBillCategory] = useState('fertilizer');
  const [billAmount, setBillAmount] = useState('');
  const [billIsPaid, setBillIsPaid] = useState(false);
  const [billPaymentMethod, setBillPaymentMethod] = useState('Cash');
  const [billNotes, setBillNotes] = useState('');

  // Fetch data on mount
  useEffect(() => {
    const uid = profile?.uid || 'default';
    fetchShopsAndBills(uid);
  }, [profile, fetchShopsAndBills]);

  // Set default selected shop
  useEffect(() => {
    if (shops.length > 0 && selectedShopId === null) {
      // Keep 'all' or select first shop
    }
  }, [shops, selectedShopId]);

  // Active shop object if a specific shop is chosen
  const activeShop = useMemo(() => {
    if (!selectedShopId || selectedShopId === 'all') return null;
    return shops.find(s => s.id === selectedShopId) || null;
  }, [shops, selectedShopId]);

  // ==========================================
  // METRICS & OUTSIDE HUD CALCULATIONS
  // ==========================================
  const overallMetrics = useMemo(() => {
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let pendingCount = 0;
    let paidCount = 0;

    bills.forEach(b => {
      const amt = parseFloat(b.amount) || 0;
      totalPurchases += amt;
      if (b.paid) {
        totalPaid += amt;
        paidCount += 1;
      } else {
        totalPending += amt;
        pendingCount += 1;
      }
    });

    return {
      totalPurchases,
      totalPaid,
      totalPending,
      pendingCount,
      paidCount,
      totalCount: bills.length
    };
  }, [bills]);

  // Shop-specific metrics map
  const shopMetricsMap = useMemo(() => {
    const map = {};
    shops.forEach(s => {
      map[s.id] = { totalPurchases: 0, totalPaid: 0, totalPending: 0, pendingCount: 0, paidCount: 0, count: 0 };
    });

    bills.forEach(b => {
      if (map[b.shopId]) {
        const amt = parseFloat(b.amount) || 0;
        map[b.shopId].totalPurchases += amt;
        map[b.shopId].count += 1;
        if (b.paid) {
          map[b.shopId].totalPaid += amt;
          map[b.shopId].paidCount += 1;
        } else {
          map[b.shopId].totalPending += amt;
          map[b.shopId].pendingCount += 1;
        }
      }
    });

    return map;
  }, [shops, bills]);

  // Filtered bills for display
  const displayedBills = useMemo(() => {
    return bills.filter(b => {
      // 1. Filter by shop
      if (selectedShopId && selectedShopId !== 'all' && b.shopId !== selectedShopId) {
        return false;
      }
      // 2. Filter by status
      if (billStatusFilter === 'pending' && b.paid) return false;
      if (billStatusFilter === 'paid' && !b.paid) return false;
      // 3. Filter by category
      if (billCategoryFilter !== 'all' && b.category !== billCategoryFilter) return false;
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const itemMatch = (b.itemsSummary || '').toLowerCase().includes(q);
        const invMatch = (b.billNumber || '').toLowerCase().includes(q);
        const shop = shops.find(s => s.id === b.shopId);
        const shopMatch = shop ? shop.name.toLowerCase().includes(q) : false;
        if (!itemMatch && !invMatch && !shopMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.billDate || 0) - new Date(a.billDate || 0));
  }, [bills, selectedShopId, billStatusFilter, billCategoryFilter, searchQuery, shops]);

  // ==========================================
  // SHOP MODAL HANDLERS
  // ==========================================
  const handleOpenAddShop = () => {
    setEditingShop(null);
    setShopName('');
    setShopOwnerName('');
    setShopPhone('');
    setShopLocation('');
    setShopCategory('Fertilizers & Pesticides');
    setShopNotes('');
    setIsAddShopModalOpen(true);
  };

  const handleOpenEditShop = (shop) => {
    setEditingShop(shop);
    setShopName(shop.name || '');
    setShopOwnerName(shop.ownerName || '');
    setShopPhone(shop.phone || '');
    setShopLocation(shop.location || '');
    setShopCategory(shop.category || 'Fertilizers & Pesticides');
    setShopNotes(shop.notes || '');
    setIsAddShopModalOpen(true);
  };

  const handleSaveShop = async (e) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    const shopData = {
      ownerId: profile?.uid || 'default',
      name: shopName.trim(),
      ownerName: shopOwnerName.trim(),
      phone: shopPhone.trim(),
      location: shopLocation.trim(),
      category: shopCategory,
      notes: shopNotes.trim()
    };

    try {
      if (editingShop) {
        await editShop(editingShop.id, shopData);
        setToastMsg('Shop updated successfully!');
      } else {
        await createShop(shopData);
        setToastMsg('New shop added successfully!');
      }
      setToastType('success');
      setIsAddShopModalOpen(false);
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to save shop. Please try again.');
      setToastType('error');
    }
  };

  const handleDeleteShopConfirm = async () => {
    if (!shopToDelete) return;
    try {
      await removeShop(shopToDelete.id);
      setToastMsg('Shop and its associated bills removed.');
      setToastType('success');
      setShopToDelete(null);
      if (selectedShopId === shopToDelete.id) {
        setSelectedShopId('all');
      }
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to delete shop.');
      setToastType('error');
    }
  };

  // ==========================================
  // BILL MODAL HANDLERS
  // ==========================================
  const handleOpenAddBill = (targetShopId = null) => {
    setEditingBill(null);
    setBillShopId(targetShopId || selectedShopId || (shops[0]?.id || ''));
    setBillItemsSummary('');
    setBillNumber('');
    setBillDate(toLocalDateString());
    setBillCategory('fertilizer');
    setBillAmount('');
    setBillIsPaid(false);
    setBillPaymentMethod('Cash');
    setBillNotes('');
    setIsAddBillModalOpen(true);
  };

  const handleOpenEditBill = (bill) => {
    setEditingBill(bill);
    setBillShopId(bill.shopId || '');
    setBillItemsSummary(bill.itemsSummary || '');
    setBillNumber(bill.billNumber || '');
    setBillDate(bill.billDate || toLocalDateString());
    setBillCategory(bill.category || 'fertilizer');
    setBillAmount((bill.amount || '').toString());
    setBillIsPaid(Boolean(bill.paid));
    setBillPaymentMethod(bill.paymentMethod || 'Cash');
    setBillNotes(bill.notes || '');
    setIsAddBillModalOpen(true);
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!billShopId || !billItemsSummary.trim() || !billAmount || parseFloat(billAmount) <= 0) {
      setToastMsg('Please enter product details, shop, and a valid amount.');
      setToastType('error');
      return;
    }

    const billData = {
      ownerId: profile?.uid || 'default',
      shopId: billShopId,
      itemsSummary: billItemsSummary.trim(),
      billNumber: billNumber.trim(),
      billDate,
      category: billCategory,
      amount: parseFloat(billAmount),
      paid: billIsPaid,
      paymentMethod: billIsPaid ? billPaymentMethod : null,
      notes: billNotes.trim()
    };

    try {
      if (editingBill) {
        await editBill(editingBill.id, billData);
        setToastMsg('Shop bill updated successfully!');
      } else {
        await createBill(billData);
        setToastMsg('New shop bill recorded successfully!');
      }
      setToastType('success');
      setIsAddBillModalOpen(false);
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to save bill. Please try again.');
      setToastType('error');
    }
  };

  const handleDeleteBillConfirm = async () => {
    if (!billToDelete) return;
    try {
      await removeBill(billToDelete.id);
      setToastMsg('Shop bill deleted successfully!');
      setToastType('success');
      setBillToDelete(null);
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to delete bill.');
      setToastType('error');
    }
  };

  const handleTogglePaid = async (billId, e) => {
    if (e) e.stopPropagation();
    try {
      await toggleBillPaid(billId);
      const b = bills.find(item => item.id === billId);
      const nextStatus = !b?.paid;
      setToastMsg(nextStatus ? 'Bill marked as Paid! ✅' : 'Bill marked as Pending. ⏳');
      setToastType('success');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                {t('shopBills.title', 'Shop Bills Ledger (દુકાન બિલ)')}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {t('shopBills.subtitle', 'Track fertilizer, seed & medicine purchases from agro dealers with paid vs pending status.')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddShop}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span>{t('shopBills.addShop', '+ Add Shop (નવી દુકાન)')}</span>
          </button>

          <button
            onClick={() => handleOpenAddBill()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{t('shopBills.addBill', '+ Add Bill (બિલ ઉમેરો)')}</span>
          </button>
        </div>
      </div>

      {/* Isolation Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-medium">
          <strong>Personal Vendor Tracking:</strong> Bills logged here are strictly for tracking your shopkeeper debts and purchases. They do not affect your farm crop analytics, net return graphs, or partner settlements.
        </span>
      </div>

      {/* ======================================================== */}
      {/* TOP METRICS HUD ("OUTSIDE" REMAINING & PAID TOTALS)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Remaining Pending Bill Amount */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border border-amber-300/60 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block">
              {t('shopBills.totalPending', 'Remaining Pending (બાકી રકમ)')}
            </span>
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-900">
            {formatINR(overallMetrics.totalPending)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{overallMetrics.pendingCount} Bills Unpaid</span>
          </div>
        </div>

        {/* 2. Total Paid Bill Amount */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-300/60 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
              {t('shopBills.totalPaid', 'Total Paid (ચૂકવેલ રકમ)')}
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-emerald-900">
            {formatINR(overallMetrics.totalPaid)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
            <span>✅ {overallMetrics.paidCount} Bills Cleared</span>
          </div>
        </div>

        {/* 3. Total Khata / Cumulative Purchases */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 block">
              {t('shopBills.totalPurchases', 'Total Purchases (કુલ ખરીદી)')}
            </span>
            <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-stone-900">
            {formatINR(overallMetrics.totalPurchases)}
          </p>
          <p className="text-xs text-stone-400 font-semibold mt-2">
            {overallMetrics.totalCount} bills recorded across all shops
          </p>
        </div>

        {/* 4. Registered Shops */}
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 block">
              {t('shopBills.totalShops', 'Registered Shops (દુકાનો)')}
            </span>
            <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-stone-900">
            {shops.length}
          </p>
          <p className="text-xs text-stone-400 font-semibold mt-2">
            Agro dealers & supply vendors
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MAIN MASTER-DETAIL WORKSPACE                             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SHOPS LIST (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>My Shops & Vendors ({shops.length})</span>
              </h3>
              <button
                onClick={handleOpenAddShop}
                className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                + Add Shop
              </button>
            </div>

            {/* Quick Filter: All Shops vs Individual */}
            <button
              onClick={() => setSelectedShopId('all')}
              className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                !selectedShopId || selectedShopId === 'all'
                  ? 'bg-emerald-50/80 border-emerald-400 shadow-sm text-emerald-950 font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200/60 text-stone-700 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-extrabold block">All Shops Combined</span>
                  <span className="text-[10px] text-stone-400 block">{bills.length} total bills</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-700 block">
                  {formatINR(overallMetrics.totalPending)}
                </span>
                <span className="text-[9px] uppercase font-bold text-amber-600">Pending</span>
              </div>
            </button>

            {/* Individual Shops Cards */}
            <div className="space-y-2.5 pt-1">
              {shops.map(s => {
                const isSelected = selectedShopId === s.id;
                const m = shopMetricsMap[s.id] || { totalPending: 0, totalPaid: 0, count: 0, pendingCount: 0 };

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShopId(s.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative group ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-stone-50 border-stone-200/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-stone-900 truncate group-hover:text-emerald-700 transition">
                          {s.name}
                        </h4>
                        {s.ownerName && (
                          <p className="text-[11px] text-stone-500 font-semibold truncate mt-0.5">
                            👤 {s.ownerName}
                          </p>
                        )}
                        {s.location && (
                          <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            {s.location}
                          </p>
                        )}
                      </div>

                      {/* Phone action */}
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 transition"
                          title="Call Dealer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Pending & Paid Badges */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        {m.totalPending > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px]">
                            ⏳ {formatINR(m.totalPending)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px]">
                            ✅ Cleared
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        {m.count} bills
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {shops.length === 0 && (
              <div className="text-center py-6 text-stone-400">
                <Store className="w-8 h-8 mx-auto mb-1 text-stone-300" />
                <p className="text-xs font-bold">No shops added yet</p>
                <button
                  onClick={handleOpenAddShop}
                  className="mt-2 text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer"
                >
                  + Add Your First Shop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BILLS LEDGER WORKSPACE (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Bar for Active Scope */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">
                  {activeShop ? 'Shop Khata Ledger' : 'All Stores Khata Ledger'}
                </span>
                <h2 className="text-xl font-extrabold text-stone-900 mt-0.5 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  <span>{activeShop ? activeShop.name : 'All Shops Combined'}</span>
                </h2>
                {activeShop && (
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    {activeShop.ownerName ? `Contact: ${activeShop.ownerName}` : ''} 
                    {activeShop.phone ? ` • ${activeShop.phone}` : ''}
                    {activeShop.location ? ` • ${activeShop.location}` : ''}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {activeShop && (
                  <>
                    <button
                      onClick={() => handleOpenEditShop(activeShop)}
                      className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                      title="Edit Shop Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShopToDelete(activeShop)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete Shop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleOpenAddBill(activeShop?.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Log New Bill</span>
                </button>
              </div>
            </div>

            {/* Shop Summary Strip */}
            {activeShop && (() => {
              const m = shopMetricsMap[activeShop.id] || { totalPurchases: 0, totalPaid: 0, totalPending: 0, pendingCount: 0 };
              return (
                <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending to Pay</span>
                    <span className="text-lg font-black text-amber-900">{formatINR(m.totalPending)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/50">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Paid & Cleared</span>
                    <span className="text-lg font-black text-emerald-900">{formatINR(m.totalPaid)}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Purchases</span>
                    <span className="text-lg font-black text-stone-800">{formatINR(m.totalPurchases)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Filter Ribbons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setBillStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    billStatusFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  All ({bills.length})
                </button>
                <button
                  onClick={() => setBillStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    billStatusFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ⏳ Pending ({overallMetrics.pendingCount})
                </button>
                <button
                  onClick={() => setBillStatusFilter('paid')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    billStatusFilter === 'paid'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ✅ Paid ({overallMetrics.paidCount})
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product, bill #..."
                    className="w-full pl-8 pr-3 py-2 text-xs font-semibold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50/50"
                  />
                </div>

                <select
                  value={billCategoryFilter}
                  onChange={(e) => setBillCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold border border-stone-200 rounded-xl bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="fertilizer">Fertilizers (ખાતર)</option>
                  <option value="pesticide">Pesticides (દવા)</option>
                  <option value="seeds">Seeds (બિયારણ)</option>
                  <option value="machinery">Tools & Spares</option>
                  <option value="other">Other Supplies</option>
                </select>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* BILLS LIST / LEDGER CARDS                                */}
          {/* ======================================================== */}
          <div className="space-y-3">
            {displayedBills.map((b) => {
              const shop = shops.find(s => s.id === b.shopId);

              return (
                <div
                  key={b.id}
                  className={`p-4 md:p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm hover:shadow-md ${
                    b.paid ? 'border-stone-200/80' : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    
                    {/* Paid Checkbox Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePaid(b.id, e)}
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        b.paid
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700'
                          : 'bg-white border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-transparent'
                      }`}
                      title={b.paid ? 'Click to mark as Pending' : 'Click to mark as Paid'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Shop Pill if in 'All Shops' mode */}
                        {(!selectedShopId || selectedShopId === 'all') && shop && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            🏬 {shop.name}
                          </span>
                        )}

                        <span className="text-xs font-semibold text-stone-400">
                          {formatDate(b.billDate)}
                        </span>

                        {b.billNumber && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-600">
                            #{b.billNumber}
                          </span>
                        )}

                        {/* Category badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 capitalize">
                          {b.category}
                        </span>
                      </div>

                      {/* Item Details */}
                      <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                        {b.itemsSummary}
                      </h4>

                      {/* Notes / Paid Date */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                        {b.paid ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid {b.paidDate ? `on ${formatDate(b.paidDate)}` : ''} {b.paymentMethod ? `via ${b.paymentMethod}` : ''}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Payment Pending
                          </span>
                        )}

                        {b.notes && (
                          <span className="text-stone-400 italic">
                            "{b.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <div className="text-right">
                      <span className={`text-lg font-black block ${b.paid ? 'text-stone-900' : 'text-amber-900'}`}>
                        {formatINR(b.amount)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${b.paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {b.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditBill(b)}
                        className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                        title="Edit Bill Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setBillToDelete(b)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {displayedBills.length === 0 && (
              <div className="bg-white border border-stone-200/70 rounded-3xl p-12 text-center text-stone-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-stone-300" />
                <h4 className="text-sm font-extrabold text-stone-800">No Bills Found</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  {searchQuery || billStatusFilter !== 'all'
                    ? 'No bills match your active search or status filters.'
                    : 'Start logging purchases of fertilizer, seed bags, and spray medicines from this shop.'}
                </p>
                <button
                  onClick={() => handleOpenAddBill(activeShop?.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow cursor-pointer mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log First Bill</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT SHOP                                  */}
      {/* ======================================================== */}
      {isAddShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>{editingShop ? 'Edit Shop Details' : 'Add New Agro Shop / Dealer'}</span>
              </h3>
              <button
                onClick={() => setIsAddShopModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Shop / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Sardar Krushi Kendra, Kisan Agro"
                  className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Person / Owner
                  </label>
                  <input
                    type="text"
                    value={shopOwnerName}
                    onChange={(e) => setShopOwnerName(e.target.value)}
                    placeholder="e.g. Rameshbhai Patel"
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    placeholder="e.g. +91 98250 12345"
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Market Location / Address
                  </label>
                  <input
                    type="text"
                    value={shopLocation}
                    onChange={(e) => setShopLocation(e.target.value)}
                    placeholder="e.g. APMC Mandi, Anand"
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Fertilizers & Pesticides">Fertilizers & Pesticides (ખાતર-દવા)</option>
                    <option value="Seeds & Agro Equipment">Seeds & Agro Equipment (બિયારણ)</option>
                    <option value="Machinery & Hardware">Machinery, Spares & Hardware</option>
                    <option value="General Agro Supply">General Agro Supply</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes (Credit terms, khata rules, etc.)
                </label>
                <textarea
                  rows={2}
                  value={shopNotes}
                  onChange={(e) => setShopNotes(e.target.value)}
                  placeholder="e.g. Gives 30-day credit for IFFCO DAP and sprays."
                  className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddShopModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  {editingShop ? 'Save Changes' : 'Add Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT BILL                                  */}
      {/* ======================================================== */}
      {isAddBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>{editingBill ? 'Edit Shop Bill' : 'Log Shop Bill / Purchase'}</span>
              </h3>
              <button
                onClick={() => setIsAddBillModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-4">
              
              {/* Shop Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Agro Shop / Dealer *
                </label>
                <select
                  required
                  value={billShopId}
                  onChange={(e) => setBillShopId(e.target.value)}
                  className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                >
                  <option value="" disabled>Select a shop</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.location || 'Agro'})</option>
                  ))}
                </select>
              </div>

              {/* Items Summary */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Purchased Products / Items *
                </label>
                <input
                  type="text"
                  required
                  value={billItemsSummary}
                  onChange={(e) => setBillItemsSummary(e.target.value)}
                  placeholder="e.g. 2 Bags DAP (50kg) + 1 Bottle Coragen"
                  className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Bill / Invoice / Slip #
                  </label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder="e.g. INV-4021 or Slip #14"
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Product Category
                  </label>
                  <select
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="fertilizer">Fertilizers (ખાતર)</option>
                    <option value="pesticide">Pesticides / Insecticide (દવા)</option>
                    <option value="seeds">Seeds (બિયારણ)</option>
                    <option value="machinery">Machinery & Spares</option>
                    <option value="irrigation">Drip / Irrigation</option>
                    <option value="other">Other Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Bill Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="e.g. 3850"
                    className="w-full text-xs font-bold text-stone-900 border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Paid Status Checkbox Section */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billIsPaid}
                    onChange={(e) => setBillIsPaid(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-stone-900 block">
                      Mark as Paid (ચૂકવણી થઈ ગઈ છે)
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Check if you have already paid this bill, otherwise leave unchecked as pending.
                    </span>
                  </div>
                </label>

                {billIsPaid && (
                  <div className="pt-2 border-t border-stone-200/60 flex items-center gap-3">
                    <label className="text-xs font-bold text-stone-600 shrink-0">Payment Mode:</label>
                    <select
                      value={billPaymentMethod}
                      onChange={(e) => setBillPaymentMethod(e.target.value)}
                      className="text-xs font-semibold border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer"
                    >
                      <option value="Cash">Cash (રોકડ)</option>
                      <option value="GPay / PhonePe / UPI">GPay / PhonePe / UPI</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="e.g. Given on wheat season advance"
                  className="w-full text-xs font-semibold border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBillModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  {editingBill ? 'Save Bill Changes' : 'Record Bill'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE BILL CONFIRMATION                        */}
      {/* ======================================================== */}
      {billToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setBillToDelete(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-stone-900">
                Delete This Shop Bill?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to permanently remove this purchase bill entry from your ledger?
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400 font-semibold">Items:</span>
                <strong className="text-stone-900">{billToDelete.itemsSummary}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-semibold">Amount:</span>
                <strong className="text-stone-900">{formatINR(billToDelete.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-semibold">Date:</span>
                <strong className="text-stone-800">{formatDate(billToDelete.billDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-semibold">Status:</span>
                <strong className={billToDelete.paid ? 'text-emerald-700' : 'text-amber-700'}>
                  {billToDelete.paid ? '✅ Paid' : '⏳ Pending'}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBillConfirm}
                className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Delete Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE SHOP CONFIRMATION                        */}
      {/* ======================================================== */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShopToDelete(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-stone-900">
                Delete Shop "{shopToDelete.name}"?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                This will permanently delete this shop and all bills associated with it. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShopToDelete(null)}
                className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShopConfirm}
                className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Delete Shop
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

