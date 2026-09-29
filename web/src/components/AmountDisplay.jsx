import React from 'react';
import { formatINR } from '../../../shared/utils/helpers.js';

export default function AmountDisplay({ amount, className = '', prefix = '' }) {
  const value = Number(amount) || 0;
  // `prefix` lets callers force a sign (e.g. "+"/"-") on a magnitude-only value.
  const sign = prefix || (value < 0 ? '-' : '');
  return (
    <span className={`font-semibold tabular-nums ${className}`}>
      {sign}{formatINR(Math.abs(value))}
    </span>
  );
}