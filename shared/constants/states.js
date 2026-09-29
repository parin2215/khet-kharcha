/**
 * Khet Kharcha — Indian States & Union Territories
 * Used in registration dropdown
 */

export const INDIAN_STATES = [
  { code: 'AP', name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश' },
  { code: 'AR', name: 'Arunachal Pradesh', nameHi: 'अरुणाचल प्रदेश' },
  { code: 'AS', name: 'Assam', nameHi: 'असम' },
  { code: 'BR', name: 'Bihar', nameHi: 'बिहार' },
  { code: 'CT', name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़' },
  { code: 'GA', name: 'Goa', nameHi: 'गोवा' },
  { code: 'GJ', name: 'Gujarat', nameHi: 'गुजरात' },
  { code: 'HR', name: 'Haryana', nameHi: 'हरियाणा' },
  { code: 'HP', name: 'Himachal Pradesh', nameHi: 'हिमाचल प्रदेश' },
  { code: 'JH', name: 'Jharkhand', nameHi: 'झारखंड' },
  { code: 'KA', name: 'Karnataka', nameHi: 'कर्नाटक' },
  { code: 'KL', name: 'Kerala', nameHi: 'केरल' },
  { code: 'MP', name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश' },
  { code: 'MH', name: 'Maharashtra', nameHi: 'महाराष्ट्र' },
  { code: 'MN', name: 'Manipur', nameHi: 'मणिपुर' },
  { code: 'ML', name: 'Meghalaya', nameHi: 'मेघालय' },
  { code: 'MZ', name: 'Mizoram', nameHi: 'मिज़ोरम' },
  { code: 'NL', name: 'Nagaland', nameHi: 'नागालैंड' },
  { code: 'OR', name: 'Odisha', nameHi: 'ओडिशा' },
  { code: 'PB', name: 'Punjab', nameHi: 'पंजाब' },
  { code: 'RJ', name: 'Rajasthan', nameHi: 'राजस्थान' },
  { code: 'SK', name: 'Sikkim', nameHi: 'सिक्किम' },
  { code: 'TN', name: 'Tamil Nadu', nameHi: 'तमिलनाडु' },
  { code: 'TG', name: 'Telangana', nameHi: 'तेलंगाना' },
  { code: 'TR', name: 'Tripura', nameHi: 'त्रिपुरा' },
  { code: 'UP', name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश' },
  { code: 'UT', name: 'Uttarakhand', nameHi: 'उत्तराखंड' },
  { code: 'WB', name: 'West Bengal', nameHi: 'पश्चिम बंगाल' },
  // Union Territories
  { code: 'AN', name: 'Andaman & Nicobar Islands', nameHi: 'अंडमान और निकोबार द्वीपसमूह' },
  { code: 'CH', name: 'Chandigarh', nameHi: 'चंडीगढ़' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', nameHi: 'दादरा और नगर हवेली और दमन और दीव' },
  { code: 'DL', name: 'Delhi', nameHi: 'दिल्ली' },
  { code: 'JK', name: 'Jammu & Kashmir', nameHi: 'जम्मू और कश्मीर' },
  { code: 'LA', name: 'Ladakh', nameHi: 'लद्दाख' },
  { code: 'LD', name: 'Lakshadweep', nameHi: 'लक्षद्वीप' },
  { code: 'PY', name: 'Puducherry', nameHi: 'पुदुचेरी' },
];

/**
 * Get state name by code
 * @param {string} code
 * @param {string} [lang='en']
 * @returns {string}
 */
export const getStateName = (code, lang = 'en') => {
  const state = INDIAN_STATES.find((s) => s.code === code);
  if (!state) return code;
  return lang === 'hi' ? state.nameHi : state.name;
};
