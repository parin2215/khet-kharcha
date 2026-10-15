import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sprout, 
  Layers, 
  Tag, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Bookmark,
  Coins,
  Edit3,
  Calendar,
  Droplets,
  FlaskConical,
  ShieldAlert,
  Wheat as WheatIcon,
  FileText,
  Save,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkle,
  ListOrdered,
  FileCheck
} from 'lucide-react';
import { getResearchPackageForCrop } from '../../data/cropResearchPackages.js';
import { 
  CROP_CATEGORIES, 
  getLibraryCrops,
  saveLibraryCrops 
} from '../../data/cropLibraryData.js';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cereals');

  // Modal state for viewing crop market types
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Modal state for editing practicing methods of a specific commercial type
  const [editingTypeIndex, setEditingTypeIndex] = useState(null);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [varietyInput, setVarietyInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [expandedPractices, setExpandedPractices] = useState({});
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedStageIdx, setCopiedStageIdx] = useState(null);

  useEffect(() => {
    const loaded = getLibraryCrops();
    setCrops(loaded);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter crops by search query and category
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      if (selectedCategory !== 'all' && crop.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = crop.name?.toLowerCase().includes(q);
        const matchSub = crop.subcategory?.toLowerCase().includes(q);
        const matchLocalGu = crop.localNames?.gu?.toLowerCase().includes(q);
        const matchLocalHi = crop.localNames?.hi?.toLowerCase().includes(q);
        const matchTypes = (crop.marketTypes || []).some(mt => 
          mt.typeName?.toLowerCase().includes(q) ||
          (mt.varieties || []).some(v => v?.toLowerCase().includes(q))
        );
        if (!matchName && !matchSub && !matchLocalGu && !matchLocalHi && !matchTypes) return false;
      }
      return true;
    });
  }, [crops, searchQuery, selectedCategory]);

  // Start crop directly in Current State
  const handleStartInCurrentState = (crop, varietyName = '') => {
    setSelectedCrop(null);
    const varParam = varietyName ? `&variety=${encodeURIComponent(varietyName)}` : '';
    navigate(`/current-state?action=new_crop&cropName=${encodeURIComponent(crop.name)}${varParam}`);
  };

  // Helper to extract or assemble the step-by-step guide
  const getStepByStepGuideFromType = (mt) => {
    if (!mt || !mt.practices) return '';
    if (mt.practices.stepByStepGuide && typeof mt.practices.stepByStepGuide === 'string') {
      return mt.practices.stepByStepGuide;
    }
    // If legacy separate fields exist, assemble them cleanly
    const legacyParts = [
      mt.practices.sowingSeason && `📌 તબક્કો ૧: વાવણી સમય, પદ્ધતિ અને બિયારણ દર\n${mt.practices.sowingSeason}`,
      mt.practices.soilLandPrep && `📌 તબક્કો ૨: જમીન પસંદગી અને ખેડ તૈયારી\n${mt.practices.soilLandPrep}`,
      mt.practices.irrigation && `📌 તબક્કો ૩: પિયત વ્યવસ્થા અને કટોકટીના તબક્કા\n${mt.practices.irrigation}`,
      mt.practices.fertilizerDose && `📌 તબક્કો ૪: ખાતર વ્યવસ્થા - NPK અને દેશી ખાતર\n${mt.practices.fertilizerDose}`,
      mt.practices.plantProtection && `📌 તબક્કો ૫: સંકલિત રોગ-જીવાત અને નીંદણ નિયંત્રણ\n${mt.practices.plantProtection}`,
      mt.practices.harvestingYield && `📌 તબક્કો ૬: કાપણી, થ્રેશિંગ અને અંદાજિત ઉત્પાદન\n${mt.practices.harvestingYield}`,
      mt.practices.notes && `📌 તબક્કો ૭: કૃષિ વૈજ્ઞાનિક નોંધ અને અનુભવ\n${mt.practices.notes}`
    ].filter(Boolean);
    return legacyParts.join('\n\n');
  };

  // Open editor for an existing commercial type
  const handleOpenEditPractice = (crop, typeIndex) => {
    const mt = crop.marketTypes[typeIndex];
    setEditingTypeIndex(typeIndex);
    setIsAddingNewType(false);
    
    const initialGuide = getStepByStepGuideFromType(mt);

    setEditFormData({
      typeName: mt.typeName || '',
      marketUse: mt.marketUse || '',
      grainType: mt.grainType || '',
      varieties: [...(mt.varieties || [])],
      practices: {
        stepByStepGuide: initialGuide
      }
    });
    setVarietyInput('');
  };

  // Open editor to add a new commercial type to selectedCrop
  const handleOpenAddNewType = (crop) => {
    setEditingTypeIndex(null);
    setIsAddingNewType(true);
    setEditFormData({
      typeName: '',
      marketUse: '',
      grainType: '',
      varieties: [],
      practices: {
        stepByStepGuide: ''
      }
    });
    setVarietyInput('');
  };

  // Load research lab & university full step-by-step SOP
  const handleLoadTemplate = () => {
    if (!editFormData || !selectedCrop) return;
    const fullSOP = getResearchPackageForCrop(selectedCrop.name, editFormData.typeName);
    setEditFormData({
      ...editFormData,
      practices: {
        ...editFormData.practices,
        stepByStepGuide: fullSOP
      }
    });
    showToast('✨ Research Labs & Agricultural University Full Cultivation Package Loaded!');
  };

  // Helper to insert quick template tags into the unified editor
  const handleInsertTag = (tagText) => {
    if (!editFormData) return;
    const currentText = editFormData.practices.stepByStepGuide || '';
    const newText = currentText ? `${currentText}\n\n${tagText}` : tagText;
    setEditFormData({
      ...editFormData,
      practices: {
        ...editFormData.practices,
        stepByStepGuide: newText
      }
    });
  };

  // Handle adding variety chip
  const handleAddVariety = () => {
    if (!varietyInput.trim()) return;
    if (editFormData.varieties.includes(varietyInput.trim())) {
      setVarietyInput('');
      return;
    }
    setEditFormData({
      ...editFormData,
      varieties: [...editFormData.varieties, varietyInput.trim()]
    });
    setVarietyInput('');
  };

  // Handle removing variety chip
  const handleRemoveVariety = (vIndex) => {
    setEditFormData({
      ...editFormData,
      varieties: editFormData.varieties.filter((_, idx) => idx !== vIndex)
    });
  };

  // Save edited or new practicing methods
  const handleSavePractices = () => {
    if (!selectedCrop || !editFormData) return;
    if (!editFormData.typeName.trim()) {
      alert('Please provide a Commercial Type Name');
      return;
    }

    const currentMarketTypes = Array.isArray(selectedCrop.marketTypes) ? [...selectedCrop.marketTypes] : [];

    let updatedMarketTypes;
    if (isAddingNewType) {
      updatedMarketTypes = [...currentMarketTypes, editFormData];
    } else if (editingTypeIndex !== null) {
      updatedMarketTypes = currentMarketTypes.map((mt, idx) => {
        if (idx === editingTypeIndex) {
          return { ...mt, ...editFormData };
        }
        return mt;
      });
    }

    const updatedCrop = {
      ...selectedCrop,
      marketTypes: updatedMarketTypes
    };

    // Update crops in global state
    const updatedCrops = crops.map(c => c.id === updatedCrop.id ? updatedCrop : c);
    setCrops(updatedCrops);
    setSelectedCrop(updatedCrop);
    saveLibraryCrops(updatedCrops);

    // Auto expand the practices section for this type so the user immediately sees it
    const activeIndex = isAddingNewType ? updatedMarketTypes.length - 1 : editingTypeIndex;
    setExpandedPractices(prev => ({ ...prev, [activeIndex]: true }));

    // Reset editor
    setEditingTypeIndex(null);
    setIsAddingNewType(false);
    setEditFormData(null);
    showToast('✅ Full Step-by-Step Cultivation Process Saved Successfully!');
  };

  // Export custom data as JSON for sharing or chat updates
  const handleExportCustomJSON = () => {
    const dataStr = JSON.stringify(crops, null, 2);
    navigator.clipboard.writeText(dataStr);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
    showToast('📋 Entire Crop Library JSON copied to clipboard!');
  };

  // Copy individual crop full guide
  const handleCopyCropGuide = (guideText, idx) => {
    navigator.clipboard.writeText(guideText);
    setCopiedStageIdx(idx);
    setTimeout(() => setCopiedStageIdx(null), 2500);
    showToast('📋 Step-by-step Cultivation Process copied to clipboard!');
  };

  // Toggle practices section visibility
  const togglePracticeExpand = (idx) => {
    setExpandedPractices(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              પાક, જાતો અને ક્રમશઃ ખેતી પદ્ધતિઓ (Step-by-Step Cultivation SOPs)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Crop Cultivation Library
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            Market types, commercial cultivars, certified seed varieties, and comprehensive step-by-step agronomy packages from Indian Agricultural Universities (AAU, JAU, ICAR).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCustomJSON}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-bold rounded-2xl transition cursor-pointer"
            title="Copy all crop & practice data to clipboard"
          >
            {copiedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
            <span>{copiedNotification ? 'Copied JSON!' : 'Copy Catalog JSON'}</span>
          </button>

          <div className="px-5 py-3.5 bg-stone-800/90 border border-stone-700 rounded-2xl text-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-wider">Total Crops</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{crops.length} Crops</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search bar and counter */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, variety (e.g. Basmati, GW-496, Sharbati, Chana, Vasad Tur)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-800"
            />
          </div>

          <div className="text-xs font-bold text-stone-500">
            Showing <span className="text-emerald-700 font-extrabold">{filteredCrops.length}</span> of {crops.length} crops
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {CROP_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? crops.length 
              : crops.filter(c => c.category === cat.id).length;

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
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-emerald-500 text-stone-950' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Notice Banner */}
      {selectedCategory === 'cereals' && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>🌾 Cereals & Pseudocereals Directory:</strong> Click any crop card below to view commercial cultivars. Click <strong>"✏️ Edit Practices"</strong> to write your custom step-by-step farming method or click <strong>"Load Research Lab Package"</strong> for comprehensive university SOPs!
            </span>
          </div>
        </div>
      )}

      {selectedCategory === 'pulses' && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>🫘 Legumes & Pulses Directory:</strong> All 14 pulse crops below are equipped with certified cultivars (Desi Chana GG-1/GJG-3, Dollar Chana, Vasad Tuver GAT-2, GAM-5 Mung, GAU-1 Urad, Guar HG-365) and complete step-by-step university cultivation packages (FIR બીજ માવજત, રાઇઝોબિયમ ખાતર, પોડ બોરર અને સુકારો નિયંત્રણ)!
            </span>
          </div>
        </div>
      )}

      {selectedCategory === 'oilseeds' && (
        <div className="bg-amber-50/90 border border-yellow-300 bg-linear-to-r from-amber-50/90 to-yellow-50/90 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>🛢️ Oilseed Crops Directory:</strong> All 12 oilseed crops below are equipped with certified commercial cultivars (GG-20 & GJG-22 Groundnut, GCH-7/9/11 Castor, GM-3 & GDM-4 Mustard, GT-1/5 & GT-10 Sesame, JS-335 Soybean, KBSH-41 Sunflower) and complete step-by-step university cultivation packages (જીપ્સમ/સલ્ફર ખાતર વ્યવસ્થાપન, FIR બીજ માવજત, નીંદણ નિયંત્રણ અને રોગ-જીવાત IPM)!
            </span>
          </div>
        </div>
      )}

      {selectedCategory === 'tubers' && (
        <div className="bg-amber-50/90 border border-orange-300 bg-linear-to-r from-orange-50/90 via-amber-50/90 to-yellow-50/90 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              <strong>🥔 Tubers & Root Crops Directory:</strong> All 10 tuber & root crops below are equipped with certified cultivars (Kufri Pukhraj & Chipsona 1/3 Potato, GSP-1 & Bhu Sona Sweet Potato, Gajendra Suran, GT-1 Taro/Alvi, Surti Ratalu) and complete step-by-step university cultivation packages (માટી ચડાવવી, કંદ ક્યોરિંગ, ખાતર વ્યવસ્થાપન, વેલ ઉથલાવવી અને પાછોતરો સુકારો નિયંત્રણ)!
            </span>
          </div>
        </div>
      )}

      {selectedCategory === 'fiber_industrial' && (
        <div className="bg-sky-50/90 border border-sky-300 bg-linear-to-r from-sky-50/90 via-cyan-50/90 to-blue-50/90 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-sky-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>🧵 Fiber & Industrial Crops Directory:</strong> All 13 fiber & industrial crops below are equipped with certified cultivars (RCH-2 Bt & Suvin Cotton, CoC-671 & Co-0238 Sugarcane, Anand-119 & GC-1 Tobacco, JRO-524 Jute, Sunn Hemp, Coir) and complete step-by-step university cultivation packages (ડોકા કાપણી/ખીલ તોડવી, ગુલાબી ઈયળ ફેરોમોન ટ્રેપ, શેરડીમાં મોટી માટી ચડાવવી, તમાકુમાં દિવેલી ખોળ વ્યવસ્થાપન અને રેસા સડાવવાની પદ્ધતિ)!
            </span>
          </div>
        </div>
      )}

      {/* Crops Cards Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCrops.map(crop => {
            const catObj = CROP_CATEGORIES.find(c => c.id === crop.category) || {};
            const hasMarketTypes = Array.isArray(crop.marketTypes) && crop.marketTypes.length > 0;
            const totalVarietiesCount = hasMarketTypes 
              ? crop.marketTypes.reduce((sum, mt) => sum + (mt.varieties ? mt.varieties.length : 0), 0)
              : 0;
            const hasAnyPractices = hasMarketTypes && crop.marketTypes.some(mt => {
              const guide = getStepByStepGuideFromType(mt);
              return guide && guide.trim().length > 0;
            });

            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/60 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Category & Subcategory tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                      <span>{catObj.icon}</span>
                      <span className="truncate max-w-[130px]">{crop.subcategory}</span>
                    </span>
                    
                    {hasMarketTypes ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        {hasAnyPractices && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{crop.marketTypes.length} Types</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded">
                        Card
                      </span>
                    )}
                  </div>

                  {/* Crop Name */}
                  <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700 transition">
                    {crop.name}
                  </h3>

                  {/* Local Names in Gujarati & Hindi */}
                  {crop.localNames && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {crop.localNames.gu && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded-md">
                          {crop.localNames.gu}
                        </span>
                      )}
                      {crop.localNames.hi && (
                        <span className="text-[11px] font-medium text-stone-500">
                          ({crop.localNames.hi})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Scientific Name */}
                  {crop.scientificName && (
                    <p className="text-[11px] font-mono text-stone-400 italic mt-1">
                      {crop.scientificName}
                    </p>
                  )}

                  {/* Market types preview */}
                  {hasMarketTypes && (
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                        <span className="flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-emerald-600" />
                          Commercial Types:
                        </span>
                        <span className="text-emerald-700 font-extrabold">
                          {totalVarietiesCount} Cultivars
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {crop.marketTypes.slice(0, 3).map((mt, mtIdx) => (
                          <span
                            key={mtIdx}
                            className="text-[10px] font-medium bg-stone-50 text-stone-600 border border-stone-200/80 px-2 py-0.5 rounded"
                          >
                            {mt.typeName.split('(')[0].trim()}
                          </span>
                        ))}
                        {crop.marketTypes.length > 3 && (
                          <span className="text-[10px] font-bold text-stone-400 self-center">
                            +{crop.marketTypes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400 group-hover:text-emerald-600 transition">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>View & Edit Practices</span>
                  </span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-extrabold text-stone-800">No crops match your search</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try adjusting your search query or switch categories to explore other crops.
          </p>
        </div>
      )}

      {/* MODAL 1: Crop Detail & Market Types Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-stone-100 my-8 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    {selectedCrop.subcategory || selectedCrop.category}
                  </span>
                  {selectedCrop.scientificName && (
                    <span className="text-xs font-mono text-stone-400 italic">
                      ({selectedCrop.scientificName})
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 font-serif flex items-center gap-2 flex-wrap">
                  <span>{selectedCrop.name}</span>
                  {selectedCrop.localNames && (
                    <span className="text-emerald-700 font-sans text-xl font-bold">
                      - {selectedCrop.localNames.gu}
                    </span>
                  )}
                </h2>
                {selectedCrop.localNames?.hi && (
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    हिंदी: {selectedCrop.localNames.hi}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddNewType(selectedCrop)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Type</span>
                </button>

                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Market Types List */}
            {Array.isArray(selectedCrop.marketTypes) && selectedCrop.marketTypes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-emerald-600" />
                    Market Types & Recognized Cultivars ({selectedCrop.marketTypes.length})
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">
                    Click "✏️ Edit Practices" to view or edit step-by-step methods
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedCrop.marketTypes.map((mt, idx) => {
                    const guideText = getStepByStepGuideFromType(mt);
                    const hasPracticeData = guideText && guideText.trim().length > 0;
                    const isExpanded = !!expandedPractices[idx];

                    return (
                      <div 
                        key={idx}
                        className="border border-stone-200 rounded-2xl p-5 bg-stone-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all space-y-3"
                      >
                        {/* Type Title & Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/60">
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Commercial Type #{idx + 1}
                            </span>
                            <h4 className="text-base font-extrabold text-stone-900">
                              {mt.typeName}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenEditPractice(selectedCrop, idx)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                              <span>{hasPracticeData ? 'Edit Step-by-Step SOP' : 'Add Practices'}</span>
                            </button>

                            <button
                              onClick={() => handleStartInCurrentState(selectedCrop, mt.typeName.split('(')[0].trim())}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Start Crop</span>
                            </button>
                          </div>
                        </div>

                        {/* Cultivar / Variety chips */}
                        <div>
                          <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                            સૌથી પ્રખ્યાત વેરાયટી / જાતો (Popular Seed Varieties in Market):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(mt.varieties || []).map((v, vIdx) => (
                              <span 
                                key={vIdx}
                                onClick={() => handleStartInCurrentState(selectedCrop, v)}
                                className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-stone-300 text-stone-800 hover:border-emerald-500 hover:text-emerald-700 px-2.5 py-1 rounded-lg shadow-2xs transition cursor-pointer"
                                title="Click to start this exact variety in Current State"
                              >
                                <Sprout className="w-3 h-3 text-emerald-600" />
                                <span>{v}</span>
                              </span>
                            ))}
                            {(mt.varieties || []).length === 0 && (
                              <span className="text-xs text-stone-400 italic">No specific seed cultivars listed yet. Click "Edit Step-by-Step SOP" to add.</span>
                            )}
                          </div>
                        </div>

                        {/* Market Use & Grain Spec */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          {mt.marketUse && (
                            <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                              <span className="text-[10px] text-stone-400 font-bold uppercase block">
                                Market Usage & Trade:
                              </span>
                              <span className="font-semibold text-stone-700 mt-0.5 block leading-relaxed">
                                {mt.marketUse}
                              </span>
                            </div>
                          )}

                          {mt.grainType && (
                            <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                              <span className="text-[10px] text-stone-400 font-bold uppercase block">
                                Grain & Quality Profile:
                              </span>
                              <span className="font-semibold text-stone-700 mt-0.5 block leading-relaxed">
                                {mt.grainType}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* UNIFIED STEP-BY-STEP CULTIVATION GUIDE SECTION */}
                        <div className="pt-2 border-t border-stone-200/60">
                          {hasPracticeData ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  onClick={() => togglePracticeExpand(idx)}
                                  className="flex-1 flex items-center justify-between text-xs font-extrabold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <ListOrdered className="w-4 h-4 text-emerald-700" />
                                    <span>સંપૂર્ણ ક્રમશઃ ખેતી પદ્ધતિ (Step-by-Step Cultivation Guide)</span>
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                                    <span>{isExpanded ? 'Hide Steps' : 'View Full Step-by-Step Process'}</span>
                                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </div>
                                </button>

                                <button
                                  onClick={() => handleCopyCropGuide(guideText, idx)}
                                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                  title="Copy entire step-by-step guide to clipboard"
                                >
                                  {copiedStageIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                                  <span>{copiedStageIdx === idx ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="bg-white rounded-2xl p-4 md:p-5 border border-stone-200 shadow-2xs space-y-4 text-xs font-sans">
                                  
                                  {/* Split by stage marker (📌) or render clean blocks */}
                                  {guideText.split('📌').filter(Boolean).map((stageChunk, sIdx) => {
                                    const lines = stageChunk.trim().split('\n');
                                    const stageTitle = lines[0];
                                    const stageBody = lines.slice(1).join('\n').trim();

                                    return (
                                      <div 
                                        key={sIdx}
                                        className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80 space-y-2 hover:bg-emerald-50/20 transition"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                            {sIdx + 1}
                                          </span>
                                          <h5 className="font-extrabold text-stone-900 text-xs tracking-tight">
                                            {stageTitle}
                                          </h5>
                                        </div>

                                        {stageBody && (
                                          <div className="text-stone-700 pl-8 leading-relaxed whitespace-pre-line text-xs font-medium">
                                            {stageBody}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs py-1">
                              <span className="text-stone-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>No step-by-step methods added yet for this type.</span>
                              </span>
                              <button
                                onClick={() => handleOpenEditPractice(selectedCrop, idx)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Step-by-Step SOP</span>
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                <p className="text-xs text-stone-500">
                  Detailed market types for <strong>{selectedCrop.name}</strong> will be expanded soon.
                </p>
                <button
                  onClick={() => handleOpenAddNewType(selectedCrop)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Market Type</span>
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-xs text-stone-400 font-medium">
                Category: <strong>{selectedCrop.category}</strong>
              </span>

              <button
                onClick={() => setSelectedCrop(null)}
                className="py-2.5 px-6 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UNIFIED STEP-BY-STEP CULTIVATION PROCESS EDITOR */}
      {editFormData && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-5 shadow-2xl border border-stone-200 my-8 max-h-[94vh] overflow-y-auto">
            
            {/* Editor Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  {isAddingNewType ? 'New Commercial Type' : 'Step-by-Step Cultivation Process Editor'}
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-stone-900 mt-1 font-serif">
                  {selectedCrop?.name} — {isAddingNewType ? 'Add Type & Full Process' : editFormData.typeName || 'Edit Process'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Write the complete chronological growing guide or load official research packages from agricultural universities.
                </p>
              </div>

              <button 
                onClick={() => setEditFormData(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SMART ACTION: Load University Research Package */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                    Official University & Research Lab Package
                  </span>
                </div>
                <p className="text-xs text-emerald-50 mt-1 max-w-xl leading-relaxed">
                  Fetch the exhaustive step-by-step growing package (Anand/Junagadh Agricultural University & ICAR) with FIR seed treatments, exact kg/bigha fertilizer schedules, critical irrigation stages, and pest control.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadTemplate}
                className="px-4 py-2.5 bg-white hover:bg-amber-100 text-stone-900 text-xs font-extrabold rounded-xl transition cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Load Recommended Template</span>
              </button>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4 text-xs">
              
              {/* Type Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Commercial Type Name (વેપારી પ્રકારનું નામ) *
                </label>
                <input
                  type="text"
                  value={editFormData.typeName}
                  onChange={(e) => setEditFormData({ ...editFormData, typeName: e.target.value })}
                  placeholder="e.g. Desi Brown / Yellow Chickpea (દેશી પીળા ચણા / કાઠીયાવાડી)"
                  className="w-full px-3.5 py-2.5 text-xs font-medium border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-900"
                />
              </div>

              {/* Market Usage & Grain Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Market Usage & Trade (વેપાર અને ઉપયોગ)
                  </label>
                  <input
                    type="text"
                    value={editFormData.marketUse}
                    onChange={(e) => setEditFormData({ ...editFormData, marketUse: e.target.value })}
                    placeholder="e.g. Export market, Vasad Dal mill recovery, snack processing"
                    className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Grain & Quality Profile (દાણાની ગુણવત્તા)
                  </label>
                  <input
                    type="text"
                    value={editFormData.grainType}
                    onChange={(e) => setEditFormData({ ...editFormData, grainType: e.target.value })}
                    placeholder="e.g. Bold angular grain, 100-seed weight 24g, high protein 22%"
                    className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-stone-50 text-stone-900"
                  />
                </div>
              </div>

              {/* Popular Seed Varieties (Cultivars) Tag Manager */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Popular Seed Varieties & Cultivars in Market (બજારમાં મળતી જાતો)
                </label>
                
                <div className="flex flex-wrap gap-1.5 mb-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl min-h-[44px]">
                  {editFormData.varieties.map((v, vIdx) => (
                    <span 
                      key={vIdx}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-stone-300 text-stone-800 px-2 py-0.5 rounded-lg shadow-2xs"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariety(vIdx)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editFormData.varieties.length === 0 && (
                    <span className="text-stone-400 italic text-[11px] self-center">No varieties added yet. Type below and press Enter or Add.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={varietyInput}
                    onChange={(e) => setVarietyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariety();
                      }
                    }}
                    placeholder="Type seed variety (e.g. GJG-3, JAKI-9218, Digvijay) and press Enter..."
                    className="flex-1 px-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariety}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Add Variety
                  </button>
                </div>
              </div>

              {/* UNIFIED SINGLE STEP-BY-STEP CULTIVATION GUIDE EDITOR */}
              <div className="pt-3 border-t border-stone-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-emerald-600" />
                      <span>સંપૂર્ણ ક્રમશઃ ખેતી પદ્ધતિ માર્ગદર્શિકા (Step-by-Step Cultivation Guide) *</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-medium">
                      Write your step-by-step growing method or customize the university research package.
                    </span>
                  </div>

                  {/* Quick Helper Insert Buttons */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('📌 તબક્કો: [તબક્કાનું નામ]\n• વિગતો:\n• ભલામણ કરેલ ખાતર/માત્રા:')}
                      className="text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      + નવો તબક્કો
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('📌 બીજ માવજત (FIR પદ્ધતિ):\n• ૧) ફૂગનાશક: થાયરમ ૨ ગ્રામ + કાર્બેન્ડાઝિમ ૧ ગ્રામ/કિગ્રા\n• ૨) કીટનાશક: થાયોમેથોક્સામ ૩૦ FS (૩ મિલી/કિગ્રા)\n• ૩) જૈવિક કલ્ચર: રાઇઝોબિયમ + PSB કલ્ચર (૨૫ ગ્રામ/કિગ્રા)')}
                      className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      🌱 FIR માવજત
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('📌 પિયત વ્યવસ્થાપન (કટોકટીના તબક્કા):\n• ૧) વાવણી વખતે\n• ૨) ફૂટ / ડાળીઓ વખતે\n• ૩) દાણા ભરાતી વખતે')}
                      className="text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      💧 પિયત શિડ્યુલ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertTag('📌 ૧ વીઘા દીઠ ખાતર વ્યવસ્થાપન:\n• પાયામાં: ડી.એ.પી. ... કિગ્રા + પોટાશ ... કિગ્રા + સલ્ફર ... કિગ્રા\n• પૂર્તિ ખાતર: યુરિયા ... કિગ્રા પિયત સાથે')}
                      className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 px-2 py-1 rounded-md transition cursor-pointer"
                    >
                      🧪 ખાતર ડોઝ
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={16}
                    value={editFormData.practices.stepByStepGuide}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      practices: { ...editFormData.practices, stepByStepGuide: e.target.value }
                    })}
                    placeholder="અહીં પાક ઉગાડવાની સંપૂર્ણ ક્રમશઃ પદ્ધતિ લખો (તબક્કો ૧: જમીન તૈયારી, તબક્કો ૨: બીજ માવજત, તબક્કો ૩: વાવણી, તબક્કો ૪: ખાતર અને પિયત, તબક્કો ૫: રોગ-જીવાત દવા, તબક્કો ૬: કાપણી)... અથવા ઉપર આપેલા 'Load Recommended Template' બટન પર ક્લિક કરો જેથી યુનિવર્સિટીનો સંપૂર્ણ પદ્ધતિસરનો પેકેજ અહીં આવી જશે."
                    className="w-full px-4 py-3.5 text-xs border-2 border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-600 bg-stone-50/50 text-stone-900 font-sans leading-relaxed shadow-inner"
                  />
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>💡 ટીપ: દરેક તબક્કાની શરૂઆતમાં <strong>"📌 તબક્કો ૧:", "📌 તબક્કો ૨:"</strong> લખવાથી તે કાર્ડમાં સુંદર સ્ટેપ-બાય-સ્ટેપ બોક્સ તરીકે દર્શાવશે.</span>
                  <span>અક્ષરો: {(editFormData.practices.stepByStepGuide || '').length}</span>
                </div>
              </div>

            </div>

            {/* Editor Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditFormData(null)}
                className="py-2.5 px-5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePractices}
                className="py-2.5 px-6 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Step-by-Step SOP</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
