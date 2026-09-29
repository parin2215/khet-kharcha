import React from 'react';

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-base font-bold text-stone-900">{title}</h3>
          {subtitle && <p className="text-xs text-stone-400 font-medium mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="w-full flex items-center justify-center min-h-[260px]">
        {children}
      </div>
    </div>
  );
}
