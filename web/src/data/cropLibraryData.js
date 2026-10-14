/**
 * Crop Cultivation Library Data & Local Storage Store
 * Clean empty library where users can create, document, and manage their own crop guides.
 */

export const CROP_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'cereals', label: 'Cereals & Grains (અનાજ)' },
  { id: 'pulses', label: 'Pulses & Legumes (કઠોળ)' },
  { id: 'oilseeds', label: 'Oilseeds (તેલીબિયાં)' },
  { id: 'cash_crops', label: 'Cash & Fiber Crops (રોકડિયા પાક)' },
  { id: 'commercial', label: 'Commercial & Spices (મસાલા / કોમર્શિયલ)' },
  { id: 'vegetables', label: 'Vegetables & Horticulture (શાકભાજી)' },
  { id: 'other', label: 'Other Crops (અન્ય પાક)' }
];

const STORAGE_KEY = 'khet_kharcha_user_crop_library';

/**
 * Get library crops from local storage
 */
export const getLibraryCrops = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading library crops:', e);
    return [];
  }
};

/**
 * Save library crops to local storage
 */
export const saveLibraryCrops = (crops) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
  } catch (e) {
    console.error('Error saving library crops:', e);
  }
};

/**
 * Initial empty library (all pre-loaded crops removed per user request)
 */
export const CROP_LIBRARY = getLibraryCrops();
