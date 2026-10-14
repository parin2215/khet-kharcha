import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Layers, 
  Thermometer, 
  Droplets, 
  Sun, 
  Scale, 
  Coins, 
  Sprout, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Plus,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Beaker,
  FileText
} from 'lucide-react';
import { 
  CROP_CATEGORIES, 
  getLibraryCrops, 
  saveLibraryCrops 
} from '../../data/cropLibraryData.js';
import SeasonBadge from '../../components/SeasonBadge.jsx';
import Toast from '../../components/Toast.jsx';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Crops list from local storage (initialized empty as pre-loaded crops are removed)
  const [crops, setCrops] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');

  // Modals state
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  // Form states - Add New Crop to Library
  const [name, setName] = useState('');
  const [localName, setLocalName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('cash_crops');
  const [season, setSeason] = useState('kharif');
  const [bestMonths, setBestMonths] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [soilType, setSoilType] = useState('');
  const [soilPh, setSoilPh] = useState('');
  const [tempOptimal, setTempOptimal] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [overview, setOverview] = useState('');

  // Load crops on mount
  useEffect(() => {
    const loaded = getLibraryCrops();
    setCrops(loaded);
  }, []);

  // Filter crops
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      if (selectedCategory !== 'all' && crop.category !== selectedCategory) return false;
      if (selectedSeason !== 'all' && crop.season !== selectedSeason) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = crop.name?.toLowerCase().includes(q);
        const matchLocal = crop.localName?.toLowerCase().includes(q);
        const matchSci = crop.scientificName?.toLowerCase().includes(q);
        const matchSoil = crop.soilRequirement?.soilType?.toLowerCase().includes(q);
        if (!matchName && !matchLocal && !matchSci && !matchSoil) return false;
      }
      return true;
    });
  }, [crops, searchQuery, selectedCategory, selectedSeason]);

  // Open add modal
  const handleOpenAdd = () => {
    setName('');
    setLocalName('');
    setScientificName('');
    setCategory('cash_crops');
    setSeason('kharif');
    setBestMonths('');
    setDurationDays('');
    setSoilType('');
    setSoilPh('6.0 - 7.5');
    setTempOptimal('20°C - 32°C');
    setRainfall('Medium (500 - 800 mm)');
    setExpectedYield('');
    setOverview('');
    setIsAddCropModalOpen(true);
  };

  // Submit new crop
  const handleCreateCropSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToastMsg('Please enter a crop name');
      setToastType('error');
      return;
    }

    const newCrop = {
      id: `lib_crop_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      localName: localName.trim() || name.trim(),
      scientificName: scientificName.trim() || 'Custom variety',
      category,
      season,
      bestPracticingMonths: bestMonths.trim() || 'Season dependent',
      durationDays: durationDays.trim() || '90 - 120 Days',
      soilRequirement: {
        soilType: soilType.trim() || 'Loamy / Black fertile soil',
        optimalPh: soilPh.trim() || '6.0 - 7.5',
        drainage: 'Good drainage required'
      },
      environmentalRequirements: {
        optimalTemp: tempOptimal.trim() || '20°C - 30°C',
        rainfall: rainfall.trim() || 'Normal',
        sunlight: 'Full Sun (6-8 hours)'
      },
      yieldInfo: {
        expectedAverage: expectedYield.trim() || 'Normal harvest yield',
        yieldUnit: 'mann'
      },
      overview: overview.trim() || `Agronomic package of practices for ${name.trim()}.`,
      timeline: [
        {
          step: 1,
          phase: 'Land Preparation (ખેડ & જમીન તૈયારી)',
          timelineWindow: '15-20 days before sowing',
          keyPractices: [
            'Deep summer ploughing to expose soil pests and weed roots.',
            'Apply well-decomposed FYM (Farm Yard Manure) or Compost.',
            'Level land and prepare ridges or flat beds according to irrigation method.'
          ]
        },
        {
          step: 2,
          phase: 'Sowing & Seed Treatment (વાવણી અને બીજ માવજત)',
          timelineWindow: 'Day 0 to 5',
          keyPractices: [
            'Select certified high-germination seed varieties.',
            'Seed treatment with fungicide and bio-fertilizers (Trichoderma / Rhizobium).',
            'Maintain optimal row-to-row and plant-to-plant spacing.'
          ]
        },
        {
          step: 3,
          phase: 'Fertilizer & Irrigation (ખાતર અને પિયત વ્યવસ્થા)',
          timelineWindow: 'Day 15 to 60',
          keyPractices: [
            'Apply balanced NPK according to soil test recommendations.',
            'Schedule timely irrigations at critical growth stages.',
            'Ensure proper weed control and intercultural operations.'
          ]
        },
        {
          step: 4,
          phase: 'Pest & Disease Management (રોગ-જીવાત નિયંત્રણ)',
          timelineWindow: 'Day 30 to 80',
          keyPractices: [
            'Regular field scouting for early pest symptoms.',
            'Install yellow sticky traps and pheromone traps.',
            'Apply recommended biological or approved chemical sprays when thresholds are reached.'
          ]
        },
        {
          step: 5,
          phase: 'Harvesting & Post-Harvest (કાપણી અને લણણી)',
          timelineWindow: 'Maturity stage',
          keyPractices: [
            'Harvest produce at proper physiological maturity during clear dry weather.',
            'Threshing, cleaning, and proper moisture reduction before mandi sale or storage.'
          ]
        }
      ]
    };

    const updated = [newCrop, ...crops];
    setCrops(updated);
    saveLibraryCrops(updated);

    setToastMsg(`Added ${newCrop.name} to your Crop Library!`);
    setToastType('success');
    setIsAddCropModalOpen(false);
  };

  // Delete a crop from library
  const handleDeleteCrop = (cropId, e) => {
    e.stopPropagation();
    const updated = crops.filter(c => c.id !== cropId);
    setCrops(updated);
    saveLibraryCrops(updated);
    if (selectedCrop?.id === cropId) setSelectedCrop(null);
    setToastMsg('Crop removed from library');
    setToastType('success');
  };

  // Start in Current State
  const handleStartInCurrentState = (crop) => {
    setSelectedCrop(null);
    navigate(`/current-state?action=new_crop&cropName=${encodeURIComponent(crop.name)}&season=${crop.season}&targetYield=25`);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              પાક માર્ગદર્શિકા (Agronomic Knowledge Base)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Crop Cultivation Library
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Your customized library of crop cultivation guidelines. Document optimal soil requirements, environment conditions, best practicing months, and step-by-step timelines for your farms.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-extrabold px-5 py-3 rounded-2xl shadow-lg transition duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            + Add Crop to Library
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Only shown if crops exist or searching) */}
      <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, Gujarati name, soil type..."
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-stone-500">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="text-xs font-semibold bg-stone-100 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">All Seasons</option>
                <option value="kharif">Kharif (Monsoon)</option>
                <option value="rabi">Rabi (Winter)</option>
                <option value="zaid">Zaid (Summer)</option>
                <option value="year-round">Year-round</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {CROP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Crops Cards Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <SeasonBadge seasonId={crop.season} />
                      <span className="text-[11px] font-bold text-stone-400 capitalize">
                        {crop.category?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-emerald-700 transition">
                      {crop.name}
                    </h3>
                    <p className="text-xs font-semibold text-stone-500">
                      {crop.localName} {crop.scientificName && <span className="italic text-stone-400">({crop.scientificName})</span>}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteCrop(crop.id, e)}
                    className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    title="Remove from Library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Attributes */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Best Months
                    </span>
                    <span className="font-extrabold text-stone-800 text-[11px] block mt-0.5 truncate">
                      {crop.bestPracticingMonths}
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Cycle Duration
                    </span>
                    <span className="font-extrabold text-stone-800 text-[11px] block mt-0.5 truncate">
                      {crop.durationDays}
                    </span>
                  </div>
                </div>

                {/* Soil Spec */}
                <div className="mt-3 p-2.5 bg-stone-50/70 border border-stone-100 rounded-xl flex items-center gap-2 text-xs text-stone-600">
                  <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate font-medium">{crop.soilRequirement?.soilType}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  View Timeline & Practices <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold text-stone-400">
                  {crop.timeline?.length || 5} Steps
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-stone-200/70 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-stone-900 font-serif">તમારી લાઇબ્રેરી ખાલી છે</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
            તમામ પ્રી-લોડેડ પાક દૂર કરવામાં આવ્યા છે. તમે તમારા ખેતર માટે યોગ્ય પાકની માર્ગદર્શિકા અને પદ્ધતિઓ અહીં ઉમેરી શકો છો.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add First Crop to Library
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW CROP TO LIBRARY                         */}
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
                  <h3 className="text-lg font-extrabold text-stone-900 font-serif">Add Crop to Library</h3>
                  <p className="text-xs text-stone-400">Save custom agronomic practices & timeline</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Crop Name (English) *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cotton, Wheat, Cumin"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Gujarati / Local Name</label>
                  <input
                    type="text"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="e.g. કપાસ, ઘઉં, જીરું"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="cash_crops">Cash Crops (રોકડિયા પાક)</option>
                    <option value="cereals">Cereals & Grains (અનાજ)</option>
                    <option value="pulses">Pulses (કઠોળ)</option>
                    <option value="oilseeds">Oilseeds (તેલીબિયાં)</option>
                    <option value="commercial">Commercial & Spices (મસાલા)</option>
                    <option value="vegetables">Vegetables (શાકભાજી)</option>
                    <option value="other">Other (અન્ય)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="kharif">Kharif (Monsoon / ચોમાસુ)</option>
                    <option value="rabi">Rabi (Winter / શિયાળુ)</option>
                    <option value="zaid">Zaid (Summer / ઉનાળુ)</option>
                    <option value="year-round">Year-round (બારમાસી)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Best Sowing Months</label>
                  <input
                    type="text"
                    value={bestMonths}
                    onChange={(e) => setBestMonths(e.target.value)}
                    placeholder="e.g. June - July or Oct - Nov"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Crop Duration (Days)</label>
                  <input
                    type="text"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="e.g. 120 - 150 Days"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Optimal Soil Type</label>
                <input
                  type="text"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  placeholder="e.g. Deep black cotton soil, Sandy loam"
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Optimal Temperature</label>
                  <input
                    type="text"
                    value={tempOptimal}
                    onChange={(e) => setTempOptimal(e.target.value)}
                    placeholder="e.g. 21°C - 30°C"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Expected Yield</label>
                  <input
                    type="text"
                    value={expectedYield}
                    onChange={(e) => setExpectedYield(e.target.value)}
                    placeholder="e.g. 35 - 45 મણ / વીઘા"
                    className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Overview & Cultivation Notes</label>
                <textarea
                  rows="2"
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Key agronomic notes, irrigation requirements, fertilizer dose..."
                  className="w-full text-xs font-semibold border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
                />
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
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FULL CROP DETAIL & STEP-BY-STEP PRACTICES       */}
      {/* ======================================================== */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 p-6 md:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <SeasonBadge seasonId={selectedCrop.season} />
                  <span className="text-xs font-bold text-stone-400 capitalize">
                    {selectedCrop.category?.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900 font-serif">
                  {selectedCrop.name}
                  <span className="text-emerald-700 ml-2 font-sans font-bold">({selectedCrop.localName})</span>
                </h2>
                {selectedCrop.scientificName && (
                  <p className="text-xs italic text-stone-400">{selectedCrop.scientificName}</p>
                )}
              </div>
              <button 
                onClick={() => setSelectedCrop(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview */}
            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
              {selectedCrop.overview}
            </p>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Soil Type</span>
                <span className="text-xs font-extrabold text-stone-800 mt-1 block truncate">
                  {selectedCrop.soilRequirement?.soilType}
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Optimal Temp</span>
                <span className="text-xs font-extrabold text-stone-800 mt-1 block truncate">
                  {selectedCrop.environmentalRequirements?.optimalTemp}
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Sowing Months</span>
                <span className="text-xs font-extrabold text-stone-800 mt-1 block truncate">
                  {selectedCrop.bestPracticingMonths}
                </span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Duration</span>
                <span className="text-xs font-extrabold text-stone-800 mt-1 block truncate">
                  {selectedCrop.durationDays}
                </span>
              </div>
            </div>

            {/* Step-by-Step Cultivation Timeline */}
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Step-by-Step Timeline & Practices
              </h3>

              <div className="space-y-4">
                {(selectedCrop.timeline || []).map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border border-stone-200/60 rounded-2xl bg-stone-50/50">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {step.step || idx + 1}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-stone-900">{step.phase}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start sm:self-auto">
                          {step.timelineWindow}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-stone-600 space-y-1 pl-1">
                        {(step.keyPractices || []).map((practice, pIdx) => (
                          <li key={pIdx}>{practice}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setSelectedCrop(null)}
                className="flex-1 py-3 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close Guide
              </button>
              <button
                onClick={() => handleStartInCurrentState(selectedCrop)}
                className="flex-1 py-3 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <Sprout className="w-4 h-4" />
                Start Cultivation in Current State
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
