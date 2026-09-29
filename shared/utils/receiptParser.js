/**
 * Khet Kharcha — Receipt Prefill Parser
 *
 * Extracts amount / date / merchant / category out of a receipt photo's text so the
 * Add-Expense form can be filled in for the user. Intentionally dependency-free:
 * it consumes text the user pastes in (or that a future OCR/cloud-vision step
 * supplies), which keeps the core unit-testable without pulling in a vision SDK.
 *
 * Typical usage:
 *   parseReceiptText("Bijli Bill\nConsumer No 1234\nAmount Rs. 2450.00\nDate 04-11-2025")
 *   // -> { amount: 2450, date: '2025-11-04', category: 'electricity', ... }
 */

import { normalizeText, parseAmount, parseCategory } from './voiceExpense.js';
import { parseLocalDateString } from './helpers.js';

const MONTHS = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
  september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

// Words that mark the true total on a receipt. Order = priority.
const TOTAL_HINTS = [
  'grand total', 'amount payable', 'amount due', 'net payable', 'total amount',
  'total payable', 'payable', 'amount paid', 'bill total', 'total',
];

// Words that mark a partial/subtotal line we must NOT mistake for the total.
const NOISE_HINTS = [
  'sub total', 'subtotal', 'tax', 'gst', 'cgst', 'sgst', 'igst', 'vat',
  'discount', 'round off', 'roundoff', 'saving', 'saved', 'delivery charge',
  'shipping', 'advance', 'due amount', 'previous balance',
];

// Lines that are identifiers, not money. Their digits are serial/reference
// numbers ("Bill No: 4471") and must never be mistaken for the amount payable.
const ID_LINE = /\b(bill|inv|invoice|receipt|challan|order|transaction|txn|utr|rrn|cheque|chq|serial|sl)\s*(no|number|#)\b|consumer\s*(no|number|id)|account\s*(no|number)|a\/c|mobile|phone|gstin|pan\b|customer\s*id|driver|meter\s*(no|reading)/i;

// Hints are grouped into specificity tiers. Within a receipt, the *purpose* of
// the bill beats the *equipment* named on it: a "Tractor Repair" invoice is a
// repair job, not transport; a "Diesel Pump" purchase is fuel, not irrigation.
// Tier 0 is the most decisive, tier 2 the weakest.
const RECEIPT_CATEGORY_HINTS = {
  electricity: { tier: 0, hints: ['electricity bill', 'electric bill', 'electricity', 'bijli bill', 'bijli', 'vidyut', 'torrent', 'adani', 'mseb', 'kota power', 'viaduct'] },
  diesel: { tier: 0, hints: ['diesel', 'petrol', 'fuel', 'hpcl', 'iocl', 'bharat petroleum', 'jio bp', 'nayara', 'ડીઝલ', 'पेट्रोल'] },
  fertilizer: { tier: 0, hints: ['fertilizer', 'urea', 'dap', 'mop', 'khet khad', 'khad', 'kisan khad', 'multiplex', 'zari', 'ifc', 'खाद', 'ખાત'] },
  seeds: { tier: 0, hints: ['seeds', 'seed', 'beej', 'national seeds', 'kisan seeds', 'बीज', 'બીજ'] },
  pesticide: { tier: 0, hints: ['pesticide', 'insecticide', 'weedicide', 'keetnashak', 'spray', 'कीटनाशक'] },
  equipment_repair: { tier: 0, hints: ['repair', 'servicing', 'workshop', 'garage', 'mechanic', 'maintenance', 'मरम्मत', 'મરામત'] },
  market: { tier: 0, hints: ['mandi', 'market', 'apmc', 'commission', 'bazaar', 'मंडी', 'बाजार'] },
  labour: { tier: 1, hints: ['labour', 'labor', 'majdoor', 'mazdoor', 'wages', 'वेतन', 'मजदूर'] },
  packaging: { tier: 1, hints: ['packing', 'packaging', 'jute', 'bori', 'पैकिंग'] },
  transport: { tier: 1, hints: ['transport', 'truck', 'tempo', 'towing', 'lorry', 'freight', 'गाड़ी', 'ટ્રક'] },
  irrigation: { tier: 1, hints: ['irrigation', 'borewell', 'sinchai', 'water bill', 'पानी', 'પાણી'] },
  machinery: { tier: 2, hints: ['tractor', 'machinery', 'rotavator', 'cultivator', 'harrow', 'implements', 'tiller', 'pump'] },
  other: { tier: 3, hints: [] },
};

/**
 * Parse an explicit dd-mm-yyyy / dd/mm/yyyy date found in receipt text.
 * Returns an ISO YYYY-MM-DD string, or null.
 */
export const parseReceiptDate = (text) => {
  if (!text) return null;
  const source = String(text);

  // ISO first: 2025-11-04
  const iso = source.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return toIso(iso[1], iso[2], iso[3]);

  // dd-mm-yyyy / dd/mm/yyyy (Indian receipt convention is dd-mm-yyyy)
  const dmy = source.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
  if (dmy) return toIso(dmy[3], dmy[2], dmy[1]);

  // 4 Nov 2025 / 04 November 2025
  const named = source.match(/\b(\d{1,2})\s+([a-zA-Z]{3,9})\.?\s+(20\d{2})\b/);
  if (named) {
    const month = MONTHS[String(named[2]).slice(0, 3).toLowerCase()];
    if (month !== undefined) return toIso(named[3], month + 1, named[1]);
  }

  // Nov 4, 2025
  const named2 = source.match(/\b([a-zA-Z]{3,9})\.?\s+(\d{1,2}),?\s+(20\d{2})\b/);
  if (named2) {
    const month = MONTHS[String(named2[1]).slice(0, 3).toLowerCase()];
    if (month !== undefined) return toIso(named2[3], month + 1, named2[2]);
  }

  return null;
};

function toIso(year, month, day) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Find the "total" line and read its amount, ignoring tax/subtotal noise.
 */
const findTotal = (text) => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // Lines that could plausibly carry a payable amount.
  const moneyLines = lines.filter((line) => !ID_LINE.test(line));

  // 1. Prefer an explicitly labelled total line.
  for (const hint of TOTAL_HINTS) {
    for (const line of moneyLines) {
      const normalized = normalizeText(line);
      if (!normalized.includes(hint)) continue;
      if (NOISE_HINTS.some((noise) => normalized.includes(noise))) continue;
      const value = parseAmount(line);
      if (value !== null) return value;
    }
  }

  // 2. An explicit "amount" line is next best.
  for (const line of moneyLines) {
    const normalized = normalizeText(line);
    if (!/\bamount\b/.test(normalized)) continue;
    if (NOISE_HINTS.some((noise) => normalized.includes(noise))) continue;
    const value = parseAmount(line);
    if (value !== null) return value;
  }

  // 3. No label at all: take the largest currency figure on the receipt, which
  //    for agri bills is reliably the amount payable. Identifier lines are
  //    excluded so a large serial number cannot masquerade as the total.
  const amounts = moneyLines
    .map((line) => parseAmount(line))
    .filter((v) => v !== null && v > 0);
  if (amounts.length > 0) return Math.max(...amounts);

  return null;
};

/**
 * Guess the merchant/issuer name: the first meaningful line that is not a
 * boilerplate label (bill, receipt, invoice, tax invoice) or a bare number.
 */
const findMerchant = (text) => {
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Pure form labels carry no issuer name. A header such as "Bijli Bill" or
  // "Kisan Khad Bhandar" is a real issuer, so it is deliberately NOT excluded.
  const boilerplate = /^(?:tax\s*)?(?:bill|receipt|invoice|quotation|estimate|statement|khata|challan|document|copy|original|duplicate|s\.?no)\s*(?:no\.?|number|#)?\s*[:\-]?\s*\d*\s*$/i;

  for (const line of lines) {
    if (line.length < 3) continue;
    if (boilerplate.test(line)) continue;
    if (ID_LINE.test(line)) continue;
    if (/^(date|bill\s*date|dated|issued\s*on|valid\s*upto|valid\s*till|due\s*date|period|month|year)\b/i.test(line)) continue;
    if (/^[\d\s,./:₹$#-]+$/.test(line)) continue; // pure numbers/labels
    // A money line carries a currency/total keyword AND ends in a figure. A real
    // issuer name does not ("Bijli Bill" has no digits; "HPCL Diesel Pump" neither).
    const isMoneyLine = /[\d]/.test(line)
      && (TOTAL_HINTS.some((hint) => normalizeText(line).includes(hint))
          || /(?:rs\.?|rupees|inr|₹)\s*[\d,]/i.test(line)
          || /^(?:amount|total|amt|value|bill\s*amount|paid|rate|qty|quantity|unit\s*price)[.:\s]/i.test(line));
    if (isMoneyLine) continue;
    return line.replace(/\s+/g, ' ').trim().slice(0, 80);
  }
  return null;
};

/**
 * Infer a category from merchant-name style hints, falling back to the shared
 * voice keyword parser for the rest of the receipt body.
 */
const findCategory = (text, merchant) => {
  // The merchant/issuer line is the most reliable signal ("HPCL Diesel Pump"),
  // so it is searched on its own before falling back to the whole receipt body.
  // Score = specificity (longest matching hint wins), not position: a receipt
  // naming "HPCL Diesel Pump" is a fuel bill even though "pump" also appears,
  // and "Tractor Repair" is a repair job even though "tractor" also appears.
  const scan = (haystack) => {
    let best = null;
    let bestTier = Infinity;
    let bestLen = 0;
    for (const [category, def] of Object.entries(RECEIPT_CATEGORY_HINTS)) {
      for (const hint of def.hints) {
        if (!haystack.includes(hint)) continue;
        // Lower tier wins; within a tier the longer (more specific) hint wins.
        if (def.tier < bestTier || (def.tier === bestTier && hint.length > bestLen)) {
          best = category;
          bestTier = def.tier;
          bestLen = hint.length;
        }
      }
    }
    return best;
  };

  if (merchant) {
    const fromMerchant = scan(String(merchant).toLowerCase());
    if (fromMerchant) return fromMerchant;
  }

  const fromBody = scan(String(text).toLowerCase());
  if (fromBody) return fromBody;

  return parseCategory(text);
};

/**
 * Parse receipt text into Add-Expense form fields.
 *
 * @param {string} text Raw receipt / bill text (pasted, or produced by OCR).
 * @returns {{
 *   amount: number|null,
 *   date: string|null,      // YYYY-MM-DD
 *   merchant: string|null,
 *   category: string|null,
 *   confidence: 'high'|'medium'|'low',
 *   isValid: boolean,
 *   transcript: string
 * }}
 */
export const parseReceiptText = (text) => {
  const raw = text ? String(text).trim() : '';

  if (!raw) {
    return { amount: null, date: null, merchant: null, category: null, confidence: 'low', isValid: false, transcript: '' };
  }

  const amount = findTotal(raw);
  const date = parseReceiptDate(raw);
  const merchant = findMerchant(raw);
  const category = findCategory(raw, merchant);

  // Confidence reflects how much of the form we can confidently fill in.
  let score = 0;
  if (amount !== null) score += 2;
  if (date) score += 1;
  if (merchant) score += 1;
  if (category) score += 1;

  let confidence = 'low';
  if (score >= 5) confidence = 'high';
  else if (score >= 3) confidence = 'medium';

  return {
    amount: amount !== null && amount > 0 ? amount : null,
    date,
    merchant,
    category,
    confidence,
    isValid: amount !== null && amount > 0,
    transcript: raw,
  };
};

export default parseReceiptText;
