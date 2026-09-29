import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { 
  ArrowLeft, Check, Users, Shield, Award, 
  HelpCircle, Calendar, FileText, Smartphone,
  Info, Sparkles, CheckSquare, Plus, Save, ChevronRight, ChevronLeft
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../../../shared/constants/categories.js';
import { getFarmById, updateFarm } from '../../../../shared/services/farmService.js';
import { toLocalDateString, parseLocalDateString } from '../../../../shared/utils/helpers.js';

const SYSTEM_PRESETS = [
  {
    id: 'batai',
    name: 'Batai (50-50)',
    description: 'Both share crop + expenses 50-50',
    cropShare: 50,
    expenses: { all: 50 },
    work: ['labour', 'irrigation', 'sowing', 'weeding', 'harvesting']
  },
  {
    id: 'bhag',
    name: 'Bhag (25%)',
    description: 'Partner gets 25% crop, 0 expense share',
    cropShare: 25,
    expenses: { all: 0 },
    work: ['irrigation', 'watchman']
  },
  {
    id: 'tihaj',
    name: 'Tihaj (33%)',
    description: 'Partner gets 33% crop, shares seeds + fertilizer',
    cropShare: 33,
    expenses: { khad_fertilizer: 33, beej_seeds: 33, default: 0 },
    work: ['labour', 'sowing']
  },
  {
    id: 'adha',
    name: 'Adha (50%)',
    description: 'Partner gets 50% crop, shares seeds only',
    cropShare: 50,
    expenses: { beej_seeds: 50, default: 0 },
    work: ['labour', 'sowing', 'weeding']
  },
  {
    id: 'labour',
    name: 'Labour only (10%)',
    description: 'Partner does work, gets 10% crop, 0 expense share',
    cropShare: 10,
    expenses: { all: 0 },
    work: ['labour', 'sowing', 'weeding', 'harvesting', 'spraying']
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Set your own % for everything',
    cropShare: 0,
    expenses: { all: 0 },
    work: []
  }
];

const WORK_OPTIONS = [
  { id: 'irrigation', label: 'Sinchai (Irrigation)', icon: 'Droplet' },
  { id: 'labour', label: 'Labour / Majdoori', icon: 'User' },
  { id: 'sowing', label: 'Beej bona (Sowing)', icon: 'Sprout' },
  { id: 'spraying', label: 'Dawayi chhidakna (Spraying)', icon: 'ShieldAlert' },
  { id: 'weeding', label: 'Nirai (Weeding)', icon: 'Scissors' },
  { id: 'harvesting', label: 'Katai (Harvesting)', icon: 'Scissors' },
  { id: 'threshing', label: 'Threshing', icon: 'Hammer' },
  { id: 'transport', label: 'Mandi transport', icon: 'Truck' },
  { id: 'watchman', label: 'Watchman / Chowkidari', icon: 'Eye' },
  { id: 'machinery', label: 'Tractor work', icon: 'Navigation' }
];

export default function PartnershipTermsBuilderPage() {
  const { t } = useTranslation();
  const { farmId, partnerId } = useParams();
  const navigate = useNavigate();

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm } = useFarmStore();
  const { 
    partners, 
    templates, 
    fetchPartnersByFarm, 
    createPartner, 
    editPartner, 
    fetchTemplates, 
    createTemplate 
  } = usePartnerStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [season, setSeason] = useState('kharif');
  const [startDate, setStartDate] = useState(toLocalDateString());
  const [systemType, setSystemType] = useState('batai');
  
  const [cropSharePercent, setCropSharePercent] = useState(50);
  const [cropShareBasis, setCropShareBasis] = useState('yield_kg'); // 'yield_kg' | 'sale_amount' | 'market_price'
  const [paymentTiming, setPaymentTiming] = useState('after_harvest'); // 'after_harvest' | 'monthly' | 'season_end' | 'custom'

  const [expenseSharing, setExpenseSharing] = useState({
    khad_fertilizer: 50,
    keetnashak_pesticide: 50,
    beej_seeds: 50,
    bijli_electricity: 50,
    sinchai_irrigation: 50,
    majdoori_labour: 50,
    tractor_machinery: 50,
    diesel_fuel: 50,
    transport: 50,
    mandi_charges: 50,
    packaging: 50,
    other: 50
  });

  const [partnerResponsibilities, setPartnerResponsibilities] = useState([]);
  const [customNotes, setCustomNotes] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Load farm info & partner if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!selectedFarm) {
          const farm = await getFarmById(farmId);
          if (farm) setSelectedFarm(farm);
        }
        await fetchPartnersByFarm(farmId);
        if (profile?.uid) {
          await fetchTemplates(profile.uid);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (farmId) loadData();
  }, [farmId, selectedFarm, setSelectedFarm, fetchPartnersByFarm, fetchTemplates, profile]);

  // Populate form if editing existing partner
  useEffect(() => {
    if (partnerId && partners.length > 0) {
      const editTarget = partners.find(p => p.id === partnerId);
      if (editTarget) {
        setPartnerName(editTarget.name || '');
        setPartnerPhone(editTarget.phone?.replace('+91', '') || '');
        setSeason(editTarget.season || 'kharif');
        if (editTarget.startDate) {
          const sDate = editTarget.startDate.seconds 
            ? new Date(editTarget.startDate.seconds * 1000) 
            : new Date(editTarget.startDate);
          setStartDate(toLocalDateString(sDate));
        }
        if (editTarget.terms) {
          const t = editTarget.terms;
          setSystemType(t.systemType || 'custom');
          setCropSharePercent(t.cropSharePercent || 0);
          setCropShareBasis(t.cropShareBasis || 'yield_kg');
          setPaymentTiming(t.paymentTiming || 'after_harvest');
          if (t.expenseSharing) {
            setExpenseSharing({
              khad_fertilizer: t.expenseSharing.khad_fertilizer !== undefined ? t.expenseSharing.khad_fertilizer : 0,
              keetnashak_pesticide: t.expenseSharing.keetnashak_pesticide !== undefined ? t.expenseSharing.keetnashak_pesticide : 0,
              beej_seeds: t.expenseSharing.beej_seeds !== undefined ? t.expenseSharing.beej_seeds : 0,
              bijli_electricity: t.expenseSharing.bijli_electricity !== undefined ? t.expenseSharing.bijli_electricity : 0,
              sinchai_irrigation: t.expenseSharing.sinchai_irrigation !== undefined ? t.expenseSharing.sinchai_irrigation : 0,
              majdoori_labour: t.expenseSharing.majdoori_labour !== undefined ? t.expenseSharing.majdoori_labour : 0,
              tractor_machinery: t.expenseSharing.tractor_machinery !== undefined ? t.expenseSharing.tractor_machinery : 0,
              diesel_fuel: t.expenseSharing.diesel_fuel !== undefined ? t.expenseSharing.diesel_fuel : 0,
              transport: t.expenseSharing.transport !== undefined ? t.expenseSharing.transport : 0,
              mandi_charges: t.expenseSharing.mandi_charges !== undefined ? t.expenseSharing.mandi_charges : 0,
              packaging: t.expenseSharing.packaging !== undefined ? t.expenseSharing.packaging : 0,
              other: t.expenseSharing.other !== undefined ? t.expenseSharing.other : 0
            });
          }
          setPartnerResponsibilities(t.partnerResponsibilities || []);
          setCustomNotes(t.customNotes || '');
        }
      }
    }
  }, [partnerId, partners]);

  // Preset Auto-fill
  const handleSelectPreset = (preset) => {
    setSystemType(preset.id);
    setCropSharePercent(preset.cropShare);
    
    // Fill expenses
    const updatedExpenses = { ...expenseSharing };
    Object.keys(updatedExpenses).forEach(key => {
      if (preset.expenses.all !== undefined) {
        updatedExpenses[key] = preset.expenses.all;
      } else if (preset.expenses[key] !== undefined) {
        updatedExpenses[key] = preset.expenses[key];
      } else {
        updatedExpenses[key] = preset.expenses.default !== undefined ? preset.expenses.default : 0;
      }
    });
    setExpenseSharing(updatedExpenses);
    
    // Fill responsibilities
    setPartnerResponsibilities(preset.work);
  };

  // Custom User Template Applied
  const handleApplyUserTemplate = (tmpl) => {
    if (tmpl.terms) {
      const t = tmpl.terms;
      setSystemType(t.systemType || 'custom');
      setCropSharePercent(t.cropSharePercent || 0);
      setCropShareBasis(t.cropShareBasis || 'yield_kg');
      setPaymentTiming(t.paymentTiming || 'after_harvest');
      if (t.expenseSharing) {
        setExpenseSharing({ ...t.expenseSharing });
      }
      setPartnerResponsibilities(t.partnerResponsibilities || []);
      setCustomNotes(t.customNotes || '');
    }
  };

  const handleExpensePctChange = (category, value) => {
    const parsed = Math.min(100, Math.max(0, parseInt(value) || 0));
    setExpenseSharing(prev => ({
      ...prev,
      [category]: parsed
    }));
  };

  const handleToggleResponsibility = (id) => {
    if (partnerResponsibilities.includes(id)) {
      setPartnerResponsibilities(prev => prev.filter(x => x !== id));
    } else {
      setPartnerResponsibilities(prev => [...prev, id]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!partnerName.trim()) {
        setError('Please enter partner name');
        return;
      }
      if (!partnerPhone.trim() || partnerPhone.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
      setError('');
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    const formattedPhone = partnerPhone.startsWith('+91') ? partnerPhone : `+91${partnerPhone}`;
    const terms = {
      templateName: saveAsTemplate ? templateName : (SYSTEM_PRESETS.find(p => p.id === systemType)?.name || 'Custom'),
      systemType,
      cropSharePercent: parseFloat(cropSharePercent) || 0,
      cropShareBasis,
      paymentTiming,
      expenseSharing,
      partnerResponsibilities,
      customNotes
    };

    const partnerData = {
      farmId,
      ownerId: profile.uid,
      name: partnerName,
      phone: formattedPhone,
      season,
      startDate: parseLocalDateString(startDate),
      status: 'active',
      terms
    };

    try {
      if (saveAsTemplate && templateName.trim()) {
        await createTemplate(profile.uid, {
          templateName,
          terms
        });
      }

      if (partnerId) {
        await editPartner(partnerId, partnerData);
        // Also update the farm plot's internal partners array to maintain consistency
        if (selectedFarm) {
          const updatedPartners = [...(selectedFarm.partners || [])];
          const existIdx = updatedPartners.findIndex(p => p.partnerId === partnerId || p.phone === formattedPhone);
          const pObj = {
            partnerId: partnerId,
            name: partnerName,
            phone: formattedPhone,
            sharePercent: parseFloat(cropSharePercent) || 0,
            totalOwed: existIdx > -1 ? (updatedPartners[existIdx].totalOwed || 0) : 0,
            totalPaid: existIdx > -1 ? (updatedPartners[existIdx].totalPaid || 0) : 0
          };
          if (existIdx > -1) {
            updatedPartners[existIdx] = pObj;
          } else {
            updatedPartners.push(pObj);
          }
          await updateFarm(farmId, { partners: updatedPartners });
        }
      } else {
        // Create new partner
        const newPartnerId = await createPartner(partnerData);
        
        // Also update the farm plot's internal partners array to maintain consistency
        const updatedPartners = [...(selectedFarm.partners || [])];
        const existIdx = updatedPartners.findIndex(p => p.phone === formattedPhone);
        const pObj = {
          partnerId: newPartnerId,
          name: partnerName,
          phone: formattedPhone,
          sharePercent: parseFloat(cropSharePercent) || 0,
          totalOwed: 0,
          totalPaid: 0
        };
        if (existIdx > -1) {
          updatedPartners[existIdx] = pObj;
        } else {
          updatedPartners.push(pObj);
        }
        await updateFarm(farmId, { partners: updatedPartners });
      }

      navigate(`/farms/${farmId}`);
    } catch (err) {
      setError(err.message || 'Failed to save partnership details');
    } finally {
      setLoading(false);
    }
  };

  const currentPreset = SYSTEM_PRESETS.find(p => p.id === systemType);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/farms/${farmId}`)}
          className="p-2 bg-white hover:bg-stone-50 border border-stone-200/50 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {partnerId ? 'Partnership ke niyam badlo' : 'Partnership ki shart banao'}
          </h1>
          <p className="text-xs text-stone-400 font-medium">
            Define crop sharing yields, category split costs, and responsibilities.
          </p>
        </div>
      </div>

      {/* Progress Wizard */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        {[
          { step: 1, label: 'Basic Info' },
          { step: 2, label: 'Crop Share' },
          { step: 3, label: 'Expenses' },
          { step: 4, label: 'Work duties' },
          { step: 5, label: 'Agreement' }
        ].map((s, idx) => (
          <React.Fragment key={s.step}>
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                step === s.step 
                  ? 'bg-primary text-white scale-110 shadow-sm ring-4 ring-primary-light/40' 
                  : step > s.step 
                    ? 'bg-primary-light text-primary' 
                    : 'bg-stone-100 text-stone-400'
              }`}>
                {step > s.step ? <Check className="w-4 h-4" /> : s.step}
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${
                step === s.step ? 'text-stone-850' : 'text-stone-400'
              }`}>
                {s.label}
              </span>
            </div>
            {idx < 4 && <div className={`flex-1 h-0.5 mx-2 bg-stone-100 rounded transition-all duration-300 ${step > s.step ? 'bg-primary/50' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-xs font-semibold text-red-650 rounded-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
          {error}
        </div>
      )}

      {/* ━━━ STEP 1: BASIC INFO & TEMPLATES ━━━ */}
      {step === 1 && (
        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
            Step 1: Partner Details & Partnership Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Partner Name *
              </label>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Bhavesh Patel"
                className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Phone Number (+91) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-stone-400 text-sm font-bold">+91</span>
                <input
                  type="tel"
                  required
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Crop Season
              </label>
              <div className="flex bg-stone-100 p-1 rounded-xl">
                {['kharif', 'rabi', 'zaid', 'year-round'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeason(s)}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition capitalize ${
                      season === s 
                        ? 'bg-white text-primary shadow' 
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* User templates if any */}
          {templates.length > 0 && (
            <div className="space-y-3 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Apne bachaye hue templates (Saved Custom Templates)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyUserTemplate(tmpl)}
                    className="p-3 bg-primary-light/10 border border-primary/20 hover:bg-primary-light/20 rounded-xl text-left transition flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-primary">{tmpl.templateName}</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">Crop Share: {tmpl.terms?.cropSharePercent}%</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Standard system presets */}
          <div className="space-y-3 border-t border-stone-100 pt-6">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Quick-Select System Presets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {SYSTEM_PRESETS.map((p) => {
                const isSelected = systemType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-4 border rounded-2xl text-left transition duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary-light/25 ring-2 ring-primary-light/40 shadow-sm' 
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <h4 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-stone-300'}`}></span>
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-semibold mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ━━━ STEP 2: CROP SHARE ━━━ */}
      {step === 2 && (
        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
            Step 2: Fasal Ka Hissa (Crop Share Terms)
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Partner's crop share percent
              </label>
              <span className="text-2xl font-extrabold text-primary">{cropSharePercent}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="75"
              step="1"
              value={cropSharePercent}
              onChange={(e) => setCropSharePercent(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] font-bold text-stone-400 px-1">
              <span>0% (No harvest share)</span>
              <span>25%</span>
              <span>50% (Batai standard)</span>
              <span>75% (Maximum)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-stone-100 pt-6">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Basis of crop division
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'yield_kg', label: 'Yield in KG', desc: 'Crop weight', icon: 'Scale' },
                  { id: 'sale_amount', label: 'Sale Amount', desc: 'Mandi Cash (₹)', icon: 'DollarSign' },
                  { id: 'market_price', label: 'Mandi Rate', desc: 'Market Valuation', icon: 'TrendingUp' }
                ].map((b) => {
                  const LucideIcon = Icons[b.icon] || Icons.TrendingUp;
                  const isSelected = cropShareBasis === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setCropShareBasis(b.id)}
                      className={`p-3 border rounded-xl text-center transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' 
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <LucideIcon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold block">{b.label}</span>
                      <span className="text-[8px] text-stone-400 font-semibold">{b.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Payment / Crop Delivery Timing
              </label>
              <select
                value={paymentTiming}
                onChange={(e) => setPaymentTiming(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:outline-none bg-white cursor-pointer"
              >
                <option value="after_harvest">Immediately after harvest (Fasal katte hi)</option>
                <option value="season_end">End of crop season (Season ke ant me)</option>
                <option value="monthly">Monthly Settlement (Har mahine)</option>
                <option value="custom">Custom schedule / agreement</option>
              </select>
            </div>
          </div>

          {/* Dynamic Example Preview */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-5 shadow-inner">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Example Illustration (Assuming 50 Quintals total crop)
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-4 bg-white border border-stone-150 rounded-xl shadow-sm">
                <span className="text-stone-400 uppercase text-[9px] block">Owner gets</span>
                <span className="text-lg font-extrabold text-stone-850 mt-1 block">
                  {Math.round(50 * (100 - cropSharePercent) / 100)} quintals
                </span>
                <span className="text-[10px] text-stone-400 font-medium">({100 - cropSharePercent}%)</span>
              </div>
              <div className="p-4 bg-white border border-stone-150 rounded-xl shadow-sm">
                <span className="text-stone-400 uppercase text-[9px] block">Partner gets</span>
                <span className="text-lg font-extrabold text-primary mt-1 block">
                  {Math.round(50 * cropSharePercent / 100)} quintals
                </span>
                <span className="text-[10px] text-stone-400 font-medium">({cropSharePercent}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ STEP 3: EXPENSE SHARING ━━━ */}
      {step === 3 && (
        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <h2 className="text-base font-extrabold text-stone-900">
              Step 3: Kharche Ki Zimmedari (Expense Split)
            </h2>
            <span className="bg-stone-100 text-stone-600 text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase">
              Preset: {currentPreset?.name || 'Custom'}
            </span>
          </div>

          <p className="text-xs text-stone-400 font-medium">
            Define what percentage (%) of costs the partner bears for each farming category. The owner covers the remaining share.
          </p>

          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
            {EXPENSE_CATEGORIES.map((cat) => {
              const termKey = cat.id;
              // Map categories to terms key if not matching directly
              const mapping = {
                fertilizer: 'khad_fertilizer',
                pesticide: 'keetnashak_pesticide',
                seeds: 'beej_seeds',
                electricity: 'bijli_electricity',
                irrigation: 'sinchai_irrigation',
                labour: 'majdoori_labour',
                machinery: 'tractor_machinery',
                diesel: 'diesel_fuel',
                transport: 'transport',
                market: 'mandi_charges',
                packaging: 'packaging',
                other: 'other',
                loan_interest: 'other',
                equipment_repair: 'other',
                crop_insurance: 'other'
              };
              const storeKey = mapping[termKey] || 'other';
              const partnerPct = expenseSharing[storeKey] !== undefined ? expenseSharing[storeKey] : 0;
              const ownerPct = 100 - partnerPct;
              const LucideIcon = Icons[cat.lucide] || Icons.HelpCircle;

              return (
                <div key={cat.id} className="p-4 bg-stone-50 border border-stone-150 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600">
                        <LucideIcon className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-stone-800">{t(cat.nameKey)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 font-bold">Partner:</span>
                      <div className="relative w-16">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={partnerPct}
                          onChange={(e) => handleExpensePctChange(storeKey, e.target.value)}
                          className="w-full text-center px-2 py-1 text-xs border border-stone-200 bg-white rounded-lg focus:outline-none font-bold"
                        />
                        <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-stone-400">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Split Visualizer */}
                  <div className="relative w-full h-3 bg-stone-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-ownExpense h-full transition-all duration-300"
                      style={{ width: `${ownerPct}%` }}
                    />
                    <div 
                      className="bg-partnerExpense h-full transition-all duration-300"
                      style={{ width: `${partnerPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-ownExpense">Owner: {ownerPct}%</span>
                    <span className="text-partnerExpense">Partner: {partnerPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Example Preview */}
          <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-5 shadow-inner space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Agar Total Kharcha ₹50,000 ho to calculations:
            </h4>
            
            {/* Compute weighted totals for visual preview */}
            {(() => {
              let weightedPartner = 0;
              const mapping = {
                fertilizer: 'khad_fertilizer',
                pesticide: 'keetnashak_pesticide',
                seeds: 'beej_seeds',
                electricity: 'bijli_electricity',
                irrigation: 'sinchai_irrigation',
                labour: 'majdoori_labour',
                machinery: 'tractor_machinery',
                diesel: 'diesel_fuel',
                transport: 'transport',
                market: 'mandi_charges',
                packaging: 'packaging',
                other: 'other',
                loan_interest: 'other',
                equipment_repair: 'other',
                crop_insurance: 'other'
              };
              EXPENSE_CATEGORIES.forEach((cat) => {
                const storeKey = mapping[cat.id] || 'other';
                const partnerPct = expenseSharing[storeKey] !== undefined ? expenseSharing[storeKey] : 0;
                weightedPartner += partnerPct;
              });
              const averagePartnerShare = weightedPartner / EXPENSE_CATEGORIES.length;
              const partnerShareVal = Math.round((50000 * averagePartnerShare) / 100);
              const ownerShareVal = 50000 - partnerShareVal;

              return (
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-4 bg-white border border-stone-150 rounded-xl shadow-sm text-center">
                    <span className="text-stone-400 uppercase text-[9px] block">Owner bears</span>
                    <span className="text-base font-extrabold text-ownExpense mt-1 block">
                      ₹{ownerShareVal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">({Math.round(100 - averagePartnerShare)}% avg)</span>
                  </div>
                  <div className="p-4 bg-white border border-stone-150 rounded-xl shadow-sm text-center">
                    <span className="text-stone-400 uppercase text-[9px] block">Partner bears</span>
                    <span className="text-base font-extrabold text-partnerExpense mt-1 block">
                      ₹{partnerShareVal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">({Math.round(averagePartnerShare)}% avg)</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ━━━ STEP 4: PARTNER'S WORK & DUTIES ━━━ */}
      {step === 4 && (
        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
            Step 4: Partner Ka Kaam (Work Duties)
          </h2>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
              Which tasks are partner's responsibilities?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WORK_OPTIONS.map((item) => {
                const IconComponent = Icons[item.icon] || Icons.CheckSquare;
                const isChecked = partnerResponsibilities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleResponsibility(item.id)}
                    className={`p-3 border rounded-xl text-left transition flex items-center gap-3 cursor-pointer ${
                      isChecked 
                        ? 'border-primary bg-primary-light/10 text-primary-dark shadow-sm' 
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg ${isChecked ? 'bg-primary text-white' : 'bg-stone-100 text-stone-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-stone-100 pt-6">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
              Custom Notes (Extra terms in farmer's words)
            </label>
            <textarea
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Bhavesh will arrange his own tractor for sowing. Irrigation pump electricity bills will be paid by owner only."
              className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm resize-none"
            />
          </div>
        </div>
      )}

      {/* ━━━ STEP 5: FINAL SUMMARY & CONFIRM ━━━ */}
      {step === 5 && (
        <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
            Final Step: Verify Agreement details
          </h2>

          {/* Contract Agreement Preview Card */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-md bg-stone-50 font-mono text-xs max-w-lg mx-auto">
            <div className="bg-stone-800 text-white p-4 text-center">
              <h3 className="font-bold text-sm tracking-widest uppercase">PARTNERSHIP AGREEMENT</h3>
              <p className="text-[10px] text-stone-400 mt-1">Khet Kharcha Ledger System</p>
            </div>
            
            <div className="p-5 space-y-4 text-stone-850">
              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3">
                <p><strong>Farm Plot :</strong> {selectedFarm?.name || 'N/A'}</p>
                <p><strong>Partner   :</strong> {partnerName} · +91 {partnerPhone}</p>
                <p><strong>Season    :</strong> {season.toUpperCase()}</p>
                <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
                <p><strong>System    :</strong> {SYSTEM_PRESETS.find(p => p.id === systemType)?.name || 'Custom'}</p>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3">
                <p className="text-primary font-bold uppercase text-[10px] tracking-wider mb-1">CROP SHARE DETAILS</p>
                <p><strong>Share %   :</strong> {cropSharePercent}% of total yield</p>
                <p><strong>Basis     :</strong> {cropShareBasis.toUpperCase()}</p>
                <p><strong>Timing    :</strong> {paymentTiming.toUpperCase().replace('_', ' ')}</p>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3">
                <p className="text-ownExpense font-bold uppercase text-[10px] tracking-wider mb-1">EXPENSE SPLITS (Partner Share)</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {Object.entries(expenseSharing).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.split('_')[1] || key}:</span>
                      <span>{val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-emerald-700 font-bold uppercase text-[10px] tracking-wider mb-1">WORK ASSIGNMENTS</p>
                <p className="leading-relaxed">
                  {partnerResponsibilities.length > 0 
                    ? partnerResponsibilities.map(r => WORK_OPTIONS.find(w => w.id === r)?.label?.split(' ')[0]).join(', ') 
                    : 'No specific work tasks selected.'}
                </p>
              </div>

              {customNotes.trim() && (
                <div className="border-t border-dashed border-stone-300 pt-3">
                  <p className="text-stone-400 font-bold text-[9px] uppercase">CUSTOM TERMS</p>
                  <p className="italic mt-1 leading-relaxed">"{customNotes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Template saving inputs */}
          <div className="p-5 border border-stone-150 rounded-2xl space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-stone-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-xs font-bold text-stone-700 select-none">
                Save as template for future reuse (Is agreement ko save karein)
              </span>
            </label>

            {saveAsTemplate && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Bhagidari 50-50 Cotton"
                  className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Navigation Buttons */}
      <div className="flex gap-4 bg-white border border-stone-200/50 p-4 rounded-2xl shadow-sm justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-6 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition cursor-pointer text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(`/farms/${farmId}`)}
            className="px-6 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition cursor-pointer text-sm"
          >
            Cancel
          </button>
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow transition cursor-pointer text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (saveAsTemplate && !templateName.trim())}
            className="flex items-center gap-1.5 px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save & Activate Partnership'}
          </button>
        )}
      </div>

    </div>
  );
}
