import React from 'react';
import * as Icons from 'lucide-react';

export default function EmptyState({ icon = 'AlertCircle', message, btnLabel, onBtnPress }) {
  const LucideIcon = Icons[icon] || Icons.AlertCircle;

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-stone-200/50 shadow-sm max-w-md mx-auto">
      <div className="p-4 bg-stone-100 text-stone-400 rounded-full mb-4">
        <LucideIcon className="w-10 h-10" />
      </div>
      <p className="text-sm md:text-base font-semibold text-stone-500 mb-6 max-w-xs leading-relaxed">
        {message}
      </p>
      {btnLabel && onBtnPress && (
        <button
          onClick={onBtnPress}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer text-sm"
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
}
