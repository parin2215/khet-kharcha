/**
 * Khet Kharcha — Utility Functions
 * Shared between mobile and web apps
 */

/**
 * Format amount in Indian Rupee notation (₹1,25,000)
 * @param {number} amount
 * @returns {string}
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format amount with decimals
 * @param {number} amount
 * @returns {string}
 */
export const formatINRDecimal = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date in Indian format (DD/MM/YYYY)
 * @param {Date|import('firebase/firestore').Timestamp} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date as relative text (e.g., "2 days ago", "Today")
 * @param {Date|import('firebase/firestore').Timestamp} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Future dates must never render as "N days ago".
  if (diffDays < 0) {
    const ahead = Math.abs(diffDays);
    if (ahead === 0) return 'Today';
    if (ahead === 1) return 'Tomorrow';
    if (ahead < 7) return `In ${ahead} days`;
    if (ahead < 30) return `In ${Math.floor(ahead / 7)} weeks`;
    if (ahead < 365) return `In ${Math.floor(ahead / 30)} months`;
    return `In ${Math.floor(ahead / 365)} years`;
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format days remaining (for reminders)
 * @param {Date|import('firebase/firestore').Timestamp} dueDate
 * @returns {{ text: string, status: 'overdue'|'today'|'upcoming' }}
 */
export const formatDaysRemaining = (dueDate) => {
  if (!dueDate) return { text: '', status: 'upcoming' };
  const d = dueDate?.toDate ? dueDate.toDate() : new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffMs = d - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, status: 'overdue' };
  if (diffDays === 0) return { text: 'Due today', status: 'today' };
  if (diffDays === 1) return { text: 'Due tomorrow', status: 'upcoming' };
  return { text: `${diffDays} days left`, status: 'upcoming' };
};

/**
 * Get month name
 * @param {number} month - 0-11
 * @param {string} [lang='en']
 * @returns {string}
 */
export const getMonthName = (month, lang = 'en') => {
  const date = new Date(2024, month, 1);
  return date.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long' });
};

/**
 * Get bill month display string
 * @param {string} billMonth - "YYYY-MM" format
 * @returns {string}
 */
export const formatBillMonth = (billMonth) => {
  if (!billMonth) return '';
  const [year, month] = billMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

/**
 * Validate Indian phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidIndianPhone = (phone) => {
  if (!phone) return false;
  let cleaned = String(phone).replace(/\D/g, '');
  // Tolerate a leading country code so "+91 98765 43210" validates like "9876543210".
  if (cleaned.length === 12 && cleaned.startsWith('91')) cleaned = cleaned.slice(2);
  else if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Generate a bill month string from a date
 * @param {Date} date
 * @returns {string} "YYYY-MM"
 */
export const toBillMonth = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};


/**
 * Format a Date as a local "YYYY-MM-DD" string.
 * Avoids toISOString(), which shifts to UTC and mis-dates entries for IST users
 * (anything logged between 00:00 and 05:30 IST lands on the previous day).
 * @param {Date} [date]
 * @returns {string}
 */
export const toLocalDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Parse a "YYYY-MM-DD" string into a local Date at midnight.
 * `new Date('2026-09-28')` is parsed as UTC midnight, which renders as the
 * previous day in IST — always build the Date from local parts instead.
 * @param {string} dateString
 * @returns {Date|null}
 */
export const parseLocalDateString = (dateString) => {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateString).trim());
  if (!match) {
    const fallback = new Date(dateString);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, m, d] = match;
  const parsed = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(parsed.getTime()) ? null : parsed;
};
/**
 * Convert area between units
 * @param {number} value
 * @param {string} fromUnit - bigha | acre | hectare
 * @param {string} toUnit - bigha | acre | hectare
 * @returns {number}
 */
export const convertArea = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;

  // Convert to hectare first
  const toHectare = {
    bigha: 0.1012, // 1 bigha ≈ 0.1012 hectare (Gujarat standard)
    acre: 0.4047,
    hectare: 1,
  };

  const fromHectare = {
    bigha: 1 / 0.1012,
    acre: 1 / 0.4047,
    hectare: 1,
  };

  const hectares = value * (toHectare[fromUnit] || 1);
  const converted = hectares * (fromHectare[toUnit] || 1);
  // Keep 4 decimals so small land areas (1 bigha = 0.1012 ha) survive the round trip.
  return Math.round(converted * 10000) / 10000;
};

/**
 * Calculate a partner's cost split on a farm
 * @param {number} totalCost - total farm expense for the period
 * @param {number} sharePercent - partner's share of the crop (0-100)
 * @param {number} totalPaid - amount the partner has already paid/credited
 * @returns {{ due: number, paid: number, balance: number }}
 *   balance > 0 means the partner still owes; balance < 0 means the owner owes the partner.
 */
export const calculateSettlement = (totalCost, sharePercent, totalPaid = 0) => {
  const cost = parseFloat(totalCost) || 0;
  const percent = Math.min(100, Math.max(0, parseFloat(sharePercent) || 0));
  const paid = parseFloat(totalPaid) || 0;

  const due = Math.round(cost * (percent / 100) * 100) / 100;
  const balance = Math.round((due - paid) * 100) / 100;

  return { due, paid, balance };
};

/**
 * Calculate a final harvest settlement between owner and a batai partner.
 * Handles both a cash valuation (mandi rate) and an in-crop (physical yield) split.
 * @param {Array} expenses - farm expenses
 * @param {Object} partner - partner record (sharePercent / terms.cropSharePercent)
 * @param {Object} harvest - { totalYield, mandiRate, totalSaleAmount }
 * @returns {Object} settlement breakdown
 */
export const calculateTermsSettlement = (expenses, partner, harvest = {}) => {
  const list = Array.isArray(expenses) ? expenses : [];

  const totalFarmExpense = list.reduce((sum, exp) => {
    if (exp?.loanDirection) return sum; // loans are capital, not a cost
    return sum + (parseFloat(exp?.amount) || 0);
  }, 0);

  const partnerSharePercent =
    parseFloat(partner?.terms?.cropSharePercent) ||
    parseFloat(partner?.sharePercent) ||
    50;

  const totalYield = parseFloat(harvest.totalYield) || 0;
  const mandiRate = parseFloat(harvest.mandiRate) || 0;
  const totalSaleAmount = parseFloat(harvest.totalSaleAmount) || 0;

  // Value the crop: prefer the realised sale amount, else yield x rate.
  const cropValue = totalSaleAmount > 0 ? totalSaleAmount : totalYield * mandiRate;

  const partnerCropDue = (cropValue * partnerSharePercent) / 100;
  const partnerExpenseDue = (totalFarmExpense * partnerSharePercent) / 100;
  const partnerBalance = partnerExpenseDue;

  // Positive => owner owes partner (partner is ahead). Negative => partner owes owner.
  const netSettlement =
    Math.round((partnerCropDue - partnerExpenseDue - (parseFloat(partner?.totalPaid) || 0)) * 100) / 100;

  return {
    cropSharePercent: partnerSharePercent,
    totalFarmExpense: Math.round(totalFarmExpense * 100) / 100,
    estimatedCropShare: Math.round(partnerCropDue * 100) / 100,
    partnerCropDue: Math.round(partnerCropDue * 100) / 100,
    partnerBalance: Math.round(partnerBalance * 100) / 100,
    netSettlement,
  };
};
