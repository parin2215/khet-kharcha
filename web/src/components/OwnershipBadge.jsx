import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OwnershipBadge({ type, className = '' }) {
  const { t } = useTranslation();
  const getBadgeStyle = () => {
    if (type === 'own') return 'bg-ownExpenseLight/60 text-ownExpense border-ownExpense/20';
    if (type === 'leased') return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-partnerExpenseLight/60 text-partnerExpense border-partnerExpense/20';
  };

  const getBadgeText = () => {
    if (type === 'own') return t('farm.own') || 'My Farm';
    if (type === 'leased') return t('farm.leased') || 'Leased Out';
    return t('farm.partner') || 'Partnership';
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border transition ${getBadgeStyle()} ${className}`}
    >
      {getBadgeText()}
    </span>
  );
}
