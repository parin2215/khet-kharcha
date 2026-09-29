/**
 * Khet Kharcha — Voice Expense Parser
 *
 * Turns a spoken/transcribed expense phrase into structured transaction fields.
 * Deliberately dependency-free and platform-agnostic so it can be unit tested
 * without a microphone, and reused by both the mobile recorder and any future
 * WhatsApp bot.
 *
 * Example inputs (Hindi, Gujarati, Marathi, English, and mixed/ASR-noisy):
 *   "diesel do hazaar rupaye"        -> { amount: 2000, category: 'diesel' }
 *   "khet ka khad aur 1500"          -> { amount: 1500, category: 'fertilizer' }
 *   "majdoori 500 per din"            -> { amount: 500,  category: 'labour' }
 */

// Hindi/Urdu number words -> value. Covers 0-99 plus common scales.
const NUMBER_WORDS = {
  zero: 0, ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9,
  das: 10, gyara: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, saatrah: 17,
  atharah: 18, unnees: 19, bees: 20, ekis: 21, baees: 22, tees: 23, chaubis: 24, pachis: 25,
  chhabis: 26, sattais: 27, athais: 28, untees: 29, tiris: 30, ektees: 31, baitis: 32,
  taitis: 33, chauntis: 34, pachtees: 35, chhatees: 36, saitees: 37, athatees: 38, untees: 39,
  chaalis: 40, ekalasi: 41, beyalasi: 42, teyalasi: 43, chavalasi: 44, pachasi: 45,
  chhahasi: 46, sattasi: 47, asasi: 48, unas: 49, pachas: 50, ekawan: 51, baawan: 52,
  tewan: 53, chahawan: 54, pachawan: 55, chhawan: 56, sattawan: 57, atawan: 58, unawan: 59,
  saath: 60, ekasath: 61, baasath: 62, teyasath: 63, chauhath: 64, pachasath: 65, chhahath: 66,
  sattahath: 67, athahath: 68, unahath: 69, sattar: 70, ekasattar: 71, basattar: 72,
  teyattar: 73, chauhattar: 74, pachattar: 75, chhahattar: 76, sattattar: 77, atthattar: 78,
  unattar: 79, assi: 80, ekassi: 81, baassi: 82, teyassi: 83, chauhassi: 84, pachassi: 85,
  chhahassi: 86, sattassi: 87, atassi: 88, unassi: 89, navabbe: 90, ekannabbe: 91, baannabbe: 92,
  teyannabbe: 93, chauhannabbe: 94, pachannabbe: 95, chhahannabbe: 96, sattanabbe: 97, athanabbe: 98,
  unattabbe: 99,
  // scales
  pachaas: 50, sau: 100, shaur: 100, pachas: 100,
  hazaar: 1000, hazar: 1000,
  lakh: 100000, lac: 100000,
  crore: 10000000, karod: 10000000,
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, lakhs: 100000,
};

// Gujarati / Marathi number words layered on top.
const REGIONAL_NUMBER_WORDS = {
  // Gujarati
  ek: 1, be: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nav: 9,
  das: 10, ekadash: 11, barah: 12, teerah: 13, chauh: 14, panash: 15, chhad: 16, saathe: 17,
  ath: 18, ekash: 19, vish: 20, ekvish: 21, bevish: 22, tevish: 23, chauvish: 24, pachvish: 25,
  chhabvish: 26, sattvish: 27, athvish: 28, unatvish: 29, tri: 30, chautri: 40, pachas: 50,
  shash: 60, sattar: 70, assi: 80, navo: 90, sau: 100, hazar: 1000, lakh: 100000,
  // Marathi
  ek: 1, don: 2, teen: 3, char: 4, panch: 5, sah: 6, saat: 7, aath: 8, nau: 9,
  das: 10, ekada: 11, barah: 12, teerah: 13, chaudah: 14, pandrah: 15, solah: 16, saatrah: 17,
  aathrah: 18, ekun: 19, viñ: 20, ekviñ: 21, beviñ: 22, teviñ: 23, chaiviñ: 24, pachiñ: 25,
  chhawiñ: 26, sattawiñ: 27, athawiñ: 28, unatawiñ: 29,ती: 30, tees: 30, chautis: 40,
  पन्नास: 50, साठ: 60, सत्तर: 70, ऐंशी: 80, नव्वद: 90, शंभर: 100, हजार: 1000, लाख: 100000,
};

// Category synonyms across all four languages -> canonical category id.
const CATEGORY_SYNONYMS = {
  diesel: ['diesel', 'diesel/', 'fuel', 'petrol', 'डीजल', 'डिझेल', 'इंधन', 'ડીઝલ', 'ઇંધન', 'डिझेल'],
  fertilizer: ['fertilizer', 'fertiliser', 'urea', 'khet ka khad', 'khad', 'खाद', 'उर्वरक', 'ખાત', 'દવા', 'खत'],
  pesticide: ['pesticide', 'spray', 'insecticide', 'keetNashak', 'कीटनाशक', 'જંતુનાશક', 'फवारणी'],
  seeds: ['seed', 'seeds', 'beej', 'बीज', 'બીજ', 'बियाणे'],
  electricity: ['electricity', 'electric', 'bijli', 'current', 'बिजली', 'विद्युत', 'બિજળી', 'વીજળી'],
  irrigation: ['irrigation', 'water', 'pump', 'sinchai', 'सिंचाई', 'पानी', 'સિંચાઈ', 'પાણી'],
  labour: ['labour', 'labor', 'majdoor', 'mazdoor', 'worker', 'मजदूर', 'मजुर', 'મજૂર', 'कामदार'],
  machinery: ['tractor', 'machinery', 'harrow', 'rotavator', 'cultivator', 'ट्रैक्टर', 'ट्राक्टर', 'यंत्र', 'ટ્રેક્ટર'],
  transport: ['transport', 'truck', 'tempo', 'auto', 'rickshaw', 'lorry', 'गाड़ी', 'ट्रक', 'વાહન', 'ટ્રક'],
  market: ['market', 'mandi', 'commission', 'bazaar', 'मंडी', 'बाजार', 'બજાર', 'મંડી'],
  loan_interest: ['loan interest', 'byaj', 'interest', 'ब्याज', 'વ્યાજ'],
  equipment_repair: ['repair', 'workshop', 'mechanic', 'maint', 'मरम्मत', 'મરામત'],
  packaging: ['packing', 'packaging', 'bag', 'bori', 'पैकिंग', 'थैली', 'પેકિંગ', 'થેલી'],
  crop_insurance: ['insurance', 'bima', 'फसल बीमा', 'વીમા', 'बीमा'],
};

const EXPENSE_TYPE_HINTS = {
  partner: ['partner', 'partner ka', 'batai', 'jodi', 'साझेदार', 'ભાગીદાર', 'बाटाई', 'જોડી'],
  own: ['own', 'apna', 'khud ka', 'अपना', 'પોતાનું', 'स्वयं', 'સ્વતંत्र'],
};

/** Normalize text: lowercase, strip diacritics/punctuation, collapse whitespace. */
export const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    // Devanagari vowel signs (matras) carry no consonant information for matching.
    .replace(/[ऀ-ॿ]/g, (ch) => {
      // Keep digits/independent vowels, drop dependent matras.
      return /[ऀ-ॎ]/.test(ch) ? ch : '';
    })
    // Protect digit-grouping commas ("12,500") and decimal points ("2000.50")
    // before punctuation is flattened to spaces, otherwise 2000.50 becomes 2000.
    .replace(/(\d),(\d)/g, '$1\u0000$2')
    .replace(/(\d)\.(\d)/g, '$1\u0001$2')
    .replace(/[,.!?;:"'`]/g, ' ')
    .replace(/\u0000/g, ',')
    .replace(/\u0001/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Parse a spoken amount.
 * Handles digits ("2000", "2,000"), Hindi/English number words
 * ("do hazaar", "one thousand five hundred"), and multipliers.
 * @param {string} text
 * @returns {number|null}
 */
export const parseAmount = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  // 1. Plain digits win: 2,000 / 2000 / ₹2000 / 2000.50
  //    Grouped forms must be matched first, otherwise "12,500" yields 12.
  //    Indian grouping is 2,2,3 (1,20,000 = 1 lakh 20 thousand), so it needs its
  //    own pattern ahead of the western one, which would otherwise match "20,000".
  const digitMatch = normalized.match(/(\d{1,2}(?:,\d{2})+(?:,\d{3})+(?:\.\d+)?|\d+(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/)
    || normalized.match(/(?:^|\s)(?:rs\.?|rupees?|inr|rupaye|rupaiya)?\s*(\d+(?:\.\d+)?)(?:\s|$)/)
    || normalized.match(/(\d+(?:\.\d+)?)/);
  if (digitMatch) {
    const value = parseFloat(digitMatch[1].replace(/,/g, ''));
    if (!isNaN(value) && value > 0) return value;
  }

  // 2. Number words, scanned left-to-right and summed with multipliers.
  const words = normalized.split(' ').filter(Boolean);
  const table = { ...NUMBER_WORDS, ...REGIONAL_NUMBER_WORDS };

  let total = 0;
  let current = 0;
  let matchedAny = false;

  for (const word of words) {
    const value = table[word];
    if (value === undefined) continue;
    matchedAny = true;

    if (value === 100) {
      // "sau" doubles the preceding value: "teen sau" = 300
      current = (current === 0 ? 1 : current) * 100;
    } else if (value === 1000) {
      current = (current === 0 ? 1 : current) * 1000;
    } else if (value === 100000) {
      current = (current === 0 ? 1 : current) * 100000;
    } else if (value === 10000000) {
      total += (current === 0 ? 1 : current) * 10000000;
      current = 0;
    } else {
      current += value;
    }

    // Flush when a scale word completes a group (e.g. "teen hazaar" -> 3000).
    if (value >= 1000) {
      total += current;
      current = 0;
    }
  }
  total += current;

  if (matchedAny && total > 0) return total;
  return null;
};

/**
 * Detect the expense category from free text.
 * @param {string} text
 * @returns {string|null} canonical category id
 */
export const parseCategory = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  // The last thing mentioned is the most specific ("tractor ka diesel" -> diesel),
  // so prefer the match that occurs latest in the utterance; break ties on length.
  let best = null;
  let bestIndex = -1;
  let bestLength = 0;

  for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const synonym of synonyms) {
      const needle = normalizeText(synonym);
      if (!needle) continue;
      const index = normalized.indexOf(needle);
      if (index === -1) continue;
      if (index > bestIndex || (index === bestIndex && needle.length > bestLength)) {
        best = category;
        bestIndex = index;
        bestLength = needle.length;
      }
    }
  }
  return best;
};

/**
 * Detect whether the expense is the owner's or a partner's share.
 * @param {string} text
 * @returns {'own'|'partner'|null}
 */
export const parseExpenseType = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  for (const synonym of EXPENSE_TYPE_HINTS.partner) {
    if (normalized.includes(normalizeText(synonym))) return 'partner';
  }
  for (const synonym of EXPENSE_TYPE_HINTS.own) {
    if (normalized.includes(normalizeText(synonym))) return 'own';
  }
  return null;
};

/** Detect an explicit farm name or a "which farm" style phrase. */
export const parseFarmHint = (text) => {
  const normalized = normalizeText(text);
  const match = normalized.match(/(?:khet|khet ka|farm|field|gaon|gaon ka)\s+([a-zऀ-ॿ]{2,})/);
  return match ? match[1] : null;
};

/**
 * Parse a full spoken expense phrase.
 * @param {string} text - transcript of the utterance
 * @param {Object} [options]
 * @param {string} [options.defaultCategory] - used when nothing is detected
 * @param {number} [options.defaultFarmId]
 * @returns {{
 *   amount: number|null,
 *   category: string|null,
 *   expenseType: 'own'|'partner'|null,
 *   farmHint: string|null,
 *   confidence: number,
 *   transcript: string
 * }}
 */
export const parseVoiceExpense = (text, options = {}) => {
  const transcript = String(text || '');
  const amount = parseAmount(transcript);
  const category = parseCategory(transcript) || options.defaultCategory || null;
  const expenseType = parseExpenseType(transcript);
  const farmHint = parseFarmHint(transcript);

  // Confidence reflects how much we actually recognised, not model probability.
  let confidence = 0;
  if (amount !== null) confidence += 0.6;
  if (category) confidence += 0.3;
  if (expenseType) confidence += 0.05;
  if (farmHint) confidence += 0.05;
  confidence = Math.min(1, Math.round(confidence * 100) / 100);

  return {
    amount,
    category,
    expenseType,
    farmHint,
    confidence,
    transcript: transcript.trim(),
    // Ready to drop into AddExpense's payload once a farm is chosen.
    isValid: amount !== null && amount > 0 && Boolean(category),
  };
};

export default parseVoiceExpense;