import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useCurrentCropStore } from '../../store/useCurrentCropStore.js';
import { 
  Sprout, 
  MapPin, 
  Scale, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Wheat, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Droplets, 
  Layers, 
  Receipt, 
  FileText, 
  DollarSign, 
  Coins, 
  X,
  ExternalLink,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line,
  ComposedChart
} from 'recharts';
import { formatINR, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import SeasonBadge from '../../components/SeasonBadge.jsx';
import OwnershipBadge from '../../components/OwnershipBadge.jsx';
import Toast from '../../components/Toast.jsx';
import HisabFarmoModal from '../../components/HisabFarmoModal.jsx';

export default function FarmDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { profile } = useAuthStore();
  const { farms, fetchFarms, selectedFarm, setSelectedFarm, editFarm, addFarmHistory, removeFarm } = useFarmStore();
  const { crops, fetchCrops } = useCurrentCropStore();

  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics' | 'partners' | 'details'
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals state
  const [isEditFarmModalOpen, setIsEditFarmModalOpen] = useState(false);
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
  const [selectedFarmoHistory, setSelectedFarmoHistory] = useState(null);

  // Edit Farm Form state
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [farmSizeUnit, setFarmSizeUnit] = useState('bigha');
  const [farmOwnership, setFarmOwnership] = useState('own');
  const [farmSoilType, setFarmSoilType] = useState('Black Cotton');
  const [farmIrrigation, setFarmIrrigation] = useState('Canal & Tubewell');
  const [farmNotes, setFarmNotes] = useState('');

  // Add Past Harvest Form state
  const [histCropName, setHistCropName] = useState('');
  const [histVariety, setHistVariety] = useState('');
  const [histSeason, setHistSeason] = useState('kharif');
  const [histYear, setHistYear] = useState(new Date().getFullYear().toString());
  const [histHarvestDate, setHistHarvestDate] = useState(toLocalDateString());
  const [histYield, setHistYield] = useState('');
  const [histYieldUnit, setHistYieldUnit] = useState('quintal');
  const [histMandiRate, setHistMandiRate] = useState('');
  const [histExpenses, setHistExpenses] = useState('');
  const [histRevenue, setHistRevenue] = useState('');
  const [histPartnerName, setHistPartnerName] = useState('');
  const [histPartnerShare, setHistPartnerShare] = useState('50');
  const [histPartnerSettled, setHistPartnerSettled] = useState('');
  const [histNotes, setHistNotes] = useState('');

  // Selected crop filter for analytics
  const [selectedCropAnalytics, setSelectedCropAnalytics] = useState('all');

  // Load farm and current crops
  useEffect(() => {
    const uid = profile?.uid || 'default';
    fetchFarms(uid);
    fetchCrops(uid);
  }, [profile, fetchFarms, fetchCrops]);

  // Set selected farm from store
  useEffect(() => {
    if (farms.length > 0 && id) {
      const found = farms.find(f => f.id === id);
      if (found) {
        setSelectedFarm(found);
        setFarmName(found.name || '');
        setFarmLocation(found.location || '');
        setFarmSize((found.size || found.sizeValue || 1).toString());
        setFarmSizeUnit(found.sizeUnit || 'bigha');
        setFarmOwnership(found.ownershipType || 'own');
        setFarmSoilType(found.soilType || 'Black Cotton');
        setFarmIrrigation(found.irrigationSource || 'Canal & Tubewell');
        setFarmNotes(found.notes || '');
      }
    }
  }, [farms, id, setSelectedFarm]);

  // Real-time fetched ongoing crop from Current State for this farm
  const liveOngoingCrop = useMemo(() => {
    return crops.find(c => c.farmId === id && c.status === 'ongoing');
  }, [crops, id]);

  // Real-time crop history for this farm
  const cropHistory = useMemo(() => {
    return (selectedFarm?.cropHistory || []).slice().sort((a, b) => {
      const yearDiff = (b.year || 0) - (a.year || 0);
      if (yearDiff !== 0) return yearDiff;
      return new Date(b.harvestDate || 0) - new Date(a.harvestDate || 0);
    });
  }, [selectedFarm?.cropHistory]);

  // ========================================================
  // ANALYTICS COMPUTATIONS
  // ========================================================

  // 1. Entire Average Per Season of All Crops
  const seasonAnalytics = useMemo(() => {
    const seasonMap = {
      kharif: { season: 'Kharif', count: 0, totalYield: 0, totalExp: 0, totalRev: 0, totalNet: 0 },
      rabi: { season: 'Rabi', count: 0, totalYield: 0, totalExp: 0, totalRev: 0, totalNet: 0 },
      zaid: { season: 'Zaid', count: 0, totalYield: 0, totalExp: 0, totalRev: 0, totalNet: 0 },
    };

    cropHistory.forEach(h => {
      const s = (h.season || 'kharif').toLowerCase();
      if (seasonMap[s]) {
        seasonMap[s].count += 1;
        seasonMap[s].totalYield += parseFloat(h.yieldAmount) || 0;
        seasonMap[s].totalExp += parseFloat(h.totalExpenses) || 0;
        seasonMap[s].totalRev += parseFloat(h.totalRevenue) || 0;
        seasonMap[s].totalNet += parseFloat(h.netProfit) || 0;
      }
    });

    return Object.values(seasonMap).map(item => ({
      season: item.season,
      count: item.count,
      avgYield: item.count > 0 ? Number((item.totalYield / item.count).toFixed(1)) : 0,
      avgExpenses: item.count > 0 ? Math.round(item.totalExp / item.count) : 0,
      avgRevenue: item.count > 0 ? Math.round(item.totalRev / item.count) : 0,
      avgNetProfit: item.count > 0 ? Math.round(item.totalNet / item.count) : 0,
      roi: item.totalExp > 0 ? Number(((item.totalNet / item.totalExp) * 100).toFixed(1)) : 0
    }));
  }, [cropHistory]);

  // 2. Crop-Wise Analytics
  const cropWiseAnalytics = useMemo(() => {
    const map = {};
    cropHistory.forEach(h => {
      // Normalize crop name (e.g., 'Wheat (Sharbati)' -> 'Wheat')
      const baseName = (h.cropName || 'Other').split('(')[0].trim();
      if (!map[baseName]) {
        map[baseName] = { cropName: baseName, count: 0, totalYield: 0, totalExp: 0, totalRev: 0, totalNet: 0, historyList: [] };
      }
      map[baseName].count += 1;
      map[baseName].totalYield += parseFloat(h.yieldAmount) || 0;
      map[baseName].totalExp += parseFloat(h.totalExpenses) || 0;
      map[baseName].totalRev += parseFloat(h.totalRevenue) || 0;
      map[baseName].totalNet += parseFloat(h.netProfit) || 0;
      map[baseName].historyList.push(h);
    });

    return Object.values(map).map(c => ({
      cropName: c.cropName,
      count: c.count,
      avgYield: c.count > 0 ? Number((c.totalYield / c.count).toFixed(1)) : 0,
      totalYield: c.totalYield,
      avgExpense: c.count > 0 ? Math.round(c.totalExp / c.count) : 0,
      avgRevenue: c.count > 0 ? Math.round(c.totalRev / c.count) : 0,
      avgNetProfit: c.count > 0 ? Math.round(c.totalNet / c.count) : 0,
      totalNetProfit: c.totalNet,
      roi: c.totalExp > 0 ? Number(((c.totalNet / c.totalExp) * 100).toFixed(1)) : 0,
      historyList: c.historyList
    }));
  }, [cropHistory]);

  // Overall KPI stats
  const totalLifetimeYield = cropHistory.reduce((s, h) => s + (parseFloat(h.yieldAmount) || 0), 0);
  const totalLifetimeNetProfit = cropHistory.reduce((s, h) => s + (parseFloat(h.netProfit) || 0), 0);
  const totalHarvestsCount = cropHistory.length;
  const bestCrop = cropWiseAnalytics.slice().sort((a, b) => b.totalNetProfit - a.totalNetProfit)[0]?.cropName || 'N/A';

  // All distinct partners from history and live
  const allPartnersHistory = useMemo(() => {
    const pMap = {};
    // Check live ongoing crop partner
    if (liveOngoingCrop?.partner?.hasPartner) {
      const p = liveOngoingCrop.partner;
      pMap[p.name] = {
        name: p.name,
        phone: p.phone,
        status: 'Active (Ongoing)',
        cropName: liveOngoingCrop.cropName,
        season: liveOngoingCrop.season,
        sharePercent: p.sharePercent,
        settledAmount: 0
      };
    }
    // Check past history
    cropHistory.forEach(h => {
      if (h.partner?.name) {
        const p = h.partner;
        if (!pMap[p.name]) {
          pMap[p.name] = {
            name: p.name,
            phone: p.phone || '',
            status: 'Past (Settled)',
            cropName: h.cropName,
            season: h.season,
            sharePercent: p.sharePercent || 50,
            settledAmount: p.settledAmount || 0
          };
        } else if (pMap[p.name].status !== 'Active (Ongoing)') {
          pMap[p.name].settledAmount += (p.settledAmount || 0);
        }
      }
    });
    return Object.values(pMap);
  }, [liveOngoingCrop, cropHistory]);

  // Save Edit Farm handler
  const handleSaveEditFarm = (e) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    editFarm(id, {
      name: farmName.trim(),
      location: farmLocation.trim(),
      size: parseFloat(farmSize) || 1,
      sizeValue: parseFloat(farmSize) || 1,
      sizeUnit: farmSizeUnit,
      ownershipType: farmOwnership,
      soilType: farmSoilType,
      irrigationSource: farmIrrigation,
      notes: farmNotes.trim()
    });

    setToastMsg('Farm parameters updated successfully in real time!');
    setToastType('success');
    setIsEditFarmModalOpen(false);
  };

  // Save Add Past Harvest Record handler
  const handleSaveAddHistory = (e) => {
    e.preventDefault();
    if (!histCropName.trim() || !histYield || parseFloat(histYield) <= 0) return;

    const expVal = parseFloat(histExpenses) || 0;
    const revVal = parseFloat(histRevenue) || 0;
    const netVal = revVal - expVal;
    const yVal = parseFloat(histYield);

    const record = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cropName: histCropName.trim(),
      variety: histVariety.trim(),
      season: histSeason,
      year: parseInt(histYear) || new Date().getFullYear(),
      harvestDate: histHarvestDate,
      yieldAmount: yVal,
      yieldUnit: histYieldUnit,
      mandiRate: parseFloat(histMandiRate) || 0,
      totalExpenses: expVal,
      totalRevenue: revVal,
      netProfit: netVal,
      roiPercent: expVal > 0 ? Number(((netVal / expVal) * 100).toFixed(1)) : 100,
      partner: histPartnerName.trim() ? {
        name: histPartnerName.trim(),
        sharePercent: parseFloat(histPartnerShare) || 50,
        settledAmount: parseFloat(histPartnerSettled) || Math.round((netVal * (parseFloat(histPartnerShare) || 50)) / 100),
        status: 'cleared'
      } : null,
      notes: histNotes.trim()
    };

    addFarmHistory(id, record);
    setToastMsg(`Past record for ${histCropName} added to farm history!`);
    setToastType('success');
    setIsAddHistoryModalOpen(false);

    // Reset
    setHistCropName('');
    setHistVariety('');
    setHistYield('');
    setHistExpenses('');
    setHistRevenue('');
    setHistNotes('');
  };

  if (!selectedFarm) {
    return (
      <div className="p-8 text-center text-stone-400">
        <Sprout className="w-10 h-10 mx-auto mb-2 animate-bounce text-emerald-600" />
        <p className="font-bold">Loading Farm Details...</p>
      </div>
    );
  }

  const farmAreaSize = selectedFarm.size || selectedFarm.sizeValue || 1;

  return (
    <div className="space-y-6">
      {/* Toast */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/farms')}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-600 hover:text-stone-900 bg-white border border-stone-200/60 px-3 py-1.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Farms
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditFarmModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-stone-700 hover:text-stone-950 bg-white border border-stone-200/60 hover:border-stone-400 px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-emerald-600" />
            Edit Farm Details
          </button>
        </div>
      </div>

      {/* Master Farm Profile Card */}
      <div className="bg-white border border-stone-200/70 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100">
              <Sprout className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {selectedFarm.name}
                </h1>
                <OwnershipBadge type={selectedFarm.ownershipType || 'own'} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-stone-400 font-semibold">
                <span className="flex items-center gap-1 text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedFarm.location || 'India'}
                </span>
                <span className="flex items-center gap-1 text-stone-600">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  {farmAreaSize} {t(`unit.${selectedFarm.sizeUnit || 'bigha'}`)}
                </span>
                <span className="flex items-center gap-1 text-stone-600">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Soil: {selectedFarm.soilType || 'Black Cotton'}
                </span>
                <span className="flex items-center gap-1 text-stone-600">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Water: {selectedFarm.irrigationSource || 'Canal & Tubewell'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Lifetime Summary Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-3 text-center min-w-[100px]">
              <span className="text-[10px] text-stone-400 font-bold block uppercase">Harvests</span>
              <span className="text-base font-extrabold text-stone-900">{totalHarvestsCount}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] text-stone-400 font-bold block uppercase">Total Yield</span>
              <span className="text-base font-extrabold text-stone-900">{totalLifetimeYield} Qtl</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-3 text-center min-w-[120px]">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Net Return</span>
              <span className="text-base font-extrabold text-emerald-800">{formatINR(totalLifetimeNetProfit)}</span>
            </div>
          </div>
        </div>

        {/* Real-Time Live Ongoing Crop & Partner Status Banner */}
        <div className="mt-6">
          {liveOngoingCrop ? (
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-800/50 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Active Ongoing Crop in Current State
                  </span>
                  <SeasonBadge seasonId={liveOngoingCrop.season} />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  {liveOngoingCrop.cropName}
                  {liveOngoingCrop.variety && <span className="text-xs text-stone-300 font-medium ml-2">({liveOngoingCrop.variety})</span>}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
                  <span>📅 Sown: {formatDate(liveOngoingCrop.sowingDate)}</span>
                  <span>
                    {liveOngoingCrop.partner?.hasPartner ? (
                      <span className="text-indigo-300 font-bold">
                        🤝 Current Partner: {liveOngoingCrop.partner.name} ({liveOngoingCrop.partner.sharePercent}% Share) • {liveOngoingCrop.partner.phone}
                      </span>
                    ) : (
                      <span className="text-emerald-300 font-bold">🚜 Self-Managed (No Partner)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block pr-3 border-r border-stone-700">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Current Active Expenses</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatINR((liveOngoingCrop.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0))}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/current-state?farmId=${id}`)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
                >
                  Manage in Current State
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-stone-800">No Crop Currently Ongoing in this Farm</p>
                  <p className="text-[11px] text-stone-400">Start a new cultivation cycle in Current State to track live expenses & sales.</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/current-state?farmId=${id}&action=new_crop`)}
                className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Start Crop in Current State
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200/60 gap-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeTab === 'history' 
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30' 
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          <Wheat className="w-4 h-4" />
          Yield & Harvest History ({cropHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeTab === 'analytics' 
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30' 
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics & Seasonal Charts
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeTab === 'partners' 
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30' 
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          <Users className="w-4 h-4" />
          Partners History ({allPartnersHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeTab === 'details' 
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/30' 
              : 'border-transparent text-stone-400 hover:text-stone-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          Land Parameters & Specs
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: YIELD & HARVEST HISTORY LEDGER                    */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">Historical Crop Harvests & Financial Yields</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Archived records automatically saved upon harvest clearance in Current State, or entered manually below.
              </p>
            </div>
            <button
              onClick={() => setIsAddHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Past Season Record
            </button>
          </div>

          {cropHistory.length > 0 ? (
            <div className="space-y-4">
              {cropHistory.map((h) => {
                const yieldVal = parseFloat(h.yieldAmount) || 0;
                const productivity = farmAreaSize > 0 ? (yieldVal / farmAreaSize).toFixed(1) : yieldVal;

                return (
                  <div 
                    key={h.id} 
                    className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <SeasonBadge seasonId={h.season} />
                        <span className="text-xs font-bold text-stone-400">{h.year} Season</span>
                        <span className="text-xs font-semibold text-stone-400">• Harvested {formatDate(h.harvestDate)}</span>
                      </div>

                      <h4 className="text-xl font-extrabold text-stone-900">
                        {h.cropName}
                        {h.variety && <span className="text-xs font-semibold text-stone-400 ml-2">({h.variety})</span>}
                      </h4>

                      {/* Yield details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-600">
                        <span className="bg-amber-50 border border-amber-200/60 text-amber-900 px-2.5 py-1 rounded-lg">
                          🌾 Total Yield: <strong>{yieldVal} {h.yieldUnit || 'quintal'}</strong>
                        </span>
                        <span className="bg-emerald-50 border border-emerald-200/60 text-emerald-900 px-2.5 py-1 rounded-lg">
                          📈 Productivity: <strong>{productivity} Qtl/{selectedFarm.sizeUnit || 'bigha'}</strong>
                        </span>
                        {h.mandiRate > 0 && (
                          <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                            Mandi Rate: ₹{h.mandiRate}/Qtl
                          </span>
                        )}
                      </div>

                      {/* Partner settlement status */}
                      {h.partner?.name && (
                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50/60 border border-indigo-100 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Partner: {h.partner.name} ({h.partner.sharePercent}% Share) • {formatINR(h.partner.settledAmount)} Settled & Cleared
                        </div>
                      )}

                      {h.notes && (
                        <p className="text-xs text-stone-400 italic pt-1">"{h.notes}"</p>
                      )}

                      <div className="pt-1">
                        <button
                          onClick={() => setSelectedFarmoHistory({
                            ...h,
                            farmName: selectedFarm.name,
                            farmoDetails: h.farmoDetails || {
                              totalKharch: h.totalExpenses || 0,
                              totalUpad: h.totalUpad || 0,
                              totalGrossWeightKg: h.grossWeightKg || ((h.yieldAmount || 0) * 20),
                              totalOtherWeightKg: h.otherWeightKg || 0,
                              totalWeightDeductionKg: h.weightDeductionKg || 0,
                              totalNetWeightKg: h.netWeightKg || ((h.yieldAmount || 0) * 20),
                              totalWeightInMann: h.weightInMann || h.yieldAmount || 0,
                              totalMadatar: h.totalRevenue || 0,
                              kharchKapatMadatar: h.kharchKapatMadatar !== undefined ? h.kharchKapatMadatar : ((h.totalRevenue || 0) - (h.totalExpenses || 0)),
                              bhageAavtiRakamOwner: h.bhageAavtiRakamOwner !== undefined ? h.bhageAavtiRakamOwner : Math.round(((h.totalRevenue || 0) - (h.totalExpenses || 0)) * 0.5),
                              bhageAavtiRakamPartner: h.bhageAavtiRakamPartner !== undefined ? h.bhageAavtiRakamPartner : Math.round(((h.totalRevenue || 0) - (h.totalExpenses || 0)) * 0.5),
                              partnerNetShare: h.partnerNetShare !== undefined ? h.partnerNetShare : (h.partner?.settledAmount || 0),
                              maneMadelRakam: h.bhageAavtiRakamOwner !== undefined ? h.bhageAavtiRakamOwner : Math.round(((h.totalRevenue || 0) - (h.totalExpenses || 0)) * 0.5),
                              partnerNeMadelRakam: h.partnerNetShare !== undefined ? h.partnerNetShare : (h.partner?.settledAmount || 0),
                              partnerNeAapvaniRakam: h.partnerNeAapvaniRakam || (h.partner?.settledAmount || 0),
                              partnerJodeLevaniRakam: h.partnerJodeLevaniRakam || 0
                            }
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer border border-stone-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-600" />
                          <span>📄 હિસાબ ફરમો (Hisab Farmo)</span>
                        </button>
                      </div>
                    </div>

                    {/* Financial summary HUD */}
                    <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 min-w-[240px] text-right space-y-1.5 shrink-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400 font-semibold">Total Expenses:</span>
                        <span className="font-extrabold text-stone-700">{formatINR(h.totalExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400 font-semibold">Total Revenue:</span>
                        <span className="font-extrabold text-stone-700">{formatINR(h.totalRevenue)}</span>
                      </div>
                      <div className="pt-2 border-t border-stone-200/70 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-stone-900 uppercase">Net Profit:</span>
                        <span className="text-base font-extrabold text-emerald-700">+{formatINR(h.netProfit)}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold">
                        ROI: <span className="text-emerald-600 font-extrabold">{h.roiPercent || 100}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-3xl p-12 text-center">
              <Wheat className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h4 className="text-base font-extrabold text-stone-800">No Harvest Records Yet</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Once ongoing crops in Current State are harvested, their complete data will automatically appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ANALYTICS CHARTS & GRAPHS                         */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Top KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Lifetime Net Return</span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatINR(totalLifetimeNetProfit)}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">All seasons combined</p>
            </div>

            <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Total Production</span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{totalLifetimeYield} Qtl</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Harvested output</p>
            </div>

            <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Average Productivity</span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">
                {cropHistory.length > 0 ? (totalLifetimeYield / (farmAreaSize * cropHistory.length)).toFixed(1) : 0} Qtl/{selectedFarm.sizeUnit || 'bigha'}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Average per crop cycle</p>
            </div>

            <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Top Performing Crop</span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{bestCrop}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Highest net return</p>
            </div>
          </div>

          {/* CHART 1: ENTIRE AVERAGE PER SEASON OF ALL CROPS */}
          <div className="bg-white border border-stone-200/70 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Entire Average Per Season of All Crops
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Seasonal comparison (Kharif vs Rabi vs Zaid) based on historical average yields, expenses, and net returns.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Financial Averages Chart */}
              <div>
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">
                  Average Revenue vs Expense vs Net Profit (₹)
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                      <XAxis dataKey="season" tick={{ fontSize: 12, fontWeight: 'bold' }} stroke="#78716c" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#78716c" tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip formatter={(value) => [formatINR(value), '']} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                      <Bar dataKey="avgRevenue" name="Avg Revenue" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="avgExpenses" name="Avg Expense" fill="#d97706" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="avgNetProfit" name="Avg Net Profit" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Yield Averages Chart */}
              <div>
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">
                  Average Yield per Season (Quintals)
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                      <XAxis dataKey="season" tick={{ fontSize: 12, fontWeight: 'bold' }} stroke="#78716c" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#78716c" />
                      <Tooltip formatter={(value) => [`${value} Quintal`, 'Average Output']} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                      <Bar dataKey="avgYield" name="Avg Yield (Qtl)" fill="#84cc16" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Season Data Table */}
            <div className="border border-stone-200/60 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Season</th>
                    <th className="p-3">Crops Harvested</th>
                    <th className="p-3">Average Yield</th>
                    <th className="p-3">Average Expenses</th>
                    <th className="p-3">Average Revenue</th>
                    <th className="p-3">Average Net Profit</th>
                    <th className="p-3">Average ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-semibold text-stone-800">
                  {seasonAnalytics.map(s => (
                    <tr key={s.season} className="hover:bg-stone-50/50">
                      <td className="p-3 font-extrabold">{s.season}</td>
                      <td className="p-3">{s.count} cycle(s)</td>
                      <td className="p-3 font-bold text-emerald-700">{s.avgYield} Quintal</td>
                      <td className="p-3 text-amber-700">{formatINR(s.avgExpenses)}</td>
                      <td className="p-3">{formatINR(s.avgRevenue)}</td>
                      <td className="p-3 font-extrabold text-emerald-700">+{formatINR(s.avgNetProfit)}</td>
                      <td className="p-3 font-bold text-sky-700">{s.roi}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHART 2: CROP-WISE ANALYTICS CHARTS */}
          <div className="bg-white border border-stone-200/70 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Crop-Wise Performance & Productivity Comparison
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Detailed analytics breakdown for each individual crop type grown historically in this farm plot.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-500">Filter Crop:</span>
                <select
                  value={selectedCropAnalytics}
                  onChange={(e) => setSelectedCropAnalytics(e.target.value)}
                  className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Crops Combined</option>
                  {cropWiseAnalytics.map(c => (
                    <option key={c.cropName} value={c.cropName}>{c.cropName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Crop Yield Chart */}
              <div>
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">
                  Average Yield Output by Crop (Quintals)
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropWiseAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                      <XAxis dataKey="cropName" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#78716c" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#78716c" />
                      <Tooltip formatter={(value) => [`${value} Qtl`, 'Average Yield']} />
                      <Bar dataKey="avgYield" name="Avg Yield" fill="#1D9E75" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Crop Net Profit Comparison */}
              <div>
                <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">
                  Total Cumulative Net Profit by Crop (₹)
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cropWiseAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0ee" />
                      <XAxis dataKey="cropName" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#78716c" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#78716c" tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip formatter={(value) => [formatINR(value), 'Total Net Profit']} />
                      <Bar dataKey="totalNetProfit" name="Total Net Profit" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Individual Crop Progression Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cropWiseAnalytics
                .filter(c => selectedCropAnalytics === 'all' || c.cropName === selectedCropAnalytics)
                .map(c => (
                  <div key={c.cropName} className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="font-extrabold text-sm text-stone-900">{c.cropName}</h5>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {c.count} Harvest(s)
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-stone-600">
                      <div className="flex justify-between">
                        <span>Average Yield:</span>
                        <strong className="text-stone-900">{c.avgYield} Quintals</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Cycle Expense:</span>
                        <strong>{formatINR(c.avgExpense)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumulative Net Profit:</span>
                        <strong className="text-emerald-700">+{formatINR(c.totalNetProfit)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Return on Investment:</span>
                        <strong className="text-sky-700">{c.roi}% ROI</strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PARTNERS HISTORY ARCHIVE                          */}
      {/* ======================================================== */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/60 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-stone-900">Partnership History on {selectedFarm.name}</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Historical record of all farming partners, shares, and settled payouts on this land parcel.
            </p>
          </div>

          {allPartnersHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPartnersHistory.map((p, idx) => (
                <div key={idx} className="bg-white border border-stone-200/70 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-base">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-stone-900">{p.name}</h4>
                        <p className="text-xs text-stone-400">{p.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      p.status.includes('Active') ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Crop & Season</span>
                      <span className="font-extrabold text-stone-800">{p.cropName} ({p.season})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Agreement Share</span>
                      <span className="font-extrabold text-indigo-700">{p.sharePercent}% Share</span>
                    </div>
                    <div className="col-span-2 pt-1">
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Settled Amount</span>
                      <span className="font-extrabold text-emerald-700 text-sm">{formatINR(p.settledAmount)} (Account Cleared)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-3xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h4 className="text-base font-extrabold text-stone-800">No Partners Recorded on this Farm</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                This farm parcel is currently self-managed, or no partnership crops have been harvested yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LAND PARAMETERS & SPECS                           */}
      {/* ======================================================== */}
      {activeTab === 'details' && (
        <div className="bg-white border border-stone-200/70 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-extrabold text-stone-900">Land Parcel Master Parameters</h3>
              <p className="text-xs text-stone-400">Fixed property attributes, soil profile, and water source</p>
            </div>
            <button
              onClick={() => setIsEditFarmModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit These Parameters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Farm Parcel Name</span>
              <p className="font-extrabold text-sm text-stone-900">{selectedFarm.name}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Location & District</span>
              <p className="font-extrabold text-sm text-stone-900">{selectedFarm.location || 'Gujarat, India'}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Total Land Area</span>
              <p className="font-extrabold text-sm text-stone-900">{farmAreaSize} {selectedFarm.sizeUnit || 'bigha'}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Ownership Tenure</span>
              <p className="font-extrabold text-sm text-stone-900 capitalize">{selectedFarm.ownershipType || 'own'}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Soil Profile</span>
              <p className="font-extrabold text-sm text-stone-900">{selectedFarm.soilType || 'Black Cotton'}</p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Irrigation Infrastructure</span>
              <p className="font-extrabold text-sm text-stone-900">{selectedFarm.irrigationSource || 'Canal & Tubewell'}</p>
            </div>

            <div className="md:col-span-2 p-4 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-1">
              <span className="text-stone-400 font-bold uppercase text-[10px] block">Plot Notes / Registry Details</span>
              <p className="font-semibold text-stone-800 leading-relaxed">{selectedFarm.notes || 'No special notes recorded.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT FARM DETAILS                                 */}
      {/* ======================================================== */}
      {isEditFarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900">Edit Farm Details</h3>
                  <p className="text-xs text-stone-400">Update land area, location, soil & water specs</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditFarmModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFarm} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Farm Name *</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Location (Village / District) *</label>
                <input
                  type="text"
                  required
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Land Area *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Area Unit</label>
                  <select
                    value={farmSizeUnit}
                    onChange={(e) => setFarmSizeUnit(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="bigha">Bigha</option>
                    <option value="acre">Acre</option>
                    <option value="hectare">Hectare</option>
                    <option value="guntha">Guntha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Ownership Type</label>
                  <select
                    value={farmOwnership}
                    onChange={(e) => setFarmOwnership(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="own">Self-Owned Land</option>
                    <option value="leased">Leased / Rental Land</option>
                    <option value="partner">Joint Partnership Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Soil Type</label>
                  <select
                    value={farmSoilType}
                    onChange={(e) => setFarmSoilType(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Black Cotton">Black Cotton Soil (Kali Mitti)</option>
                    <option value="Loamy Alluvial">Loamy Alluvial Soil</option>
                    <option value="Red Sandy">Red Sandy Loam</option>
                    <option value="Clayey">Clayey Soil</option>
                    <option value="Sandy">Sandy Soil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Irrigation Source</label>
                <input
                  type="text"
                  value={farmIrrigation}
                  onChange={(e) => setFarmIrrigation(e.target.value)}
                  placeholder="e.g. Canal & Tubewell / Drip System"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Notes & Description</label>
                <textarea
                  rows="3"
                  value={farmNotes}
                  onChange={(e) => setFarmNotes(e.target.value)}
                  placeholder="Plot notes, Khata survey number, boundary details..."
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditFarmModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD PAST SEASON HARVEST RECORD                     */}
      {/* ======================================================== */}
      {isAddHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">Add Past Season Record</h3>
                <p className="text-xs text-stone-400">Record past harvests to complete farm historical analytics</p>
              </div>
              <button 
                onClick={() => setIsAddHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddHistory} className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={histCropName}
                    onChange={(e) => setHistCropName(e.target.value)}
                    placeholder="e.g. Wheat, Cotton"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Variety</label>
                  <input
                    type="text"
                    value={histVariety}
                    onChange={(e) => setHistVariety(e.target.value)}
                    placeholder="e.g. GW-496"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Season</label>
                  <select
                    value={histSeason}
                    onChange={(e) => setHistSeason(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="kharif">Kharif</option>
                    <option value="rabi">Rabi</option>
                    <option value="zaid">Zaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={histYear}
                    onChange={(e) => setHistYear(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={histHarvestDate}
                    onChange={(e) => setHistHarvestDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Total Yield *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={histYield}
                    onChange={(e) => setHistYield(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Unit</label>
                  <select
                    value={histYieldUnit}
                    onChange={(e) => setHistYieldUnit(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="quintal">Quintal</option>
                    <option value="kg">Kg</option>
                    <option value="ton">Metric Ton</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Total Expenses (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={histExpenses}
                    onChange={(e) => setHistExpenses(e.target.value)}
                    placeholder="₹ 0"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Total Revenue (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={histRevenue}
                    onChange={(e) => setHistRevenue(e.target.value)}
                    placeholder="₹ 0"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Partner Name (Optional)</label>
                  <input
                    type="text"
                    value={histPartnerName}
                    onChange={(e) => setHistPartnerName(e.target.value)}
                    placeholder="e.g. Bhavesh Patel"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Partner Share %</label>
                  <input
                    type="number"
                    value={histPartnerShare}
                    onChange={(e) => setHistPartnerShare(e.target.value)}
                    placeholder="50"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={histNotes}
                  onChange={(e) => setHistNotes(e.target.value)}
                  placeholder="e.g. Sold at APMC Mandi, good rates"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddHistoryModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hisab Farmo Ledger Modal for Past Record */}
      {selectedFarmoHistory && (
        <HisabFarmoModal
          crop={selectedFarmoHistory}
          onClose={() => setSelectedFarmoHistory(null)}
        />
      )}

    </div>
  );
}
