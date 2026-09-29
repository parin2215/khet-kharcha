/**
 * Khet Kharcha — Data Models & Enums
 * Shared between mobile and web apps
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENUMS (Frozen Objects)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const Season = Object.freeze({
  KHARIF: 'kharif',
  RABI: 'rabi',
  ZAID: 'zaid',
  YEAR_ROUND: 'year-round',
});

export const OwnershipType = Object.freeze({
  OWN: 'own',
  PARTNER: 'partner',
});

export const ExpenseType = Object.freeze({
  OWN: 'own',
  PARTNER: 'partner',
});

export const BillType = Object.freeze({
  ELECTRICITY: 'electricity',
  WATER: 'water',
  DIESEL: 'diesel',
  OTHER: 'other',
});

export const ReminderType = Object.freeze({
  BILL: 'bill',
  SPRAY: 'spray',
  FERTILIZER: 'fertilizer',
  HARVEST: 'harvest',
  LOAN: 'loan',
  OTHER: 'other',
});

export const Language = Object.freeze({
  HINDI: 'hi',
  GUJARATI: 'gu',
  MARATHI: 'mr',
  ENGLISH: 'en',
});

export const SizeUnit = Object.freeze({
  BIGHA: 'bigha',
  ACRE: 'acre',
  HECTARE: 'hectare',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPENSE CATEGORIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ExpenseCategory = Object.freeze({
  FERTILIZER: 'fertilizer',
  PESTICIDE: 'pesticide',
  SEEDS: 'seeds',
  ELECTRICITY: 'electricity',
  IRRIGATION: 'irrigation',
  LABOUR: 'labour',
  MACHINERY: 'machinery',
  DIESEL: 'diesel',
  TRANSPORT: 'transport',
  MARKET: 'market',
  LOAN_INTEREST: 'loan_interest',
  EQUIPMENT_REPAIR: 'equipment_repair',
  PACKAGING: 'packaging',
  CROP_INSURANCE: 'crop_insurance',
  OTHER: 'other',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA MODEL SHAPES (JSDoc for IDE support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string} name
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [photoURL]
 * @property {string} state - Indian state
 * @property {string} language - hi | gu | mr | en
 * @property {string} unitPreference - bigha | acre | hectare
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {import('firebase/firestore').Timestamp} lastLoginAt
 */

/**
 * @typedef {Object} Partner
 * @property {string} partnerId
 * @property {string} name
 * @property {string} phone
 * @property {number} sharePercent - 0 to 100
 */

/**
 * @typedef {Object} Farm
 * @property {string} [id] - Firestore document ID (set after creation)
 * @property {string} ownerId - uid of the farm owner
 * @property {string} name - e.g. "Ramji nu Khet"
 * @property {string} location - village/taluka name
 * @property {number} sizeValue
 * @property {string} sizeUnit - bigha | acre | hectare
 * @property {string} ownershipType - own | partner
 * @property {string} cropSeason - kharif | rabi | zaid | year-round
 * @property {string} currentCrop - e.g. "Wheat", "Cotton"
 * @property {Partner[]} partners
 * @property {boolean} active
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {string} [notes]
 */

/**
 * @typedef {Object} Expense
 * @property {string} [id]
 * @property {string} farmId
 * @property {string} ownerId
 * @property {string} category - one of ExpenseCategory values
 * @property {number} amount - in INR ₹
 * @property {string} expenseType - own | partner
 * @property {string} [partnerName] - if expenseType is partner
 * @property {import('firebase/firestore').Timestamp} date
 * @property {string} [note]
 * @property {string} [receiptURL] - Firebase Storage URL
 * @property {string} season - kharif | rabi | zaid
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {import('firebase/firestore').Timestamp} updatedAt
 */

/**
 * @typedef {Object} Bill
 * @property {string} [id]
 * @property {string} farmId
 * @property {string} ownerId
 * @property {string} billType - electricity | water | diesel | other
 * @property {string} providerName - e.g. "DGVCL", "MSEDCL"
 * @property {number} amount
 * @property {string} billMonth - "YYYY-MM" format
 * @property {import('firebase/firestore').Timestamp} dueDate
 * @property {import('firebase/firestore').Timestamp|null} paidDate
 * @property {boolean} paid
 * @property {string} [receiptURL]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} PartnerRecord
 * @property {string} [id]
 * @property {string} farmId
 * @property {string} ownerId
 * @property {string} name
 * @property {string} phone
 * @property {number} sharePercent - 0 to 100
 * @property {number} totalOwed - auto-calculated
 * @property {number} totalPaid
 * @property {string} [notes]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Settlement
 * @property {string} [id]
 * @property {string} farmId
 * @property {string} partnerId
 * @property {number} amount
 * @property {string} settledBy - uid
 * @property {import('firebase/firestore').Timestamp} settledAt
 * @property {string} [note]
 * @property {string} season
 */

/**
 * @typedef {Object} Reminder
 * @property {string} [id]
 * @property {string} ownerId
 * @property {string} [farmId]
 * @property {string} title
 * @property {string} [description]
 * @property {import('firebase/firestore').Timestamp} dueDate
 * @property {string} type - bill | spray | fertilizer | harvest | loan | other
 * @property {boolean} done
 * @property {boolean} fcmSent
 * @property {import('firebase/firestore').Timestamp} createdAt
 */
