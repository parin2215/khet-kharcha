import React from 'react';

export default function LoadingSkeleton({ className = '', width = 'w-full', height = 'h-5', rounded = 'rounded-md' }) {
  return (
    <div className={`animate-shimmer bg-stone-200 ${width} ${height} ${rounded} ${className}`}></div>
  );
}
