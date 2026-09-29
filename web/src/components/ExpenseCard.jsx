import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../shared/utils/helpers.js';
import { getCategoryById } from '../../../shared/constants/categories.js';
import AmountDisplay from './AmountDisplay.jsx';
import OwnershipBadge from './OwnershipBadge.jsx';
import * as Icons from 'lucide-react';

export default function ExpenseCard({ expense, farmName, onClick }) {
  const { t } = useTranslation();
  const category = getCategoryById(expense.category);
  const LucideIcon = Icons[category?.lucide] || Icons.HelpCircle;
  const color = category?.color || '#6b7280';

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-3.5">
        <div 
          className="p-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '15', color: color }}
        >
          <LucideIcon className="w-5 h-5" />
        </div>
        
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-stone-900 truncate">
            {category?.nameKey ? t(category.nameKey) : expense.category}
          </h4>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            {farmName || t('farm.title')} • {formatDate(expense.date)}
          </p>
          {expense.notes && (
            <p className="text-xs text-stone-500 italic mt-1 truncate max-w-[180px]">
              "{expense.notes}"
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
        <AmountDisplay amount={expense.amount} className="text-sm font-extrabold text-stone-900" />
        <OwnershipBadge type={expense.expenseType} />
      </div>
    </div>
  );
}
