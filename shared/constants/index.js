/**
 * Khet Kharcha — Shared Constants Index
 */

export { EXPENSE_CATEGORIES, getCategoryById, getCategoryColor } from './categories.js';
export { INDIAN_STATES, getStateName } from './states.js';
export { SEASONS, getCurrentSeason, getSeasonById, getSeasonDateRange, getSeasonOptions } from './seasons.js';

/**
 * App theme colors
 */
export const COLORS = {
  primary: '#1D9E75',
  primaryDark: '#0F6E56',
  primaryLight: '#EAF3DE',
  deeperGreen: '#085041',
  lightGreen: '#4ade80',
  accent: '#F59E0B',
  accentLight: '#FAEEDA',
  accentDark: '#92400e',
  ownExpense: '#27500A',
  ownExpenseLight: '#EAF3DE',
  partnerExpense: '#92400e',
  partnerExpenseLight: '#FFF7ED',
  danger: '#dc2626',
  dangerLight: '#FEF2F2',
  success: '#27500A',
  warning: '#92400e',
  background: '#f5f5f0',
  card: '#ffffff',
  border: '#e8e8e2',
  divider: '#f0f0ec',
  textPrimary: '#1a1a18',
  textSecondary: '#6b6b67',
  textTertiary: '#aaaaaa',
  skeleton: '#e5e5e3',
};

/**
 * Language options
 */
export const LANGUAGES = [
  { code: 'hi', name: 'हिन्दी', nameEn: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', nameEn: 'Gujarati', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', nameEn: 'Marathi', flag: '🇮🇳' },
  { code: 'en', name: 'English', nameEn: 'English', flag: '🇬🇧' },
];

/**
 * Size unit options
 */
export const SIZE_UNITS = [
  { value: 'bigha', labelKey: 'unit.bigha' },
  { value: 'acre', labelKey: 'unit.acre' },
  { value: 'hectare', labelKey: 'unit.hectare' },
];

/**
 * Bill type options
 */
export const BILL_TYPES = [
  { value: 'electricity', labelKey: 'bill.electricity', icon: 'flash-outline', lucide: 'Zap' },
  { value: 'water', labelKey: 'bill.water', icon: 'water-outline', lucide: 'Droplets' },
  { value: 'diesel', labelKey: 'bill.diesel', icon: 'speedometer-outline', lucide: 'Fuel' },
  { value: 'other', labelKey: 'bill.other', icon: 'ellipsis-horizontal-outline', lucide: 'MoreHorizontal' },
];

/**
 * Reminder type options
 */
export const REMINDER_TYPES = [
  { value: 'bill', labelKey: 'reminder.bill', icon: 'receipt-outline', lucide: 'Receipt' },
  { value: 'spray', labelKey: 'reminder.spray', icon: 'water-outline', lucide: 'Spray' },
  { value: 'fertilizer', labelKey: 'reminder.fertilizer', icon: 'leaf-outline', lucide: 'Sprout' },
  { value: 'harvest', labelKey: 'reminder.harvest', icon: 'cut-outline', lucide: 'Wheat' },
  { value: 'loan', labelKey: 'reminder.loan', icon: 'cash-outline', lucide: 'IndianRupee' },
  { value: 'other', labelKey: 'reminder.other', icon: 'ellipsis-horizontal-outline', lucide: 'MoreHorizontal' },
];
