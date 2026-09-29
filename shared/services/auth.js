/**
 * Khet Kharcha — Auth Service
 * Handles all authentication methods: Email, Google, Phone OTP
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  PhoneAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuthInstance, getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMAIL & PASSWORD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Register with email and password
 * @param {string} email
 * @param {string} password
 * @param {Object} profileData - { name, state, language, unitPreference }
 * @returns {Promise<import('firebase/auth').User>}
 */
export const signUpWithEmail = async (email, password, profileData) => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  await createUserProfile(user.uid, {
    name: profileData.name,
    email: user.email,
    phone: '',
    photoURL: '',
    state: profileData.state || '',
    language: profileData.language || 'hi',
    unitPreference: profileData.unitPreference || 'bigha',
  });

  return user;
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').User>}
 */
export const signInWithEmail = async (email, password) => {
  const auth = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Update last login
  await updateLastLogin(userCredential.user.uid);

  return userCredential.user;
};

/**
 * Send password reset email
 * @param {string} email
 */
export const sendPasswordReset = async (email) => {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GOOGLE SIGN-IN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Google sign-in for web (popup)
 * @returns {Promise<{ user: import('firebase/auth').User, isNewUser: boolean }>}
 */
export const signInWithGoogleWeb = async () => {
  const auth = getAuthInstance();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if this is a new user
  const isNewUser = !(await userProfileExists(user.uid));

  if (isNewUser) {
    // Create a basic profile - user will complete it
    await createUserProfile(user.uid, {
      name: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      state: '',
      language: 'hi',
      unitPreference: 'bigha',
    });
  } else {
    await updateLastLogin(user.uid);
  }

  return { user, isNewUser };
};

/**
 * Google sign-in for mobile (using credential from @react-native-google-signin)
 * @param {string} idToken - Google ID token from GoogleSignin.signIn()
 * @returns {Promise<{ user: import('firebase/auth').User, isNewUser: boolean }>}
 */
export const signInWithGoogleMobile = async (idToken) => {
  const auth = getAuthInstance();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  const user = result.user;

  const isNewUser = !(await userProfileExists(user.uid));

  if (isNewUser) {
    await createUserProfile(user.uid, {
      name: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      state: '',
      language: 'hi',
      unitPreference: 'bigha',
    });
  } else {
    await updateLastLogin(user.uid);
  }

  return { user, isNewUser };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONE OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Send OTP to phone number (web)
 * @param {string} phoneNumber - Full phone number with +91
 * @param {import('firebase/auth').RecaptchaVerifier} recaptchaVerifier
 * @returns {Promise<import('firebase/auth').ConfirmationResult>}
 */
export const sendOTPWeb = async (phoneNumber, recaptchaVerifier) => {
  const { signInWithPhoneNumber } = await import('firebase/auth');
  const auth = getAuthInstance();
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmationResult;
};

/**
 * Verify OTP and sign in (web)
 * @param {import('firebase/auth').ConfirmationResult} confirmationResult
 * @param {string} code - 6-digit OTP
 * @returns {Promise<{ user: import('firebase/auth').User, isNewUser: boolean }>}
 */
export const verifyOTPWeb = async (confirmationResult, code) => {
  const result = await confirmationResult.confirm(code);
  const user = result.user;

  const isNewUser = !(await userProfileExists(user.uid));

  if (isNewUser) {
    await createUserProfile(user.uid, {
      name: '',
      email: '',
      phone: user.phoneNumber || '',
      photoURL: '',
      state: '',
      language: 'hi',
      unitPreference: 'bigha',
    });
  } else {
    await updateLastLogin(user.uid);
  }

  return { user, isNewUser };
};

/**
 * Send OTP for mobile (using PhoneAuthProvider)
 * @param {string} phoneNumber
 * @param {any} recaptchaVerifier - FirebaseRecaptchaVerifierModal ref
 * @returns {Promise<string>} verificationId
 */
export const sendOTPMobile = async (phoneNumber, recaptchaVerifier) => {
  const auth = getAuthInstance();
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  return verificationId;
};

/**
 * Verify OTP for mobile
 * @param {string} verificationId
 * @param {string} code
 * @returns {Promise<{ user: import('firebase/auth').User, isNewUser: boolean }>}
 */
export const verifyOTPMobile = async (verificationId, code) => {
  const auth = getAuthInstance();
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(auth, credential);
  const user = result.user;

  const isNewUser = !(await userProfileExists(user.uid));

  if (isNewUser) {
    await createUserProfile(user.uid, {
      name: '',
      email: '',
      phone: user.phoneNumber || '',
      photoURL: '',
      state: '',
      language: 'hi',
      unitPreference: 'bigha',
    });
  } else {
    await updateLastLogin(user.uid);
  }

  return { user, isNewUser };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER PROFILE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create user profile in Firestore
 * @param {string} uid
 * @param {Object} data
 */
export const createUserProfile = async (uid, data) => {
  const db = getDb();
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
};

/**
 * Check if user profile exists
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
export const userProfileExists = async (uid) => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return docSnap.exists();
};

/**
 * Get user profile
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (uid) => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() };
  }
  return null;
};

/**
 * Update user profile
 * @param {string} uid
 * @param {Object} data
 */
export const updateUserProfile = async (uid, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
};

/**
 * Update last login timestamp
 * @param {string} uid
 */
const updateLastLogin = async (uid) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    lastLoginAt: serverTimestamp(),
  });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Sign out
 */
export const signOut = async () => {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
};

/**
 * Listen to auth state changes
 * @param {Function} callback - (user) => void
 * @returns {Function} unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 * @returns {import('firebase/auth').User|null}
 */
export const getCurrentUser = () => {
  const auth = getAuthInstance();
  return auth.currentUser;
};
