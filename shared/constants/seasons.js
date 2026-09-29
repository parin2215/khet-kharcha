/**
 * Khet Kharcha — Season Definitions
 * Indian farming seasons with date ranges and auto-detection
 */

export const SEASONS = [
  {
    id: 'kharif',
    nameKey: 'season.kharif',
    startMonth: 6,  // June
    endMonth: 10,  // October (getCurrentSeason treats November as rabi)
    color: '#16a34a',
  },
  {
    id: 'rabi',
    nameKey: 'season.rabi',
    startMonth: 11, // November
    endMonth: 3,    // March (rabi continues into the next calendar year)
    color: '#eab308',
  },
  {
    id: 'zaid',
    nameKey: 'season.zaid',
    startMonth: 4,  // April
    endMonth: 5,    // May
    color: '#f97316',
  },
];

/**
 * Auto-detect current season based on the current month
 * @param {Date} [date] - defaults to now
 * @returns {string} season id
 */
export const getCurrentSeason = (date = new Date()) => {
  const month = date.getMonth() + 1; // 1-12

  if (month >= 6 && month <= 10) return 'kharif';
  if (month >= 11 || month <= 3) return 'rabi';
  if (month >= 4 && month <= 5) return 'zaid';

  return 'kharif'; // fallback
};

/**
 * Get season object by ID
 * @param {string} seasonId
 * @returns {Object|undefined}
 */
export const getSeasonById = (seasonId) =>
  SEASONS.find((s) => s.id === seasonId);

/**
 * Get date range for a season in a given year
 * @param {string} seasonId
 * @param {number} year
 * @returns {{ start: Date, end: Date }}
 */
export const getSeasonDateRange = (seasonId, year) => {
  switch (seasonId) {
    case 'kharif':
      return {
        start: new Date(year, 5, 1),   // June 1
        end: new Date(year, 9, 31),    // October 31
      };
    case 'rabi':
      return {
        start: new Date(year, 10, 1),  // November 1
        end: new Date(year + 1, 3, 31), // March 31 next year
      };
    case 'zaid':
      return {
        start: new Date(year, 3, 1),   // April 1
        end: new Date(year, 4, 31),    // May 31
      };
    default:
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      };
  }
};

/**
 * Get all season options for dropdowns
 * @returns {Array<{value: string, label: string}>}
 */
export const getSeasonOptions = () => [
  { value: 'kharif', label: 'Kharif (Jun-Oct)' },
  { value: 'rabi', label: 'Rabi (Nov-Mar)' },
  { value: 'zaid', label: 'Zaid (Apr-May)' },
  { value: 'year-round', label: 'Year Round' },
];
