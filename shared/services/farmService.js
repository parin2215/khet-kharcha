/**
 * Khet Kharcha — Farm Service
 * CRUD operations for farms
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

/**
 * Add a new farm
 * @param {Object} farmData
 * @returns {Promise<string>} farmId
 */
export const addFarm = async (farmData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.FARMS), {
    ...farmData,
    active: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update a farm
 * @param {string} farmId
 * @param {Object} farmData
 */
export const updateFarm = async (farmId, farmData) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.FARMS, farmId), farmData);
};

/**
 * Delete a farm and its associated records (cascade delete)
 * @param {string} farmId
 */
export const deleteFarm = async (farmId) => {
  const db = getDb();

  // Firestore caps a batch at 500 writes, so commit in chunks instead of
  // accumulating every cascade in one (unbounded) batch.
  const BATCH_LIMIT = 400;
  let batch = writeBatch(db);
  let pending = 0;

  const flush = async (force = false) => {
    if (pending > 0 && (force || pending >= BATCH_LIMIT)) {
      await batch.commit();
      batch = writeBatch(db);
      pending = 0;
    }
  };

  const queueDelete = async (ref) => {
    batch.delete(ref);
    pending++;
    await flush();
  };

  // Delete the farm itself
  await queueDelete(doc(db, COLLECTIONS.FARMS, farmId));

  // Delete every dependent record. TRANSACTIONS is the current model; EXPENSES is
  // the legacy collection kept for data written before the migration.
  const cascadeCollections = [
    COLLECTIONS.TRANSACTIONS,
    COLLECTIONS.EXPENSES,
    COLLECTIONS.BILLS,
    COLLECTIONS.SETTLEMENTS,
    COLLECTIONS.PARTNER_LOANS,
    COLLECTIONS.ADVANCES,
  ].filter(Boolean);

  for (const collectionName of cascadeCollections) {
    try {
      const q = query(collection(db, collectionName), where('farmId', '==', farmId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await queueDelete(d.ref);
      }
    } catch (e) {
      // A missing collection or index must not block the rest of the cascade.
      console.warn(`deleteFarm: skipping ${collectionName}`, e?.message || e);
    }
  }

  await flush(true);
};

/**
 * Get a single farm by ID
 * @param {string} farmId
 * @returns {Promise<Object|null>}
 */
export const getFarmById = async (farmId) => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTIONS.FARMS, farmId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Get all farms for a user
 * @param {string} ownerId - uid
 * @returns {Promise<Array>}
 */
export const getFarmsByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.FARMS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const farms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
  // Sort in-memory to avoid composite index requirement
  return farms.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

/**
 * Get active farms for a user
 * @param {string} ownerId
 * @returns {Promise<Array>}
 */
export const getActiveFarms = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.FARMS),
    where('ownerId', '==', ownerId),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  const farms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Sort in-memory to avoid composite index requirement
  return farms.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};
