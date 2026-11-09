/**
 * Khet Kharcha — Current Crop & Farmo Hisab Firestore Service
 * Enables real-time cross-platform sync between Web (Laptop) and Android Phone (APK)
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

const CURRENT_CROPS_COLLECTION = 'current_crops';
const USER_LIBRARY_COLLECTION = 'user_crop_library';

/**
 * Save or overwrite an entire crop document in Firestore
 * @param {Object} crop
 * @returns {Promise<string>} cropId
 */
export const saveCurrentCropToCloud = async (crop) => {
  if (!crop || !crop.id) return;
  const db = getDb();
  const cropRef = doc(db, CURRENT_CROPS_COLLECTION, crop.id);
  
  // Clean undefined values before saving to Firestore
  const cleanData = JSON.parse(JSON.stringify(crop));
  await setDoc(cropRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return crop.id;
};

/**
 * Fetch all ongoing crops for a specific owner/user
 * @param {string} ownerId
 * @returns {Promise<Array>}
 */
export const getCurrentCropsByOwner = async (ownerId) => {
  if (!ownerId) return [];
  const db = getDb();
  const q = query(
    collection(db, CURRENT_CROPS_COLLECTION),
    where('ownerId', '==', ownerId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Real-time subscription to ongoing crops for automatic cross-device sync
 * Triggers callback immediately when laptop or phone adds/edits an expense, upad, or sale
 * @param {string} ownerId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} unsubscribe
 */
export const subscribeCurrentCrops = (ownerId, onUpdate, onError) => {
  if (!ownerId) return () => {};
  const db = getDb();
  const q = query(
    collection(db, CURRENT_CROPS_COLLECTION),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const crops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(crops);
    },
    (err) => {
      console.warn('Firestore subscription warning:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Delete an ongoing crop from cloud
 * @param {string} cropId
 */
export const deleteCurrentCropFromCloud = async (cropId) => {
  if (!cropId) return;
  const db = getDb();
  await deleteDoc(doc(db, CURRENT_CROPS_COLLECTION, cropId));
};

/**
 * Save user custom crop practices to Firestore for cross-device sync
 * @param {string} ownerId
 * @param {Array} customizedCrops
 */
export const saveUserCropLibraryToCloud = async (ownerId, customizedCrops) => {
  if (!ownerId || !customizedCrops) return;
  const db = getDb();
  const docRef = doc(db, USER_LIBRARY_COLLECTION, ownerId);
  await setDoc(docRef, {
    ownerId,
    crops: customizedCrops,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Fetch user custom crop practices from Firestore
 * @param {string} ownerId
 * @returns {Promise<Array|null>}
 */
export const getUserCropLibraryFromCloud = async (ownerId) => {
  if (!ownerId) return null;
  const db = getDb();
  const docRef = doc(db, USER_LIBRARY_COLLECTION, ownerId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data().crops || null;
  }
  return null;
};
