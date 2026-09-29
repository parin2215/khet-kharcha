import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/index.js';
import { useAuthStore } from './useAuthStore.js';

export const useSettingsStore = create((set, get) => ({
  language: 'hi',
  unitPreference: 'bigha',
  notificationsEnabled: true,
  settingsLoaded: false,

  loadSettings: async () => {
    try {
      const lang = await AsyncStorage.getItem('khet_kharcha_lang') || 'hi';
      const unit = await AsyncStorage.getItem('khet_kharcha_unit') || 'bigha';
      const notifStr = await AsyncStorage.getItem('khet_kharcha_notif');
      const notif = notifStr !== 'false';

      i18n.changeLanguage(lang);

      set({ 
        language: lang, 
        unitPreference: unit, 
        notificationsEnabled: notif,
        settingsLoaded: true 
      });
    } catch (e) {
      console.error('Failed to load settings from AsyncStorage', e);
      set({ settingsLoaded: true });
    }
  },

  setLanguage: async (lang) => {
    try {
      i18n.changeLanguage(lang);
      await AsyncStorage.setItem('khet_kharcha_lang', lang);
      set({ language: lang });

      // Sync with Firestore profile if authenticated
      const authStore = useAuthStore.getState();
      if (authStore.user && authStore.profile) {
        await authStore.updateProfile({ language: lang });
      }
    } catch (e) {
      console.error('Failed to save language setting', e);
    }
  },

  setUnitPreference: async (unit) => {
    try {
      await AsyncStorage.setItem('khet_kharcha_unit', unit);
      set({ unitPreference: unit });

      // Sync with Firestore profile if authenticated
      const authStore = useAuthStore.getState();
      if (authStore.user && authStore.profile) {
        await authStore.updateProfile({ unitPreference: unit });
      }
    } catch (e) {
      console.error('Failed to save unit setting', e);
    }
  },

  setNotificationsEnabled: async (enabled) => {
    try {
      await AsyncStorage.setItem('khet_kharcha_notif', String(enabled));
      set({ notificationsEnabled: enabled });
    } catch (e) {
      console.error('Failed to save notification setting', e);
    }
  },

  syncFromProfile: async (profile) => {
    if (!profile) return;
    try {
      if (profile.language && profile.language !== get().language) {
        i18n.changeLanguage(profile.language);
        await AsyncStorage.setItem('khet_kharcha_lang', profile.language);
        set({ language: profile.language });
      }
      if (profile.unitPreference && profile.unitPreference !== get().unitPreference) {
        await AsyncStorage.setItem('khet_kharcha_unit', profile.unitPreference);
        set({ unitPreference: profile.unitPreference });
      }
    } catch (e) {
      console.error('Failed to sync settings from profile', e);
    }
  }
}));
