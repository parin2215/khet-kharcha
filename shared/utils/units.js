/**
 * Khet Kharcha — Universal Weight Units & Conversion Engine
 * Standard base: 1 Mann / Maann = 20 kg, 1 Quintal = 100 kg (5 Mann), 1 Ton = 1000 kg (50 Mann), 1 Kg = 1 kg
 */

export const KG_PER_UNIT = {
  mann: 20,
  maann: 20,
  man: 20,
  quintal: 100,
  qtl: 100,
  q: 100,
  kg: 1,
  kilogram: 1,
  kilo: 1,
  ton: 1000,
  tonne: 1000,
  mt: 1000,
};

/**
 * Standardize any unit string into a known canonical key
 */
export const normalizeWeightUnit = (unit) => {
  if (!unit) return 'mann';
  const u = String(unit).toLowerCase().trim();
  if (u.includes('man') || u.includes('મણ') || u.includes('मन')) return 'mann';
  if (u.includes('qtl') || u.includes('quintal') || u.includes('કવિન્ટલ') || u.includes('ક્વિન્ટલ') || u.includes('क्विंटल')) return 'quintal';
  if (u === 'kg' || u.includes('kilo') || u.includes('કિલો') || u.includes('किग्रा')) return 'kg';
  if (u.includes('ton') || u.includes('ટન') || u.includes('टन')) return 'ton';
  return KG_PER_UNIT[u] ? u : 'mann';
};

/**
 * Convert an amount from one weighing unit to another
 * @param {number|string} amount - Weight value
 * @param {string} fromUnit - 'mann' | 'quintal' | 'kg' | 'ton'
 * @param {string} toUnit - 'mann' | 'quintal' | 'kg' | 'ton'
 * @returns {number} Converted weight rounded to up to 2 decimal places
 */
export const convertWeight = (amount, fromUnit = 'quintal', toUnit = 'mann') => {
  const val = parseFloat(amount);
  if (isNaN(val) || val === 0) return 0;

  const fromKey = normalizeWeightUnit(fromUnit);
  const toKey = normalizeWeightUnit(toUnit);
  if (fromKey === toKey) return val;

  const fromKg = KG_PER_UNIT[fromKey] || 100;
  const toKg = KG_PER_UNIT[toKey] || 20;

  const converted = (val * fromKg) / toKg;
  return Math.round(converted * 100) / 100;
};

/**
 * Convert Mandi Rate (₹ per unit) between weighing units
 * Rate is price per unit (₹/unit).
 * E.g., ₹2500/Quintal = ₹500/Mann (since 1 Qtl = 5 Mann)
 * @param {number|string} rate - Price in ₹ per unit
 * @param {string} fromUnit - Unit the rate is priced in
 * @param {string} toUnit - Target unit
 * @returns {number}
 */
export const convertMandiRate = (rate, fromUnit = 'quintal', toUnit = 'mann') => {
  const val = parseFloat(rate);
  if (isNaN(val) || val === 0) return 0;

  const fromKey = normalizeWeightUnit(fromUnit);
  const toKey = normalizeWeightUnit(toUnit);
  if (fromKey === toKey) return val;

  const fromKg = KG_PER_UNIT[fromKey] || 100;
  const toKg = KG_PER_UNIT[toKey] || 20;

  const ratePerKg = val / fromKg;
  const converted = ratePerKg * toKg;
  return Math.round(converted * 100) / 100;
};

const UNIT_LABELS = {
  mann: {
    gu: { short: 'મણ', full: 'મણ / Mann (૨૦ કિલો)' },
    hi: { short: 'मन', full: 'मन / Mann (20 किग्रा)' },
    mr: { short: 'मण', full: 'मण / Mann (२० किलो)' },
    en: { short: 'Mann', full: 'Mann / Maann (20 kg)' }
  },
  quintal: {
    gu: { short: 'ક્વિન્ટલ', full: 'ક્વિન્ટલ (૧૦૦ કિલો)' },
    hi: { short: 'क्विंटल', full: 'क्विंटल (100 किग्रा)' },
    mr: { short: 'क्विंटल', full: 'क्विंटल (१०० किलो)' },
    en: { short: 'Qtl', full: 'Quintal (100 kg)' }
  },
  kg: {
    gu: { short: 'કિલો', full: 'કિલોગ્રામ (૧ કિલો)' },
    hi: { short: 'किग्रा', full: 'किलोग्राम (1 किग्रा)' },
    mr: { short: 'किलो', full: 'किलोग्राम (१ किलो)' },
    en: { short: 'Kg', full: 'Kilogram (1 kg)' }
  },
  ton: {
    gu: { short: 'ટન', full: 'મેટ્રિક ટન (૧૦૦૦ કિલો)' },
    hi: { short: 'टन', full: 'मीट्रिक टन (1000 किग्रा)' },
    mr: { short: 'टन', full: 'मेट्रिक टन (१००० किलो)' },
    en: { short: 'Ton', full: 'Metric Ton (1000 kg)' }
  }
};

/**
 * Get display label for a weighing unit in user's current language
 * @param {string} unit - 'mann' | 'quintal' | 'kg' | 'ton'
 * @param {string} lang - 'gu' | 'hi' | 'mr' | 'en'
 * @param {'short'|'full'} format - Display style
 * @returns {string}
 */
export const getWeightUnitLabel = (unit = 'mann', lang = 'gu', format = 'short') => {
  const norm = normalizeWeightUnit(unit);
  const langKey = ['gu', 'hi', 'mr', 'en'].includes(lang) ? lang : 'gu';
  const entry = UNIT_LABELS[norm] || UNIT_LABELS.mann;
  return entry[langKey]?.[format] || entry.en[format] || norm;
};

/**
 * Convenience helper to format a weight nicely
 * E.g., 2600 -> "2,600 મણ"
 */
export const formatWeightDisplay = (amount, unit = 'mann', lang = 'gu') => {
  const val = parseFloat(amount) || 0;
  const formattedVal = val.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  const label = getWeightUnitLabel(unit, lang, 'short');
  return `${formattedVal} ${label}`;
};

