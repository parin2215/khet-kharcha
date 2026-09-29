import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Scale } from 'lucide-react';
import OwnershipBadge from './OwnershipBadge.jsx';
import SeasonBadge from './SeasonBadge.jsx';
import AmountDisplay from './AmountDisplay.jsx';

export default function FarmCard({ farm, totalExpense = 0, unitPreference = 'bigha', onClick }) {
  const { t } = useTranslation();

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-stone-200/50 hover:border-primary/20 rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer p-6 flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="min-w-0">
            <h3 className="font-extrabold text-lg text-stone-900 truncate">{farm.name}</h3>
            <div className="flex items-center text-xs text-stone-400 font-medium gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{farm.location || 'India'}</span>
            </div>
          </div>
          <OwnershipBadge type={farm.ownershipType} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 my-4 text-xs">
          <div>
            <p className="text-stone-400 font-medium mb-1">{t('farm.size') || 'Size'}</p>
            <p className="font-bold text-stone-800">
              {farm.size} <span className="text-[10px] font-normal text-stone-500">{t(`unit.${unitPreference}`)}</span>
            </p>
          </div>
          <div>
            <p className="text-stone-400 font-medium mb-1">{t('farm.crop') || 'Crop'}</p>
            <p className="font-bold text-stone-800 truncate">{farm.currentCrop || 'N/A'}</p>
          </div>
          <div>
            <p className="text-stone-400 font-medium mb-1">{t('expense.total') || 'Expenses'}</p>
            <AmountDisplay amount={totalExpense} className="text-red-650 font-extrabold" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs pt-2">
        <SeasonBadge seasonId={farm.cropSeason} />
        
        {farm.ownershipType === 'partner' && farm.partners && (
          <div className="flex items-center text-stone-400 font-medium gap-1 truncate max-w-[50%]">
            <Users className="w-3.5 h-3.5 text-partnerExpense" />
            <span className="truncate">{farm.partners.map(p => p.name).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
