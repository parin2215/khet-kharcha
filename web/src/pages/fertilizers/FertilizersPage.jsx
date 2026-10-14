import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Search, 
  Filter, 
  Leaf, 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  X, 
  Calculator, 
  Layers, 
  Info, 
  Wheat, 
  ChevronRight,
  ShieldCheck,
  Ban,
  ArrowRight,
  Sparkle,
  Scale
} from 'lucide-react';
import { 
  FERTILIZER_CATEGORIES, 
  FERTILIZERS_DATA, 
  COMPATIBILITY_RULES 
} from '../../data/fertilizerData.js';

export default function FertilizersPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal for deep fertilizer details & recipe
  const [selectedFertilizer, setSelectedFertilizer] = useState(null);

  // Modal / View for 1-Bigha Calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcBighas, setCalcBighas] = useState(2);
  const [calcSelectedFertId, setCalcSelectedFertId] = useState('fert_urea');

  // Compatibility drawer / modal
  const [showCompatibility, setShowCompatibility] = useState(false);

  // Filtered list
  const filteredFertilizers = useMemo(() => {
    return FERTILIZERS_DATA.filter(f => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'chemical' && f.category !== 'chemical') return false;
        if (selectedCategory === 'organic' && f.category !== 'organic') return false;
        if (selectedCategory === 'micronutrient' && f.category !== 'micronutrient') return false;
        if (selectedCategory === 'water_soluble' && f.category !== 'water_soluble') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name?.toLowerCase().includes(q);
        const matchGu = f.localNames?.gu?.toLowerCase().includes(q);
        const matchHi = f.localNames?.hi?.toLowerCase().includes(q);
        const matchSub = f.subcategory?.toLowerCase().includes(q);
        const matchFormula = f.formula?.toLowerCase().includes(q);
        if (!matchName && !matchGu && !matchHi && !matchSub && !matchFormula) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Selected fertilizer for calculator
  const calcFertilizer = useMemo(() => {
    return FERTILIZERS_DATA.find(f => f.id === calcSelectedFertId) || FERTILIZERS_DATA[0];
  }, [calcSelectedFertId]);

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              ખાતર અને જમીન પોષણ માર્ગદર્શિકા (Fertilizers & Soil Health)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Fertilizers & Manures Directory
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Complete guide for all Chemical & Organic fertilizers: chemical levels, how each nutrient works inside the soil, 1-Bigha exact dosages, and step-by-step home recipes for organic manures.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            <span>1-Bigha Dose Calculator</span>
          </button>

          <button
            onClick={() => setShowCompatibility(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold rounded-2xl transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Mixing Rules</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Urea, DAP, જીવામૃત, Zinc, Potash, 19:19:19..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-800"
            />
          </div>

          <div className="text-xs font-bold text-stone-500">
            Showing <span className="text-emerald-700 font-extrabold">{filteredFertilizers.length}</span> of {FERTILIZERS_DATA.length} Fertilizers
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Type:
          </span>
          {FERTILIZER_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fertilizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFertilizers.map((fert) => {
          const isOrganic = fert.category === 'organic';

          return (
            <div
              key={fert.id}
              onClick={() => setSelectedFertilizer(fert)}
              className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/60 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${fert.badgeColor}`}>
                    {fert.subcategory}
                  </span>

                  {isOrganic ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <Leaf className="w-3 h-3 text-emerald-600" />
                      <span>100% Organic</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                      {fert.formula}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700 transition">
                  {fert.name}
                </h3>
                
                {/* Local Gujarati & Hindi Name */}
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {fert.localNames.gu}
                  </span>
                  {fert.localNames.hi && (
                    <span className="text-[11px] text-stone-400 font-medium">
                      ({fert.localNames.hi})
                    </span>
                  )}
                </div>

                {/* Composition Preview */}
                <p className="text-xs text-stone-600 font-medium mt-2 leading-relaxed">
                  {fert.composition}
                </p>

                {/* Nutrient Pills */}
                {fert.nutrientLevels && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {Object.entries(fert.nutrientLevels).map(([key, val]) => (
                      <span 
                        key={key}
                        className="text-[10px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded"
                      >
                        {key}: <strong className="text-stone-900">{val}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* 1-Bigha Dosage Box */}
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-900">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-700" />
                      1 વીઘા દીઠ પ્રમાણ (Dose / Bigha):
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                    {fert.bighaDosage}
                  </p>
                </div>

                {/* How it works summary */}
                <div className="mt-3 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  <strong>જમીનમાં કાર્ય:</strong> {fert.howItWorks}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400 group-hover:text-emerald-700 transition">
                <span className="flex items-center gap-1 text-[11px]">
                  {isOrganic ? <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> : <Info className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{isOrganic && fert.isOrganicWithRecipe ? 'View Making Recipe & Details' : 'View Action & Details'}</span>
                </span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Deep Fertilizer Details & Recipe */}
      {selectedFertilizer && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-stone-200 my-8 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${selectedFertilizer.badgeColor}`}>
                    {selectedFertilizer.subcategory}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    {selectedFertilizer.formula}
                  </span>
                  {selectedFertilizer.category === 'organic' && (
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      🌿 100% Pure Organic
                    </span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 font-serif flex items-center gap-2 flex-wrap">
                  <span>{selectedFertilizer.name}</span>
                  <span className="text-emerald-700 font-sans text-xl font-bold">
                    - {selectedFertilizer.localNames.gu}
                  </span>
                </h2>

                <p className="text-xs text-stone-500 font-medium mt-1">
                  {selectedFertilizer.composition}
                </p>
              </div>

              <button 
                onClick={() => setSelectedFertilizer(null)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nutrients Breakdown Banner */}
            {selectedFertilizer.nutrientLevels && (
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 block mb-2">
                  Chemical Levels & Nutrient Content (પોષક તત્વોનું પ્રમાણ):
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedFertilizer.nutrientLevels).map(([key, val]) => (
                    <div key={key} className="bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">{key}</span>
                      <span className="text-sm font-extrabold text-stone-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 1: HOW IT WORKS IN SOIL */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>જમીનમાં કેવી રીતે કાર્ય કરે છે? (How it Works in Soil & Chemistry)</span>
              </h3>
              
              <p className="text-xs text-stone-700 font-sans leading-relaxed bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                {selectedFertilizer.howItWorks}
              </p>

              {selectedFertilizer.soilAction && (
                <div className="text-[11px] text-stone-500 font-mono pl-2 border-l-2 border-emerald-500">
                  <strong>Soil Agronomy Mechanism:</strong> {selectedFertilizer.soilAction}
                </div>
              )}
            </div>

            {/* SECTION 2: 1-BIGHA DOSAGE & APPLICATION */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/50 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>1 વીઘા દીઠ પ્રમાણ અને આપવાની પદ્ધતિ (1-Bigha Dosage & Method)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase block tracking-wider">
                    ભલામણ કરેલ માત્રા (Dosage for 1 Bigha):
                  </span>
                  <p className="font-extrabold text-stone-900 text-sm">
                    {selectedFertilizer.bighaDosage}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-extrabold text-stone-500 uppercase block tracking-wider">
                    આપવાની યોગ્ય રીત અને સમય (Application Method):
                  </span>
                  <p className="font-bold text-stone-800">
                    {selectedFertilizer.applicationMethod}
                  </p>
                </div>
              </div>

              {/* Soil & Crop Benefits */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="text-[10px] font-extrabold text-stone-500 uppercase block tracking-wider">
                  જમીન અને પાકને થતા ફાયદા (Soil & Crop Benefits):
                </span>
                <p className="text-stone-700 leading-relaxed font-medium">
                  {selectedFertilizer.bighaBenefits}
                </p>
              </div>

              {/* Precautions & Mixing Warnings */}
              {selectedFertilizer.precautions && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-extrabold uppercase">ખાસ સાવચેતી / મિક્સિંગ ચેતવણી:</strong>
                    <span className="mt-0.5 block leading-relaxed">{selectedFertilizer.precautions}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: ORGANIC HOME RECIPE (IF APPLICABLE) */}
            {selectedFertilizer.isOrganicWithRecipe && selectedFertilizer.recipe && (
              <div className="border-2 border-emerald-300 rounded-3xl p-6 bg-gradient-to-b from-emerald-50/60 to-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-extrabold text-emerald-950 font-serif">
                      {selectedFertilizer.recipe.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl">
                      તૈયાર થવાનો સમય: <strong>{selectedFertilizer.recipe.prepDays}</strong>
                    </span>
                  </div>
                </div>

                {/* Ingredients List */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2">
                    જરૂરી સામગ્રી (Raw Ingredients List):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedFertilizer.recipe.ingredients.map((ing, iIdx) => (
                      <div key={iIdx} className="bg-white p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs shadow-2xs">
                        <span className="font-bold text-stone-800">{ing.item}</span>
                        <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">{ing.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2">
                    બનાવવાની ક્રમશઃ પદ્ધતિ (Step-by-Step Process):
                  </h4>
                  <div className="space-y-2">
                    {selectedFertilizer.recipe.steps.map((step, sIdx) => (
                      <div key={sIdx} className="bg-white p-3 rounded-xl border border-stone-200/80 text-xs text-stone-800 leading-relaxed shadow-2xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shelf Life */}
                <div className="pt-2 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>સંગ્રહ ક્ષમતા (Shelf Life): <strong>{selectedFertilizer.recipe.shelfLife}</strong></span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={() => {
                  setCalcSelectedFertId(selectedFertilizer.id);
                  setSelectedFertilizer(null);
                  setShowCalculator(true);
                }}
                className="py-2.5 px-5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate for my Farm Bighas</span>
              </button>

              <button
                onClick={() => setSelectedFertilizer(null)}
                className="py-2.5 px-6 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: 1-BIGHA FERTILIZER CALCULATOR */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-stone-200 my-8">
            
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900 font-serif">
                    1-Bigha Fertilizer Dose Calculator
                  </h3>
                  <p className="text-xs text-stone-500">
                    વીઘા અનુસાર ખાતરના જથ્થા અને થેલીઓની ચોક્કસ ગણતરી (1 Acre ≈ 2.5 Bigha)
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowCalculator(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Fertilizer (ખાતર પસંદ કરો)
                </label>
                <select
                  value={calcSelectedFertId}
                  onChange={(e) => setCalcSelectedFertId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-900 cursor-pointer"
                >
                  {FERTILIZERS_DATA.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.localNames.gu})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Farm Land Size in Bighas (તમારા ખેતરના વીઘા):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={calcBighas}
                    onChange={(e) => setCalcBighas(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    className="w-32 px-3.5 py-2.5 text-base font-extrabold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-emerald-800 text-center"
                  />
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5, 10].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setCalcBighas(b)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          calcBighas === b ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {b} વીઘા
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  1 વીઘા = 16 ગૂંઠા (આશરે 0.4 એકર / 17,424 ચોરસ ફૂટ)
                </span>
              </div>
            </div>

            {/* Calculated Result Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                Total Recommended Quantity for {calcBighas} Bigha ({calcFertilizer.name}):
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-950 font-mono">
                  {/* Extract average kg number from string if possible or display multiplied */}
                  {calcFertilizer.id === 'fert_urea' && `${20 * calcBighas} થી ${25 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'fert_dap' && `${20 * calcBighas} થી ${30 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'fert_mop' && `${15 * calcBighas} થી ${20 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'fert_ssp' && `${40 * calcBighas} થી ${50 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'fert_zinc_sulphate' && `${4 * calcBighas} થી ${5 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'org_jeevamrut' && `${80 * calcBighas} થી ${100 * calcBighas} લિટર`}
                  {calcFertilizer.id === 'org_vermicompost' && `${300 * calcBighas} થી ${500 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'org_fym_compost' && `${1 * calcBighas} થી ${2 * calcBighas} ટ્રોલી`}
                  {calcFertilizer.id === 'org_castor_cake' && `${50 * calcBighas} થી ${80 * calcBighas} કિગ્રા`}
                  {calcFertilizer.id === 'org_biochar' && `${150 * calcBighas} થી ${250 * calcBighas} કિગ્રા (ચાર્જ્ડ)`}
                  {!['fert_urea', 'fert_dap', 'fert_mop', 'fert_ssp', 'fert_zinc_sulphate', 'org_jeevamrut', 'org_vermicompost', 'org_fym_compost', 'org_castor_cake', 'org_biochar'].includes(calcFertilizer.id) && (
                    `${calcFertilizer.bighaDosage} (ગુણ્યા ${calcBighas} વીઘા)`
                  )}
                </span>
                <span className="text-xs font-bold text-emerald-800">જરૂરિયાત</span>
              </div>

              {/* Bags estimate */}
              {['fert_urea', 'fert_dap', 'fert_ssp', 'fert_mop'].includes(calcFertilizer.id) && (
                <div className="pt-2 border-t border-emerald-200/60 text-xs font-semibold text-emerald-900">
                  આશરે થેલીઓ (Bags): <strong>{Math.ceil((25 * calcBighas) / 45)} થી {Math.ceil((30 * calcBighas) / 45)} થેલી</strong> (45/50 kg બેગ અનુસાર)
                </div>
              )}

              <p className="text-xs text-emerald-900/90 leading-relaxed pt-1">
                <strong>આપવાની રીત:</strong> {calcFertilizer.applicationMethod}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCalculator(false)}
                className="py-2 px-6 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close Calculator
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: COMPATIBILITY RULES */}
      {showCompatibility && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl border border-stone-200 my-8">
            
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900 font-serif">
                    Fertilizer Mixing Compatibility Chart
                  </h3>
                  <p className="text-xs text-stone-500">
                    કયા ખાતરો ભેગા કરી શકાય અને કયા ખાતરો ક્યારેય ન ભેળવવા?
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowCompatibility(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {COMPATIBILITY_RULES.map((rule, rIdx) => {
                const isDanger = rule.type === 'danger';
                const isWarning = rule.type === 'warning';
                const isSuccess = rule.type === 'success';

                return (
                  <div
                    key={rIdx}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      isDanger ? 'bg-rose-50 border-rose-200 text-rose-950' :
                      isWarning ? 'bg-amber-50 border-amber-200 text-amber-950' :
                      'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm">{rule.pair}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isDanger ? 'bg-rose-200 text-rose-900' :
                        isWarning ? 'bg-amber-200 text-amber-900' :
                        'bg-emerald-200 text-emerald-900'
                      }`}>
                        {rule.status}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed opacity-90">
                      {rule.reason}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCompatibility(false)}
                className="py-2 px-6 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
