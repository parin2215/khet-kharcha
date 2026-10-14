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
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  CROP_CATEGORIES, 
  getLibraryCrops 
} from '../../data/cropLibraryData.js';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setCrops(getLibraryCrops());
  }, []);

  // Filter crops by search query and category
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      if (selectedCategory !== 'all' && crop.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = crop.name?.toLowerCase().includes(q);
        const matchSub = crop.subcategory?.toLowerCase().includes(q);
        if (!matchName && !matchSub) return false;
      }
      return true;
    });
  }, [crops, searchQuery, selectedCategory]);

  // Group filtered crops by category for organized section display if 'all' is selected
  const categoryMap = useMemo(() => {
    const map = {};
    filteredCrops.forEach(c => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return map;
  }, [filteredCrops]);

  // Start crop directly in Current State
  const handleStartInCurrentState = (crop) => {
    navigate(`/current-state?action=new_crop&cropName=${encodeURIComponent(crop.name)}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              સંપૂર્ણ પાક લાઇબ્રેરી (Master Crop Directory)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Crop Cultivation Library
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            All primary agricultural, horticultural, plantation, spice, and commercial crops categorized. Detailed cultivation methods, soil packages, and timeline practices will be expanded soon.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3.5 bg-stone-800/90 border border-stone-700 rounded-2xl text-center">
            <span className="text-[10px] text-stone-400 font-bold uppercase block tracking-wider">Total Crops Cataloged</span>
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
              placeholder="Search across all crops (e.g. Cotton, Rice, Cumin, Mango)..."
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
            Filter:
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

      {/* Notice Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Master Crop Catalog:</strong> All cards are established. Full step-by-step practices, soil parameters, and timeline methods will be added for each crop. You can already launch any crop into <strong>Current State</strong> with one click!
          </span>
        </div>
      </div>

      {/* Crops Cards Grid */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCrops.map(crop => {
            const catObj = CROP_CATEGORIES.find(c => c.id === crop.category) || {};

            return (
              <div
                key={crop.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/60 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Category & Subcategory tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                      <span>{catObj.icon}</span>
                      <span className="truncate max-w-[120px]">{crop.subcategory}</span>
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded">
                      Card
                    </span>
                  </div>

                  {/* Crop Name */}
                  <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-700 transition leading-snug">
                    {crop.name}
                  </h3>

                  {/* Placeholder Badge */}
                  <div className="mt-3 py-1.5 px-2.5 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3 h-3 text-stone-400" />
                      Methods & Details:
                    </span>
                    <span className="font-extrabold text-stone-600 text-[10px] uppercase">
                      Upcoming
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-400">
                    Khet Kharcha
                  </span>
                  
                  <button
                    onClick={() => handleStartInCurrentState(crop)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    title="Launch this crop in Current State"
                  >
                    <span>+ Start Crop</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200/70 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-stone-900 font-serif">No Crops Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            No crop matches your search term "{searchQuery}". Try searching for another name or choose "All Crops".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold transition"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
