/**
 * Khet Kharcha — Firebase Configuration
 * 
 * ⚠️ IMPORTANT: Replace ALL placeholder values below with your actual Firebase config.
 * 
 * To find your config:
 * 1. Go to Firebase Console → https://console.firebase.google.com
 * 2. Select your project
 * 3. Click the gear icon → Project Settings
 * 4. Scroll to "Your apps" → Select your web app
 * 5. Copy the firebaseConfig object
 */

export const firebaseConfig = {
  apiKey: "AIzaSyDqvHo4kg-B8_QlfcvbzDK4mBbKVD5jdMA",
  authDomain: "khet-kharcha.firebaseapp.com",
  projectId: "khet-kharcha",
  storageBucket: "khet-kharcha.firebasestorage.app",
  messagingSenderId: "881761853679",
  appId: "1:881761853679:web:02bc3bd51e3668ebc4bb1a",
  measurementId: "G-J4KYT2XQJ7"
};

/**
 * Google Sign-In Web Client ID (needed for Firebase authentication in mobile)
 * ⚠️ Replace this with your actual Web Client ID from the Firebase console under Auth -> Google -> Web SDK configuration.
 */
export const GOOGLE_WEB_CLIENT_ID = "881761853679-placeholder.apps.googleusercontent.com";

/**
 * Firebase Storage paths
 */
export const STORAGE_PATHS = {
  receipts: (uid, farmId, expenseId) =>
    `receipts/${uid}/${farmId}/${expenseId}.jpg`,
  profilePhoto: (uid) => `users/${uid}/profile.jpg`,
  billReceipt: (uid, billId) => `bills/${uid}/${billId}.jpg`,
};

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  USERS: 'users',
  FARMS: 'farms',
  EXPENSES: 'expenses',
  BILLS: 'bills',
  PARTNERS: 'partners',
  SETTLEMENTS: 'settlements',
  REMINDERS: 'reminders',
  PARTNER_LOANS: 'partner_loans',
  TRANSACTIONS: 'transactions',
  ADVANCES: 'advances',
  AUDIT_LOGS: 'audit_logs',
};
