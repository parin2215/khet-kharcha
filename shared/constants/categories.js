/**
 * Khet Kharcha — Expense Categories
 * Each category has: id, nameKey (i18n), icon names for both platforms, color
 */

export const EXPENSE_CATEGORIES = [
  {
    id: 'fertilizer',
    nameKey: 'category.fertilizer',
    ionicon: 'leaf-outline',
    lucide: 'Sprout',
    color: '#1D9E75',
    bgColor: '#EAF3DE',
  },
  {
    id: 'pesticide',
    nameKey: 'category.pesticide',
    ionicon: 'bug-outline',
    lucide: 'BugOff',
    color: '#D85A30',
    bgColor: '#FAECE7',
  },
  {
    id: 'seeds',
    nameKey: 'category.seeds',
    ionicon: 'leaf-outline',
    lucide: 'Sprout',
    color: '#0F6E56',
    bgColor: '#EAF3DE',
  },
  {
    id: 'electricity',
    nameKey: 'category.electricity',
    ionicon: 'flash-outline',
    lucide: 'Zap',
    color: '#185FA5',
    bgColor: '#E6F1FB',
  },
  {
    id: 'irrigation',
    nameKey: 'category.irrigation',
    ionicon: 'water-outline',
    lucide: 'Droplets',
    color: '#185FA5',
    bgColor: '#E6F1FB',
  },
  {
    id: 'labour',
    nameKey: 'category.labour',
    ionicon: 'people-outline',
    lucide: 'UserCheck',
    color: '#534AB7',
    bgColor: '#EEEDFE',
  },
  {
    id: 'machinery',
    nameKey: 'category.machinery',
    ionicon: 'car-outline',
    lucide: 'Tractor',
    color: '#d97706',
    bgColor: '#FAEEDA',
  },
  {
    id: 'diesel',
    nameKey: 'category.diesel',
    ionicon: 'speedometer-outline',
    lucide: 'Fuel',
    color: '#d97706',
    bgColor: '#FAEEDA',
  },
  {
    id: 'transport',
    nameKey: 'category.transport',
    ionicon: 'bus-outline',
    lucide: 'Truck',
    color: '#d97706',
    bgColor: '#FAEEDA',
  },
  {
    id: 'market',
    nameKey: 'category.market',
    ionicon: 'storefront-outline',
    lucide: 'Store',
    color: '#D85A30',
    bgColor: '#FAECE7',
  },
  {
    id: 'loan_interest',
    nameKey: 'category.loan_interest',
    ionicon: 'cash-outline',
    lucide: 'IndianRupee',
    color: '#dc2626',
    bgColor: '#FEF2F2',
  },
  {
    id: 'equipment_repair',
    nameKey: 'category.equipment_repair',
    ionicon: 'construct-outline',
    lucide: 'Wrench',
    color: '#534AB7',
    bgColor: '#EEEDFE',
  },
  {
    id: 'packaging',
    nameKey: 'category.packaging',
    ionicon: 'cube-outline',
    lucide: 'Package',
    color: '#0F6E56',
    bgColor: '#EAF3DE',
  },
  {
    id: 'crop_insurance',
    nameKey: 'category.crop_insurance',
    ionicon: 'shield-checkmark-outline',
    lucide: 'ShieldCheck',
    color: '#185FA5',
    bgColor: '#E6F1FB',
  },
  {
    id: 'other',
    nameKey: 'category.other',
    ionicon: 'ellipsis-horizontal-outline',
    lucide: 'MoreHorizontal',
    color: '#888880',
    bgColor: '#f0f0ec',
  },
];

/**
 * Get a category by its ID
 * @param {string} categoryId
 * @returns {Object|undefined}
 */
export const getCategoryById = (categoryId) =>
  EXPENSE_CATEGORIES.find((c) => c.id === categoryId);

/**
 * Get category color by ID
 * @param {string} categoryId
 * @returns {string}
 */
export const getCategoryColor = (categoryId) =>
  getCategoryById(categoryId)?.color || '#6b7280';
