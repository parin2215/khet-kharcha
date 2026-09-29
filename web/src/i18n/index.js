import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('khet_kharcha_lang') || 'hi', // default to Hindi
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
