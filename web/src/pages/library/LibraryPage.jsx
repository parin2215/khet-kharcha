import React, { useState, useMemo } from 'react';
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
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Beaker
} from 'lucide-react';
import { CROP_LIBRARY, CROP_CATEGORIES } from '../../data/cropLibraryData.js';
import SeasonBadge from '../../components/SeasonBadge.jsx';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');

  // Modal / Drawer state for detailed crop guide
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Filter crops
  const filteredCrops = useMemo(() => {
    return CROP_LIBRARY.filter(crop => {
      if (selectedCategory !== 'all' && crop.category !== selectedCategory) return false;
      if (selectedSeason !== 'all' && crop.season !== selectedSeason) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = crop.name.toLowerCase().includes(q);
        const matchLocal = crop.localName.toLowerCase().includes(q);
        const matchSci = crop.scientificName.toLowerCase().includes(q);
        const matchSoil = crop.soilRequirement.soilType.toLowerCase().includes(q);
        if (!matchName && !matchLocal && !matchSci && !matchSoil) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedSeason]);

  // Handle action to start this crop in Current State
  const handleStartInCurrentState = (crop) => {
    setSelectedCrop(null);
    navigate(`/current-state?action=new_crop&cropName=${encodeURIComponent(crop.name)}&season=${crop.season}&targetYield=15`);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">Agronomic Knowledge Base</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Crop Cultivation Library</h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Scientifically verified packages of practices (ICAR standards). Explore optimal soil types, environmental requirements, best practicing months, and step-by-step timelines for Indian crops.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-3 bg-stone-800/80 border border-stone-700/80 rounded-2xl text-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Crops Documented</span>
            <span className="text-xl font-extrabold text-emerald-400">{CROP_LIBRARY.length} Crops</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/70 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, scientific name, soil type..."
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-stone-500 shrink-0">Season:</span>
            {['all', 'kharif', 'rabi', 'zaid'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize shrink-0 cursor-pointer ${
                  selectedSeason === s 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s === 'all' ? 'All Seasons' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
          {CROP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === cat.id 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-stone-50 border border-stone-200/60 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Cards Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              className="bg-white border border-stone-200/70 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg inline-block mb-1.5">
                      {crop.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-xl font-extrabold text-stone-900 group-hover:text-emerald-700 transition">
                      {crop.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold">{crop.localName}</p>
                    <p className="text-[11px] text-stone-400 italic font-serif">{crop.scientificName}</p>
                  </div>

                  <SeasonBadge seasonId={crop.season} />
                </div>

                {/* Best Practicing Window */}
                <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Best Sowing Window:</span>
                  </div>
                  <p className="text-xs text-stone-800 font-medium pl-5 leading-snug">
                    {crop.bestPracticingMonths.sowing}
                  </p>
                </div>

                {/* Core Parameters HUD */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-stone-50/70 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">Duration</span>
                    <p className="font-extrabold text-stone-800">{crop.durationDays}</p>
                  </div>
                  <div className="p-2.5 bg-stone-50/70 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">Soil pH Range</span>
                    <p className="font-extrabold text-stone-800">{crop.soilRequirement.phRange}</p>
                  </div>
                  <div className="p-2.5 bg-stone-50/70 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">Temperature</span>
                    <p className="font-extrabold text-stone-800">{crop.environmentalRequirements.temperature.split('(')[0]}</p>
                  </div>
                  <div className="p-2.5 bg-stone-50/70 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase">Expected Yield</span>
                    <p className="font-extrabold text-emerald-700">{crop.economics.expectedYield.split('(')[0]}</p>
                  </div>
                </div>

                {/* Soil Profile Snippet */}
                <div className="mt-3 text-[11px] text-stone-500 font-medium line-clamp-2">
                  <span className="font-bold text-stone-700">Ideal Soil:</span> {crop.soilRequirement.soilType}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedCrop(crop)}
                  className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-black text-white font-extrabold rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Step-by-Step Guide
                </button>

                <button
                  onClick={() => handleStartInCurrentState(crop)}
                  className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                  title="Start Ongoing Crop in Current State"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  Cultivate
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200/60 rounded-3xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-stone-800">No Crops Found</h3>
          <p className="text-xs text-stone-400 mt-1">Try resetting the season filter or searching for another crop name.</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL-DETAIL MODAL: STEP-BY-STEP METHOD & TIMELINE         */}
      {/* ======================================================== */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-6 py-5 border-b border-stone-100 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedCrop.category.replace('_', ' ')}
                  </span>
                  <SeasonBadge seasonId={selectedCrop.season} />
                  <span className="text-xs font-semibold text-stone-400">• Duration: {selectedCrop.durationDays}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">
                  {selectedCrop.name} <span className="text-stone-400 text-base font-normal">({selectedCrop.localName})</span>
                </h2>
                <p className="text-xs text-stone-400 italic font-serif">{selectedCrop.scientificName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartInCurrentState(selectedCrop)}
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow transition cursor-pointer"
                >
                  <Sprout className="w-3.5 h-3.5" />
                  Start in Current State
                </button>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-8">
              
              {/* 4 Core Parameter Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Soil Requirements */}
                <div className="p-5 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Soil Requirements & Condition</span>
                  </div>
                  <div className="text-xs space-y-1 text-stone-600">
                    <p><strong>Ideal Soil Type:</strong> {selectedCrop.soilRequirement.soilType}</p>
                    <p><strong>Optimal pH:</strong> <span className="font-bold text-emerald-700">{selectedCrop.soilRequirement.phRange}</span></p>
                    <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                      {selectedCrop.soilRequirement.condition}
                    </p>
                  </div>
                </div>

                {/* 2. Environmental Requirements */}
                <div className="p-5 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                    <Thermometer className="w-4 h-4 text-sky-600" />
                    <span>Climate & Environment</span>
                  </div>
                  <div className="text-xs space-y-1 text-stone-600">
                    <p><strong>Temperature:</strong> {selectedCrop.environmentalRequirements.temperature}</p>
                    <p><strong>Water / Rainfall:</strong> {selectedCrop.environmentalRequirements.rainfall}</p>
                    <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                      <strong>Sunlight:</strong> {selectedCrop.environmentalRequirements.sunlight}
                    </p>
                  </div>
                </div>

                {/* 3. Sowing & Seed Specifications */}
                <div className="p-5 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Sowing Window & Seed Specifics</span>
                  </div>
                  <div className="text-xs space-y-1 text-stone-600">
                    <p><strong>Best Months:</strong> {selectedCrop.bestPracticingMonths.sowing}</p>
                    <p><strong>Seed Rate:</strong> {selectedCrop.seedRateAndSpacing.seedRate}</p>
                    <p><strong>Spacing:</strong> {selectedCrop.seedRateAndSpacing.spacing}</p>
                    <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                      <strong>Seed Treatment:</strong> {selectedCrop.seedRateAndSpacing.seedTreatment}
                    </p>
                  </div>
                </div>

                {/* 4. Nutrient & Economics */}
                <div className="p-5 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                    <Beaker className="w-4 h-4 text-indigo-600" />
                    <span>Fertilizer Recipe & Economics</span>
                  </div>
                  <div className="text-xs space-y-1 text-stone-600">
                    <p><strong>Basal Dose / Acre:</strong> {selectedCrop.nutrientManagement.basal}</p>
                    <p><strong>Top Dressing:</strong> {selectedCrop.nutrientManagement.topDressing}</p>
                    <p><strong>Expected Yield:</strong> <span className="font-extrabold text-emerald-700">{selectedCrop.economics.expectedYield}</span></p>
                    <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                      <strong>Mandi Rate Range:</strong> {selectedCrop.economics.mandiRateRange}
                    </p>
                  </div>
                </div>

              </div>

              {/* Step-by-Step Chronological Timeline Journey */}
              <div className="space-y-4">
                <div className="pb-3 border-b border-stone-200/70">
                  <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Step-by-Step Cultivation Method & Timeline
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Chronological agronomy roadmap from field preparation to harvest and curing.
                  </p>
                </div>

                <div className="relative border-l-2 border-emerald-500/30 ml-4 md:ml-6 space-y-6 pt-2">
                  {selectedCrop.timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative pl-6 md:pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm flex items-center justify-center" />

                      <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-5 hover:bg-stone-50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h4 className="text-sm font-extrabold text-stone-900">
                            Stage {idx + 1}: {step.phase}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-lg self-start sm:self-center">
                            {step.timeline}
                          </span>
                        </div>

                        {/* Tasks Checklist */}
                        <ul className="mt-3 space-y-2 text-xs text-stone-700 font-medium">
                          {step.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Precautions Alert */}
                        {step.precautions && (
                          <div className="mt-3 pt-3 border-t border-stone-200/50 flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50/70 p-2.5 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Crucial Advisory:</strong> {step.precautions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-800/40 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-extrabold text-white">Ready to cultivate {selectedCrop.name}?</h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Create an active crop card in Current State to track your field expenses and harvest profits.
                  </p>
                </div>
                <button
                  onClick={() => handleStartInCurrentState(selectedCrop)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-lg transition cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Sprout className="w-4 h-4" />
                  Start in Current State
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
