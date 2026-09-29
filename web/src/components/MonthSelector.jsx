import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthSelector({ selectedDate, onChange, mode = 'month' }) {
  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (mode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    onChange(newDate);
  };

  const formatDisplay = (date) => {
    if (mode === 'year') {
      return date.getFullYear().toString();
    }
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="flex items-center justify-between bg-white border border-stone-200/50 shadow-sm rounded-xl px-4 py-2 max-w-xs w-full">
      <button 
        onClick={handlePrevious}
        className="p-1 hover:bg-stone-50 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="font-bold text-sm text-[#1a1a18]">
        {formatDisplay(selectedDate)}
      </span>
      
      <button 
        onClick={handleNext}
        className="p-1 hover:bg-stone-50 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
