/**
 * Khet Kharcha — Firebase Initialization
 * Platform-aware initialization for Auth, Firestore, and Storage
 */

import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../firebase.config.js';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Initialize Firebase App (singleton)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth — platform-aware initialization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let auth;

/**
 * Initialize Firebase Auth with platform-specific persistence
 * Call this once at app startup
 * @param {boolean} isWeb - true for web, false for React Native
 */
export const initAuth = async (isWeb = false) => {
  if (auth) return auth;

  if (isWeb) {
    const { getAuth } = await import('firebase/auth');
    auth = getAuth(app);
  } else {
    const { initializeAuth, getReactNativePersistence } = await import('firebase/auth');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }

  return auth;
};

export const getAuthInstance = () => {
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firestore — platform-aware initialization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let db;

/**
 * Initialize Firestore with platform-specific persistence
 * @param {boolean} isWeb - true for web, false for React Native
 */
export const initFirestore = async (isWeb = false) => {
  if (db) return db;

  if (isWeb) {
    const {
      initializeFirestore,
      persistentLocalCache,
      persistentMultipleTabManager,
      getFirestore,
    } = await import('firebase/firestore');

    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (e) {
      console.warn('Firestore already initialized or in progress. Falling back to getFirestore().');
      db = getFirestore(app);
    }
  } else {
    // Native: offline persistence is enabled by default
    const { getFirestore } = await import('firebase/firestore');
    db = getFirestore(app);
  }

  return db;
};

export const getDb = () => {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Storage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let storage;

export const getStorageInstance = () => {
  if (!storage) {
    storage = getStorage(app);
  }
  return storage;
};
