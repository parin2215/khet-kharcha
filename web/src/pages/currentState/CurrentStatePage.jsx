import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useCurrentCropStore, calculateFarmoHisab } from '../../store/useCurrentCropStore.js';
import { 
  Sprout, 
  Plus, 
  Calendar, 
  Users, 
  Receipt, 
  TrendingUp, 
  FileText, 
  Wheat, 
  Trash2, 
  MapPin, 
  Scale, 
  X, 
  Check, 
  Coins, 
  Filter, 
  Search, 
  ChevronRight,
  Clock,
  ArrowRight,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Banknote
} from 'lucide-react';
import { formatINR, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import { EXPENSE_CATEGORIES, getCategoryById } from '../../../../shared/constants/categories.js';
import SeasonBadge from '../../components/SeasonBadge.jsx';
import Toast from '../../components/Toast.jsx';
import HisabFarmoModal from '../../components/HisabFarmoModal.jsx';

export default function CurrentStatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { 
    crops, 
    fetchCrops, 
    createCrop, 
    addCropExpense, 
    deleteCropExpense, 
    addCropUpad,
    deleteCropUpad,
    addCropSale, 
    deleteCropSale, 
    harvestAndSettleCrop 
  } = useCurrentCropStore();

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Filters & Search
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('all');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isUpadModalOpen, setIsUpadModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isFarmoModalOpen, setIsFarmoModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

  const [activeCrop, setActiveCrop] = useState(null);

  // Form states - Add Ongoing Crop
  const [newCropFarmId, setNewCropFarmId] = useState('');
  const [newCropName, setNewCropName] = useState('');
  const [newCropVariety, setNewCropVariety] = useState('');
  const [newCropSeason, setNewCropSeason] = useState('kharif');
  const [newCropSowingDate, setNewCropSowingDate] = useState(toLocalDateString());
  const [newCropTargetYield, setNewCropTargetYield] = useState('');
  const [newCropYieldUnit, setNewCropYieldUnit] = useState('mann');
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerSharePercent, setPartnerSharePercent] = useState('50');

  // Form states - Log Expense (ખર્ચ)
  const [expCategory, setExpCategory] = useState('seeds');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(toLocalDateString());
  const [expPaidBy, setExpPaidBy] = useState('owner');
  const [expNotes, setExpNotes] = useState('');

  // Form states - Log Upad (ઉપાડ)
  const [upadAmount, setUpadAmount] = useState('');
  const [upadDate, setUpadDate] = useState(toLocalDateString());
  const [upadRecipient, setUpadRecipient] = useState('');
  const [upadNotes, setUpadNotes] = useState('');

  // Form states - Log Weighment & Sale (પાક વેચાણ / વજન વિગત)
  const [saleGrossWeight, setSaleGrossWeight] = useState('');
  const [saleOtherWeight, setSaleOtherWeight] = useState('0');
  const [saleWeightDeduction, setSaleWeightDeduction] = useState('0');
  const [saleRatePerMann, setSaleRatePerMann] = useState('');
  const [saleBuyer, setSaleBuyer] = useState('');
  const [saleDate, setSaleDate] = useState(toLocalDateString());
  const [saleNotes, setSaleNotes] = useState('');

  // Auto-calculated weighment values in Sale modal:
  const calculatedNetWeightKg = Math.max(0, 
    (parseFloat(saleGrossWeight) || 0) + 
    (parseFloat(saleOtherWeight) || 0) - 
    (parseFloat(saleWeightDeduction) || 0)
  );
  const calculatedWeightInMann = Number((calculatedNetWeightKg / 20).toFixed(2));
  const calculatedMadatar = Math.round(calculatedWeightInMann * (parseFloat(saleRatePerMann) || 0));

  // Form states - Harvest & Settle Farmo
  const [harvestDate, setHarvestDate] = useState(toLocalDateString());
  const [partnerBalanceCleared, setPartnerBalanceCleared] = useState(true);
  const [harvestNotes, setHarvestNotes] = useState('');

  // Initial load
  useEffect(() => {
    const uid = profile?.uid || 'default';
    fetchFarms(uid);
    fetchCrops(uid);
  }, [profile, fetchFarms, fetchCrops]);

  // Query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preFarmId = params.get('farmId');
    if (preFarmId) {
      setSelectedFarmFilter(preFarmId);
      setNewCropFarmId(preFarmId);
      if (params.get('action') === 'new_crop') {
        setIsAddCropModalOpen(true);
      }
    }
  }, [location.search]);

  // Filter ongoing crops
  const filteredCrops = crops.filter(c => {
    if (c.status !== 'ongoing') return false;
    if (selectedFarmFilter !== 'all' && c.farmId !== selectedFarmFilter) return false;
    if (selectedSeasonFilter !== 'all' && c.season !== selectedSeasonFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.cropName?.toLowerCase().includes(q);
      const matchFarm = c.farmName?.toLowerCase().includes(q);
      const matchPartner = c.partner?.name?.toLowerCase().includes(q);
      if (!matchName && !matchFarm && !matchPartner) return false;
    }
    return true;
  });

  // Global Farmo KPIs
  const globalFarmoStats = crops
    .filter(c => c.status === 'ongoing')
    .reduce((acc, c) => {
      const h = calculateFarmoHisab(c);
      return {
        totalKharch: acc.totalKharch + (h.totalKharch || 0),
        totalUpad: acc.totalUpad + (h.totalUpad || 0),
        totalMadatar: acc.totalMadatar + (h.totalMadatar || 0),
        totalNetProfit: acc.totalNetProfit + (h.kharchKapatMadatar || 0),
        totalWeightInMann: acc.totalWeightInMann + (h.totalWeightInMann || 0),
        activePartnersCount: acc.activePartnersCount + (c.partner?.hasPartner ? 1 : 0)
      };
    }, {
      totalKharch: 0,
      totalUpad: 0,
      totalMadatar: 0,
      totalNetProfit: 0,
      totalWeightInMann: 0,
      activePartnersCount: 0
    });

  // Handlers
  const handleOpenAddCrop = () => {
    if (farms.length > 0 && !newCropFarmId) {
      setNewCropFarmId(farms[0].id);
    }
    setNewCropName('');
    setNewCropVariety('');
    setNewCropSeason('kharif');
    setNewCropSowingDate(toLocalDateString());
    setNewCropTargetYield('');
    setNewCropYieldUnit('mann');
    setHasPartner(false);
    setPartnerName('');
    setPartnerPhone('');
    setPartnerSharePercent('50');
    setIsAddCropModalOpen(true);
  };

  const handleCreateCropSubmit = (e) => {
    e.preventDefault();
    if (!newCropName.trim()) {
      setToastMsg('Please enter crop name');
      setToastType('error');
      return;
    }

    const targetFarm = farms.find(f => f.id === newCropFarmId) || farms[0];
    if (!targetFarm) {
      setToastMsg('Please create a farm first');
      setToastType('error');
      return;
    }

    createCrop({
      farmId: targetFarm.id,
      farmName: targetFarm.name,
      cropName: newCropName.trim(),
      variety: newCropVariety.trim(),
      season: newCropSeason,
      sowingDate: newCropSowingDate,
      targetYield: parseFloat(newCropTargetYield) || 0,
      yieldUnit: newCropYieldUnit,
      partner: {
        hasPartner,
        name: hasPartner ? partnerName.trim() : '',
        phone: hasPartner ? partnerPhone.trim() : '',
        sharePercent: hasPartner ? parseFloat(partnerSharePercent) || 50 : 0,
        terms: hasPartner ? `Batai ${partnerSharePercent}-${100 - parseFloat(partnerSharePercent)}%` : 'Self-Managed'
      }
    }, profile?.uid || 'default');

    setToastMsg(`Started ongoing crop: ${newCropName} in ${targetFarm.name} using Farmo format!`);
    setToastType('success');
    setIsAddCropModalOpen(false);
  };

  // Open Log Expense
  const handleOpenExpenseModal = (crop) => {
    setActiveCrop(crop);
    setExpCategory('seeds');
    setExpAmount('');
    setExpDate(toLocalDateString());
    setExpPaidBy('owner');
    setExpNotes('');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!activeCrop || !expAmount || parseFloat(expAmount) <= 0) return;

    addCropExpense(activeCrop.id, {
      category: expCategory,
      amount: parseFloat(expAmount),
      date: expDate,
      paidBy: expPaidBy,
      notes: expNotes
    }, profile?.uid || 'default');

    setToastMsg(`ખર્ચ નોંધાયો: ${formatINR(parseFloat(expAmount))} for ${activeCrop.cropName}`);
    setToastType('success');
    setIsExpenseModalOpen(false);
  };

  // Open Log Upad
  const handleOpenUpadModal = (crop) => {
    setActiveCrop(crop);
    setUpadAmount('');
    setUpadDate(toLocalDateString());
    setUpadRecipient(crop.partner?.name || 'Partner');
    setUpadNotes('');
    setIsUpadModalOpen(true);
  };

  const handleSaveUpad = (e) => {
    e.preventDefault();
    if (!activeCrop || !upadAmount || parseFloat(upadAmount) <= 0) return;

    addCropUpad(activeCrop.id, {
      amount: parseFloat(upadAmount),
      date: upadDate,
      recipient: upadRecipient || activeCrop.partner?.name || 'Partner',
      notes: upadNotes
    }, profile?.uid || 'default');

    setToastMsg(`ઉપાડ નોંધાયો: ${formatINR(parseFloat(upadAmount))} for ${activeCrop.cropName}`);
    setToastType('success');
    setIsUpadModalOpen(false);
  };

  // Open Log Sale & Weighment
  const handleOpenSaleModal = (crop) => {
    setActiveCrop(crop);
    setSaleGrossWeight('');
    setSaleOtherWeight('0');
    setSaleWeightDeduction('0');
    setSaleRatePerMann('');
    setSaleBuyer('');
    setSaleDate(toLocalDateString());
    setSaleNotes('');
    setIsSaleModalOpen(true);
  };

  const handleSaveSale = (e) => {
    e.preventDefault();
    if (!activeCrop || !saleGrossWeight || parseFloat(saleGrossWeight) <= 0) {
      setToastMsg('Please enter valid gross weight');
      setToastType('error');
      return;
    }
    if (!saleRatePerMann || parseFloat(saleRatePerMann) <= 0) {
      setToastMsg('Please enter valid rate per mann');
      setToastType('error');
      return;
    }

    addCropSale(activeCrop.id, {
      grossWeightKg: parseFloat(saleGrossWeight) || 0,
      otherWeightKg: parseFloat(saleOtherWeight) || 0,
      weightDeductionKg: parseFloat(saleWeightDeduction) || 0,
      ratePerMann: parseFloat(saleRatePerMann) || 0,
      buyer: saleBuyer,
      date: saleDate,
      notes: saleNotes
    }, profile?.uid || 'default');

    setToastMsg(`વેચાણ & મદતર નોંધાયું: ${calculatedWeightInMann} મણ (${formatINR(calculatedMadatar)}) for ${activeCrop.cropName}`);
    setToastType('success');
    setIsSaleModalOpen(false);
  };

  // Open Farmo Modal
  const handleOpenFarmo = (crop) => {
    setActiveCrop(crop);
    setIsFarmoModalOpen(true);
  };

  // Open Harvest Modal
  const handleOpenHarvest = (crop) => {
    setActiveCrop(crop);
    setHarvestDate(toLocalDateString());
    setPartnerBalanceCleared(true);
    setHarvestNotes('');
    setIsHarvestModalOpen(true);
  };

  const handleConfirmHarvest = (e) => {
    e.preventDefault();
    if (!activeCrop) return;

    try {
      const historyRecord = harvestAndSettleCrop(activeCrop.id, {
        harvestDate,
        notes: harvestNotes
      }, profile?.uid || 'default');

      setToastMsg(`🎉 ${activeCrop.cropName} લણણી અને હિસાબ ફરમો સફળતાપૂર્વક સેટલ થયો અને ${activeCrop.farmName} હિસ્ટ્રીમાં સેવ થયો!`);
      setToastType('success');
      setIsHarvestModalOpen(false);
    } catch (err) {
      setToastMsg('Failed to finalize harvest: ' + err.message);
      setToastType('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              સક્રિય પાક & હિસાબ ફરમો (Live Crop Control)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Current State
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Active ongoing crops in your farms. Universally uses the Gujarati <strong>"હિસાબ કરવાનો ફરમો"</strong> ledger standard to log farm expenses, partner drawings (ઉપાડ), harvest weighment (મણ), and real-time profit settlement.
          </p>
        </div>

        <button
          onClick={handleOpenAddCrop}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition duration-200 cursor-pointer self-start md:self-center shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          + નવો પાક શરૂ કરો (Start Crop)
        </button>
      </div>

      {/* KPI Stats Ribbon - Universal Farmo Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">કુલ ખર્ચ રકમ</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900 mt-2">{formatINR(globalFarmoStats.totalKharch)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">કુલ ખેતી ખર્ચ (Expenses)</p>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">કુલ ઉપાડ રકમ</span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-900 mt-2">{formatINR(globalFarmoStats.totalUpad)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">ભાગીદાર ઉપાડ (Partner Drawings)</p>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">કુલ મદતર</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{formatINR(globalFarmoStats.totalMadatar)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {globalFarmoStats.totalWeightInMann} મણ વેચાણ (Gross Sales)
          </p>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">ખર્ચ કપાત મદતર</span>
            <Coins className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-sky-800 mt-2">{formatINR(globalFarmoStats.totalNetProfit)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">ચોખ્ખો નફો (Madatar - Kharch)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, variety, or partner..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-bold text-stone-500">ખેતર:</span>
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Farms ({farms.length})</option>
              {farms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-xs font-bold text-stone-500">સીઝન:</span>
            <select
              value={selectedSeasonFilter}
              onChange={(e) => setSelectedSeasonFilter(e.target.value)}
              className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Seasons</option>
              <option value="kharif">Kharif (Monsoon)</option>
              <option value="rabi">Rabi (Winter)</option>
              <option value="zaid">Zaid (Summer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ongoing Crops Cards Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCrops.map((crop) => {
            // Live Farmo Calculation
            const hisab = calculateFarmoHisab(crop);
            const hasPartner = !!(crop.partner?.hasPartner);
            const partnerName = crop.partner?.name || 'Partner';
            const partnerShare = crop.partner?.sharePercent || 50;

            // Sowing age calculation
            const sowingDateObj = new Date(crop.sowingDate);
            const daysSinceSowing = Math.max(0, Math.floor((Date.now() - sowingDateObj.getTime()) / (1000 * 60 * 60 * 24)));

            return (
              <div 
                key={crop.id}
                className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span 
                          onClick={() => navigate(`/farms/${crop.farmId}`)}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg cursor-pointer transition"
                        >
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {crop.farmName}
                        </span>
                        <SeasonBadge seasonId={crop.season} />
                      </div>
                      <h3 className="text-xl font-extrabold text-stone-900 tracking-tight font-serif">
                        {crop.cropName}
                        {crop.variety && (
                          <span className="text-xs font-semibold text-stone-400 ml-2 font-mono">
                            ({crop.variety})
                          </span>
                        )}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Day {daysSinceSowing}
                    </span>
                  </div>

                  {/* Partner / Management Banner */}
                  <div className="mt-4 p-3 bg-stone-50 border border-stone-200/60 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-stone-200 flex items-center justify-center text-stone-600">
                        {hasPartner ? <Users className="w-4 h-4 text-indigo-600" /> : <Sprout className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        {hasPartner ? (
                          <>
                            <p className="text-xs font-extrabold text-stone-900">
                              🤝 ભાગીદાર: {partnerName}
                              <span className="text-[11px] text-indigo-700 ml-1.5 font-bold">({partnerShare}% હિસ્સો)</span>
                            </p>
                            <p className="text-[10px] text-stone-400 font-medium">{crop.partner.phone || 'No phone'} • {crop.partner.terms}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-extrabold text-stone-900">🚜 સેલ્ફ-મેનેજ્ડ ખેતર (Owner Operated)</p>
                            <p className="text-[10px] text-stone-400 font-medium">100% નફો / ખર્ચ માલિકના ભાગે</p>
                          </>
                        )}
                      </div>
                    </div>

                    {crop.targetYield > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase">ટાર્ગેટ</span>
                        <span className="text-xs font-extrabold text-stone-700">{crop.targetYield} {crop.yieldUnit || 'મણ'}</span>
                      </div>
                    )}
                  </div>

                  {/* UNIVERSAL FARMO LEDGER HUD */}
                  <div className="mt-4 border-2 border-stone-800 rounded-2xl p-4 bg-stone-900 text-white space-y-3">
                    
                    {/* Top Row: ખર્ચ vs ઉપાડ */}
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-700/80">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                          કુલ ખર્ચ રકમ
                        </span>
                        <span className="text-base font-extrabold text-amber-400 block mt-0.5">
                          {formatINR(hisab.totalKharch)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ભાગે: {hasPartner ? formatINR(hisab.kharchBhagePartner) : '100%'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                          કુલ ઉપાડ રકમ
                        </span>
                        <span className="text-base font-extrabold text-indigo-300 block mt-0.5">
                          {formatINR(hisab.totalUpad)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {(crop.upad || []).length} ઉપાડ એન્ટ્રી
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: કુલ મદતર & ખર્ચ કપાત મદતર */}
                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-stone-700/80">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                          કુલ મદતર (પાક વેચાણ)
                        </span>
                        <span className="text-base font-extrabold text-emerald-400 block mt-0.5">
                          {formatINR(hisab.totalMadatar)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {hisab.totalWeightInMann} મણ ({hisab.totalNetWeightKg} kg)
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                          ખર્ચ કપાત મદતર
                        </span>
                        <span className="text-base font-extrabold text-sky-400 block mt-0.5">
                          {formatINR(hisab.kharchKapatMadatar)}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          ચોખ્ખો નફો (Net Return)
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: ભાગે આવતી રકમ & Settlement Status */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">ભાગે આવતી રકમ:</span>
                        <span className="text-xs font-bold text-stone-200">
                          {hasPartner ? `₹${hisab.bhageAavtiRakamPartner.toLocaleString('en-IN')} (${partnerShare}%)` : `₹${hisab.bhageAavtiRakamOwner.toLocaleString('en-IN')} (100%)`}
                        </span>
                      </div>

                      <div>
                        {hasPartner ? (
                          hisab.partnerNeAapvaniRakam > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                              પાર્ટનર ને આપવાના: {formatINR(hisab.partnerNeAapvaniRakam)}
                            </span>
                          ) : hisab.partnerJodeLevaniRakam > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                              પાર્ટનર જોડે લેવાના: {formatINR(hisab.partnerJodeLevaniRakam)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 bg-stone-800 px-2.5 py-1 rounded-lg">
                              હિસાબ બરાબર
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                            100% માલિક નફો: {formatINR(hisab.kharchKapatMadatar)}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenExpenseModal(crop)}
                    className="flex-1 min-w-[105px] flex items-center justify-center gap-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    + ખર્ચ
                  </button>

                  <button
                    onClick={() => handleOpenUpadModal(crop)}
                    className="flex-1 min-w-[105px] flex items-center justify-center gap-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    + ઉપાડ
                  </button>

                  <button
                    onClick={() => handleOpenSaleModal(crop)}
                    className="flex-1 min-w-[105px] flex items-center justify-center gap-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    + વેચાણ (મદતર)
                  </button>

                  <button
                    onClick={() => handleOpenFarmo(crop)}
                    className="flex items-center justify-center gap-1 py-2.5 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-xl text-xs transition cursor-pointer border border-stone-300"
                    title="View 2-Page Hisab Farmo"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600" />
                    હિસાબ ફરમો
                  </button>

                  <button
                    onClick={() => handleOpenHarvest(crop)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                    title="Harvest and Settle Farmo"
                  >
                    <Wheat className="w-3.5 h-3.5 text-amber-400" />
                    લણણી & સેટલ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200/60 rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-stone-900 font-serif">કોઈ સક્રિય પાક નથી (No Ongoing Crops)</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Create an active cultivation card to start logging farm expenses, partner drawings (ઉપાડ), and weighment sales using the Hisab Farmo format.
          </p>
          <button
            onClick={handleOpenAddCrop}
            className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            પહેલો પાક શરૂ કરો
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: START NEW ONGOING CROP                          */}
      {/* ======================================================== */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900 font-serif">નવો પાક શરૂ કરો (Start Crop)</h3>
                  <p className="text-xs text-stone-400">Universal Hisab Farmo format will be applied</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCropModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCropSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Select Farm Plot *</label>
                <select
                  required
                  value={newCropFarmId}
                  onChange={(e) => setNewCropFarmId(e.target.value)}
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-stone-50 cursor-pointer"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.size || f.sizeValue} {f.sizeUnit || 'bigha'}) - {f.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Crop Name (પાક નું નામ) *</label>
                  <input
                    type="text"
                    required
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    placeholder="e.g. કપાસ (Cotton), તમાકુ (Tobacco), ઘઉં"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Seed Variety (જાત / વેરાયટી)</label>
                  <input
                    type="text"
                    value={newCropVariety}
                    onChange={(e) => setNewCropVariety(e.target.value)}
                    placeholder="e.g. BT-2, GW-496, Anand-119"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Season (સીઝન)</label>
                  <select
                    value={newCropSeason}
                    onChange={(e) => setNewCropSeason(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="kharif">ચોમાસુ (Kharif)</option>
                    <option value="rabi">શિયાળુ (Rabi)</option>
                    <option value="zaid">ઉનાળુ (Zaid)</option>
                    <option value="year-round">બારમાસી (Year-round)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Sowing Date (વાવણી તારીખ)</label>
                  <input
                    type="date"
                    required
                    value={newCropSowingDate}
                    onChange={(e) => setNewCropSowingDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Target Yield (અંદાજિત ઉત્પાદન)</label>
                  <input
                    type="number"
                    step="any"
                    value={newCropTargetYield}
                    onChange={(e) => setNewCropTargetYield(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Unit (એકમ)</label>
                  <select
                    value={newCropYieldUnit}
                    onChange={(e) => setNewCropYieldUnit(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="mann">મણ (1 Mann = 20 kg)</option>
                    <option value="quintal">ક્વિન્ટલ (Quintal)</option>
                    <option value="kg">કિલોગ્રામ (Kg)</option>
                    <option value="ton">મેટ્રિક ટન (Ton)</option>
                  </select>
                </div>
              </div>

              {/* Partnership Toggle */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-stone-900 block">શું આ પાકમાં ભાગીદાર (Partner) છે?</span>
                    <span className="text-[11px] text-stone-400 block">બટાઈ, અડધો ભાગ કે સંયુક્ત ખેતી</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasPartner(!hasPartner)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${hasPartner ? 'bg-emerald-600' : 'bg-stone-300'}`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${hasPartner ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {hasPartner && (
                  <div className="mt-4 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-950 mb-1">Partner Full Name *</label>
                      <input
                        type="text"
                        required={hasPartner}
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. ભાવેશભાઈ પટેલ"
                        className="w-full text-xs font-semibold border border-indigo-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-950 mb-1">Partner Phone</label>
                        <input
                          type="text"
                          value={partnerPhone}
                          onChange={(e) => setPartnerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-xs font-semibold border border-indigo-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-950 mb-1">Partner Share % (ભાગ)</label>
                        <select
                          value={partnerSharePercent}
                          onChange={(e) => setPartnerSharePercent(e.target.value)}
                          className="w-full text-xs font-semibold border border-indigo-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                        >
                          <option value="50">50% (અડધો ભાગ - Equal Batai)</option>
                          <option value="40">40% ભાગ</option>
                          <option value="33.33">33.3% (ત્રીજો ભાગ - 1/3rd)</option>
                          <option value="30">30% ભાગ</option>
                          <option value="25">25% (ચોથો ભાગ - 1/4th)</option>
                          <option value="20">20% ભાગ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCropModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  પાક શરૂ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LOG EXPENSE (ખર્ચ)                              */}
      {/* ======================================================== */}
      {isExpenseModalOpen && activeCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">ખર્ચ નોંધો (Log Expense)</h3>
                <p className="text-xs text-stone-400">
                  {activeCrop.cropName} • {activeCrop.farmName}
                </p>
              </div>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">ખર્ચ રકમ (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="₹ 0.00"
                  className="w-full text-lg font-extrabold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 bg-amber-50/20 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">ખર્ચ ની શ્રેણી (Category) *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 bg-white cursor-pointer"
                >
                  <option value="seeds">બિયારણ (Seeds)</option>
                  <option value="fertilizer">ખાતર (Fertilizer)</option>
                  <option value="pesticide">જંતુનાશક દવા (Pesticide / Spray)</option>
                  <option value="labour">મજૂરી / નિંદામણ (Labour)</option>
                  <option value="machinery">ટ્રેક્ટર / રોટાવેટર (Machinery / Fuel)</option>
                  <option value="irrigation">પિયત / વીજળી (Irrigation & Water)</option>
                  <option value="harvesting">કાપણી / લણણી (Harvesting)</option>
                  <option value="transport">ભાડું / ટ્રાન્સપોર્ટ (Transport)</option>
                  <option value="other">પરચુરણ ખર્ચ (Other Expense)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">તારીખ (Date)</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">કોણે ચૂકવ્યા (Paid By)</label>
                  <select
                    value={expPaidBy}
                    onChange={(e) => setExpPaidBy(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 bg-white cursor-pointer"
                  >
                    <option value="owner">માલિક (Me)</option>
                    {activeCrop.partner?.hasPartner && (
                      <>
                        <option value="partner">ભાગીદાર ({activeCrop.partner.name})</option>
                        <option value="shared">સહિયારા (Shared)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">વિગત / નોંધ (Notes)</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. 2 થેલી ડીએપી, નિંદામણ ના મજૂરો"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 font-medium">
                આ ખર્ચ "હિસાબ કરવાનો ફરમો" મુજબ કુલ ખર્ચમાં જોડાશે અને સીઝનના અંતે ભાગીદારી મુજબ કપાત થશે.
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-stone-950 bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow cursor-pointer"
                >
                  ખર્ચ સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: LOG UPAD (ઉપાડ) - PARTNER CASH DRAWINGS          */}
      {/* ======================================================== */}
      {isUpadModalOpen && activeCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">ઉપાડ નોંધો (Log Upad)</h3>
                <p className="text-xs text-stone-400">
                  {activeCrop.cropName} • {activeCrop.farmName}
                </p>
              </div>
              <button 
                onClick={() => setIsUpadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpad} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">ઉપાડ રકમ (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={upadAmount}
                  onChange={(e) => setUpadAmount(e.target.value)}
                  placeholder="₹ 0.00"
                  className="w-full text-lg font-extrabold border border-indigo-200 rounded-xl p-3 focus:outline-none focus:border-indigo-600 bg-indigo-50/20 text-indigo-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">તારીખ (Date)</label>
                  <input
                    type="date"
                    required
                    value={upadDate}
                    onChange={(e) => setUpadDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">કોણે ઉપાડ કર્યો</label>
                  <input
                    type="text"
                    value={upadRecipient}
                    onChange={(e) => setUpadRecipient(e.target.value)}
                    placeholder="Partner Name"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">વિગત / કારણ (Notes)</label>
                <input
                  type="text"
                  value={upadNotes}
                  onChange={(e) => setUpadNotes(e.target.value)}
                  placeholder="e.g. ઘર ખર્ચ પેટે રોકડ એડવાન્સ"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-medium">
                📖 <strong>ફરમો નિયમ:</strong> આમાં પાર્ટનર જે પૈસા મારી જોડેથી લેશે તે આવશે. આ રકમ સીઝનના અંતે પાર્ટનરના નફા ભાગમાંથી સીધી બાદ થશે.
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUpadModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow cursor-pointer"
                >
                  ઉપાડ સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: LOG HARVEST WEIGHMENT & SALE (પાક વેચાણ / મદતર)  */}
      {/* ======================================================== */}
      {isSaleModalOpen && activeCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-serif">પાક વેચાણ & વજન વિગત (Log Sale)</h3>
                <p className="text-xs text-stone-400">
                  {activeCrop.cropName} • Exact Hisab Farmo weighment format
                </p>
              </div>
              <button 
                onClick={() => setIsSaleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4 mt-5">
              
              {/* Row 1: ગ્રોસસ વજન */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ૧. ગ્રોસસ વજન (ખેતર માં નિકડેલ કુલ વજન) કિલો માં *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={saleGrossWeight}
                  onChange={(e) => setSaleGrossWeight(e.target.value)}
                  placeholder="e.g. 1000 kg"
                  className="w-full text-base font-extrabold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-stone-50"
                />
              </div>

              {/* Row 2: અન્ય વજન & વજન કપાત */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    ૨. અન્ય વજન (રગો, ગરિયા વગેરે) kg
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={saleOtherWeight}
                    onChange={(e) => setSaleOtherWeight(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    ૩. વજન કપાત (બારદાન, વટાવ વગેરે) kg
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={saleWeightDeduction}
                    onChange={(e) => setSaleWeightDeduction(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Row 3: Live Auto Calculations Display */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 block uppercase">
                    ૪. નેટ વજન (ગ્રોસ + અન્ય - કપાત)
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {calculatedNetWeightKg} kg
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-900 block uppercase">
                    ૫. વજન મણ માં (નેટ વજન / ૨૦)
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {calculatedWeightInMann} મણ
                  </span>
                </div>
              </div>

              {/* Row 4: પાક વેચાણ ભાવ */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ૬. પાક વેચાણ ભાવ (પ્રતિ મણ ₹ ભાવ) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={saleRatePerMann}
                  onChange={(e) => setSaleRatePerMann(e.target.value)}
                  placeholder="e.g. 1550"
                  className="w-full text-base font-extrabold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              {/* Row 5: કુલ મદતર Highlight Box */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                    ૭. કુલ મદતર (વજન મણ x ભાવ)
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {formatINR(calculatedMadatar)}
                  </span>
                </div>
                <div className="text-right text-xs text-stone-300">
                  <span>{calculatedWeightInMann} મણ @ ₹{saleRatePerMann || 0}</span>
                </div>
              </div>

              {/* Date & Buyer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">વેચાણ તારીખ (Date)</label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">વેપારી / મંડી (Buyer)</label>
                  <input
                    type="text"
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    placeholder="e.g. APMC Mandi, વેપારી"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">નોંધ (Notes)</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="e.g. પહેલું વીણણ / રોકડ અથવા ખાતામાં જમા"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  વેચાણ નોંધો (Save Sale)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: 2-PAGE UNIVERSAL HISAB FARMO MODAL              */}
      {/* ======================================================== */}
      {isFarmoModalOpen && activeCrop && (
        <HisabFarmoModal
          crop={activeCrop}
          onClose={() => setIsFarmoModalOpen(false)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 6: HARVEST & SETTLE FARMO (ARCHIVE TO HISTORY)     */}
      {/* ======================================================== */}
      {isHarvestModalOpen && activeCrop && (() => {
        const hisab = calculateFarmoHisab(activeCrop);
        const hasPartner = !!(activeCrop.partner?.hasPartner);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8">
              <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Wheat className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-stone-900 font-serif">લણણી & આખરી હિસાબ સેટલ</h3>
                    <p className="text-xs text-stone-400">Finalize crop cycle & transfer to Farm History</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmHarvest} className="space-y-4 mt-5">
                
                {/* Summary recap matching Farmo */}
                <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-800">
                    <span className="text-stone-300 font-bold">{activeCrop.cropName}</span>
                    <span className="font-extrabold text-emerald-400">{activeCrop.farmName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">કુલ મદતર (વેચાણ)</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {formatINR(hisab.totalMadatar)} ({hisab.totalWeightInMann} મણ)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">કુલ ખર્ચ રકમ</span>
                      <span className="font-extrabold text-amber-400 text-sm">
                        {formatINR(hisab.totalKharch)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">ખર્ચ કપાત મદતર (નફો)</span>
                      <span className="font-extrabold text-sky-400 text-sm">
                        {formatINR(hisab.kharchKapatMadatar)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">કુલ ઉપાડ રકમ</span>
                      <span className="font-extrabold text-indigo-300 text-sm">
                        {formatINR(hisab.totalUpad)}
                      </span>
                    </div>
                  </div>

                  {hasPartner && (
                    <div className="pt-2 border-t border-stone-800 text-xs">
                      {hisab.partnerNeAapvaniRakam > 0 ? (
                        <p className="text-emerald-300 font-bold">
                          🤝 પાર્ટનર ને આપવાની ચોખ્ખી રકમ: {formatINR(hisab.partnerNeAapvaniRakam)}
                        </p>
                      ) : hisab.partnerJodeLevaniRakam > 0 ? (
                        <p className="text-amber-300 font-bold">
                          🤝 પાર્ટનર જોડે લેવાની ચોખ્ખી રકમ: {formatINR(hisab.partnerJodeLevaniRakam)}
                        </p>
                      ) : (
                        <p className="text-stone-400 font-bold">🤝 પાર્ટનર હિસાબ બરાબર / ક્લિયર</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">લણણી & આખરી તારીખ (Harvest Date)</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Partner Settlement Clear Check */}
                {hasPartner && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200/60 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-950">
                        ભાગીદાર: {activeCrop.partner.name} ({activeCrop.partner.sharePercent}% Share)
                      </span>
                      <span className="text-xs font-bold text-indigo-700">ફરમો આખરી સમાધાન</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={partnerBalanceCleared}
                        onChange={(e) => setPartnerBalanceCleared(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        ફરમો મુજબ તમામ ઉપાડ અને નફાની લેતી-દેતી ક્લિયર થઈ ગયેલ છે.
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">આખરી નોંધ / સેમ્પલ રિમાર્ક્સ</label>
                  <input
                    type="text"
                    value={harvestNotes}
                    onChange={(e) => setHarvestNotes(e.target.value)}
                    placeholder="e.g. આખરી હિસાબ ક્લિયર કરી સીઝન પૂર્ણ કરી"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 font-medium">
                  ℹ️ લણણી પૂર્ણ થતાં જ સંપૂર્ણ <strong>હિસાબ કરવાનો ફરમો</strong> કાયમી માટે <strong>{activeCrop.farmName}</strong> ના Harvest History માં સંગ્રહિત થશે અને ખેતરના તમામ એનાલિટિક્સ ગ્રાફ્સ અપડેટ થશે!
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHarvestModalOpen(false)}
                    className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hasPartner && !partnerBalanceCleared}
                    className="flex-1 py-3 text-xs font-extrabold text-white bg-stone-900 hover:bg-black disabled:opacity-50 rounded-xl transition shadow cursor-pointer"
                  >
                    લણણી અને ફરમો સેવ કરો
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
