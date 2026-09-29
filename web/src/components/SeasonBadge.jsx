import React from 'react';
import { useTranslation } from 'react-i18next';
import { getSeasonById } from '../../../shared/constants/seasons.js';

export default function SeasonBadge({ seasonId, className = '' }) {
  const { t } = useTranslation();
  const season = getSeasonById(seasonId);
  const color = season?.color || '#6b7280';
  const label = season?.nameKey ? t(season.nameKey) : seasonId;

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${className}`}
      style={{ 
        color: color, 
        backgroundColor: color + '12', 
        borderColor: color + '25' 
      }}
    >
      {label}
    </span>
  );
}
