import { create } from 'zustand';
import i18n from '../i18n/index.js';
import { useAuthStore } from './useAuthStore.js';

export const useSettingsStore = create((set, get) => ({
  language: localStorage.getItem('khet_kharcha_lang') || 'hi',
  unitPreference: localStorage.getItem('khet_kharcha_unit') || 'bigha',
  notificationsEnabled: localStorage.getItem('khet_kharcha_notif') !== 'false',

  setLanguage: async (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('khet_kharcha_lang', lang);
    set({ language: lang });

    // Sync with Firestore profile if authenticated
    const authStore = useAuthStore.getState();
    if (authStore.user && authStore.profile) {
      try {
        await authStore.updateProfile({ language: lang });
      } catch (e) {
        console.error('Failed to sync language setting to profile', e);
      }
    }
  },

  setUnitPreference: async (unit) => {
    localStorage.setItem('khet_kharcha_unit', unit);
    set({ unitPreference: unit });

    // Sync with Firestore profile if authenticated
    const authStore = useAuthStore.getState();
    if (authStore.user && authStore.profile) {
      try {
        await authStore.updateProfile({ unitPreference: unit });
      } catch (e) {
        console.error('Failed to sync unit setting to profile', e);
      }
    }
  },

  setNotificationsEnabled: (enabled) => {
    localStorage.setItem('khet_kharcha_notif', String(enabled));
    set({ notificationsEnabled: enabled });
  },

  // Initialize settings from loaded user profile
  syncFromProfile: (profile) => {
    if (!profile) return;
    if (profile.language && profile.language !== get().language) {
      i18n.changeLanguage(profile.language);
      localStorage.setItem('khet_kharcha_lang', profile.language);
      set({ language: profile.language });
    }
    if (profile.unitPreference && profile.unitPreference !== get().unitPreference) {
      localStorage.setItem('khet_kharcha_unit', profile.unitPreference);
      set({ unitPreference: profile.unitPreference });
    }
  }
}));
