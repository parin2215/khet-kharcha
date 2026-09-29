import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../../../shared/i18n/en.json';
import hi from '../../../shared/i18n/hi.json';
import gu from '../../../shared/i18n/gu.json';
import mr from '../../../shared/i18n/mr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  mr: { translation: mr },
};

// Initialize i18n asynchronously
export const initI18n = async () => {
  let savedLng = 'hi'; // default to Hindi
  try {
    const value = await AsyncStorage.getItem('khet_kharcha_lang');
    if (value) savedLng = value;
  } catch (e) {
    console.log('Error loading saved language', e);
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLng,
      fallbackLng: 'en',
      compatibilityJSON: 'v3', // needed for React Native
      interpolation: {
        escapeValue: false,
      },
    });
};

export default i18n;
