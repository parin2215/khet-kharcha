/**
 * Khet Kharcha — Mandi Rate Advisory
 *
 * Compares a recorded crop sale against a reference mandi rate so the farmer
 * can see whether they got a fair price. Rates are indicative bands sourced from
 * published MSP / typical mandi ranges and are meant as a sanity check, not a
 * live feed. Callers should refresh these over time or wire in a real feed.
 */

/** Indicative reference rates (₹ per quintal) for common crops. */
export const MANDI_RATES = {
  wheat: { min: 2100, max: 2600, msp: 2275, label: 'Gehun / Wheat' },
  rice: { min: 1800, max: 2600, msp: 2300, label: 'Dhan / Paddy' },
  cotton: { min: 6000, max: 8100, msp: 7121, label: 'Kapaas / Cotton' },
  sugarcane: { min: 2800, max: 3600, msp: 3400, label: 'Ikshu / Sugarcane' },
  groundnut: { min: 5000, max: 6800, msp: 6783, label: 'Singdana / Groundnut' },
  soybean: { min: 4000, max: 5200, msp: 5328, label: 'Soybean' },
  maize: { min: 1800, max: 2400, msp: 2225, label: 'Bhuta / Maize' },
  tur: { min: 6000, max: 9500, msp: 8000, label: 'Toor / Tur Dal' },
  moong: { min: 5500, max: 8500, msp: 8768, label: 'Moong' },
  bajra: { min: 1800, max: 2600, msp: 2775, label: 'Bajra' },
  jowar: { min: 2400, max: 3600, msp: 3299, label: 'Jowar' },
};

/** Normalize a crop name so "Gehun", "wheat", "WHEAT " all match. */
const CROP_ALIASES = {
  wheat: ['wheat', 'gehun', 'gehu', 'godhi'],
  rice: ['rice', 'paddy', 'dhan', 'dhaan'],
  cotton: ['cotton', 'kapaas', 'kapas'],
  sugarcane: ['sugarcane', 'sugar cane', 'ikshu'],
  groundnut: ['groundnut', 'ground nut', 'singdana', 'shingdana'],
  soybean: ['soybean', 'soyabean', 'soya'],
  maize: ['maize', 'corn', 'bhuta', 'makka'],
  tur: ['tur', 'tur dal', 'toor', 'toor dal', 'arhar'],
  moong: ['moong', 'moong dal'],
  bajra: ['bajra', 'bajri', 'pearl millet'],
  jowar: ['jowar', 'jowari', 'sorghum'],
};

/**
 * Look up the reference rate band for a crop.
 * @param {string} crop
 * @returns {Object|null} { id, label, min, max, msp }
 */
export const getMandiRate = (crop) => {
  if (!crop) return null;
  const needle = String(crop).toLowerCase().trim();
  for (const [id, aliases] of Object.entries(CROP_ALIASES)) {
    if (aliases.some((a) => needle === a || needle.includes(a))) {
      return { id, ...MANDI_RATES[id] };
    }
  }
  return null;
};

/**
 * Advise on a crop sale: was the realised rate fair?
 * @param {Object} sale - { crop, quantity, unit, amount, mandiRate }
 * @returns {Object} advisory
 */
export const analyzeSale = (sale = {}) => {
  const crop = sale.crop || sale.cropName || '';
  const reference = getMandiRate(crop);
  const quantity = parseFloat(sale.quantity ?? sale.totalYield) || 0;
  const amount = parseFloat(sale.amount ?? sale.totalSaleAmount) || 0;
  const unit = (sale.unit || sale.yieldUnit || 'quintal').toLowerCase();

  const result = {
    crop,
    unit,
    quantity,
    amount,
    reference,
    realizedRate: null,
    benchmarkRate: null,
    difference: 0,
    differencePercent: 0,
    verdict: 'unknown',
    message: '',
  };

  if (!reference || quantity <= 0 || amount <= 0) {
    result.verdict = 'unknown';
    result.message = reference
      ? 'Enter a quantity and sale amount to compare against the mandi rate.'
      : `No reference rate available for "${crop || 'this crop'}".`;
    return result;
  }

  // Normalise the realised rate to ₹/quintal for comparison.
  // 1 quintal = 100 kg = 0.1 ton, so convert the total into "quintals sold"
  // before dividing. Dividing by 10 for kg would understate the per-quintal rate.
  const quintalsPerUnit = { quintal: 1, kg: 0.01, ton: 10 }[unit] ?? 1;
  const realized = amount / (quantity * quintalsPerUnit);

  // Benchmark = midpoint of the indicative band (or MSP when known).
  const benchmark = reference.msp || Math.round((reference.min + reference.max) / 2);

  result.realizedRate = Math.round(realized);
  result.benchmarkRate = benchmark;
  result.difference = Math.round(realized - benchmark);
  result.differencePercent = benchmark > 0 ? Math.round(((realized - benchmark) / benchmark) * 1000) / 10 : 0;

  const pct = result.differencePercent;
  if (pct >= 5) {
    result.verdict = 'good';
    result.message = `Sold ${Math.abs(pct)}% above the ${reference.label} reference rate.`;
  } else if (pct <= -5) {
    result.verdict = 'low';
    result.message = `Sold ${Math.abs(pct)}% below the ${reference.label} reference rate (₹${result.difference} per quintal).`;
  } else {
    result.verdict = 'fair';
    result.message = `Price is in line with the ${reference.label} reference rate.`;
  }

  return result;
};

export default analyzeSale;