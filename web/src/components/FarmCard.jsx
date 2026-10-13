import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Scale, Sprout, Wheat, ArrowRight, ChevronRight } from 'lucide-react';
import OwnershipBadge from './OwnershipBadge.jsx';
import SeasonBadge from './SeasonBadge.jsx';
import { useCurrentCropStore } from '../store/useCurrentCropStore.js';
import { formatINR } from '../../../shared/utils/helpers.js';

export default function FarmCard({ farm, unitPreference = 'bigha', onClick }) {
  const { t } = useTranslation();
  const { crops } = useCurrentCropStore();

  // Real-time fetched ongoing crop from Current State
  const liveCrop = crops.find(c => c.farmId === farm.id && c.status === 'ongoing');

  // Compute lifetime history stats
  const historyList = farm.cropHistory || [];
  const lifetimeYield = historyList.reduce((s, h) => s + (parseFloat(h.yieldAmount) || 0), 0);
  const lifetimeProfit = historyList.reduce((s, h) => s + (parseFloat(h.netProfit) || 0), 0);

  const farmSizeVal = farm.size || farm.sizeValue || 1;

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-stone-200/70 hover:border-emerald-500/40 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between h-full group"
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-lg text-stone-900 group-hover:text-emerald-700 transition truncate">
              {farm.name}
            </h3>
            <div className="flex items-center text-xs text-stone-400 font-semibold gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{farm.location || 'India'}</span>
            </div>
          </div>
          <OwnershipBadge type={farm.ownershipType || 'own'} />
        </div>

        {/* Live Ongoing Crop & Partner Status Pill */}
        <div className="my-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${liveCrop ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Current Ongoing Crop
              </span>
              <p className="text-xs font-extrabold text-stone-900 truncate">
                {liveCrop ? liveCrop.cropName : 'No active crop'}
              </p>
            </div>
          </div>

          {liveCrop?.season && (
            <SeasonBadge seasonId={liveCrop.season} />
          )}
        </div>

        {/* Partner & Land Area HUD */}
        <div className="grid grid-cols-2 gap-2 py-2 text-xs border-y border-stone-100 my-2">
          <div>
            <span className="text-[10px] text-stone-400 font-medium block">Land Area</span>
            <p className="font-extrabold text-stone-800">
              {farmSizeVal} {farm.sizeUnit || unitPreference}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 font-medium block">Current Partner</span>
            <p className="font-bold text-stone-800 truncate">
              {liveCrop?.partner?.hasPartner 
                ? `🤝 ${liveCrop.partner.name} (${liveCrop.partner.sharePercent}%)` 
                : '🚜 Self-Managed'}
            </p>
          </div>
        </div>

        {/* Historical Track Record summary */}
        <div className="mt-2 text-[11px] text-stone-500 font-medium flex items-center justify-between">
          <span>📜 {historyList.length} Harvest(s) archived</span>
          <span className="font-extrabold text-emerald-700">+{formatINR(lifetimeProfit)}</span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs font-bold text-stone-600 group-hover:text-emerald-700 transition">
        <span>View Details & Analytics</span>
        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
      </div>
    </div>
  );
}
