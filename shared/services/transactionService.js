/**
 * KhetKharcha - Transaction Service
 * Centralized CRUD for the Unified Transaction Model.
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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';
import { logTransactionAction } from './auditLogService.js';

/**
 * Add a new transaction
 * @param {Object} txData
 * @returns {Promise<string>} transactionId
 */
export const addTransaction = async (txData) => {
  const db = getDb();
  
  if (txData.amount < 0) throw new Error("Amount cannot be negative");
  if (txData.type === 'loan' && !txData.loanDirection) throw new Error("Loan direction required");

  const batch = writeBatch(db);
  const txRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
  
  const payload = {
    ...txData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  batch.set(txRef, payload);
  await batch.commit();

  await logTransactionAction('CREATE', txRef.id, payload);

  return txRef.id;
};

/**
 * Update a transaction
 * @param {string} txId
 * @param {Object} data
 */
export const updateTransaction = async (txId, data) => {
  const db = getDb();
  if (data.amount !== undefined && data.amount < 0) throw new Error("Amount cannot be negative");

  const txRef = doc(db, COLLECTIONS.TRANSACTIONS, txId);
  const snap = await getDoc(txRef);
  if (!snap.exists()) throw new Error("Transaction not found");
  
  const existing = snap.data();
  if (existing.seasonStatus === 'CLOSED') {
    throw new Error("Cannot edit transactions in a closed season.");
  }

  await updateDoc(txRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  await logTransactionAction('UPDATE', txId, { ...existing, ...data });
};

/**
 * Delete a transaction
 * @param {string} txId
 */
export const deleteTransaction = async (txId) => {
  const db = getDb();
  const txRef = doc(db, COLLECTIONS.TRANSACTIONS, txId);
  const snap = await getDoc(txRef);
  if (snap.exists() && snap.data().seasonStatus === 'CLOSED') {
    throw new Error("Cannot delete transactions in a closed season.");
  }

  const txData = snap.exists() ? snap.data() : {};

  await deleteDoc(txRef);
  
  if (snap.exists()) {
    await logTransactionAction('DELETE', txId, txData);
  }
};

/**
 * Get a single transaction
 * @param {string} txId
 * @returns {Promise<Object|null>}
 */
export const getTransactionById = async (txId) => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTIONS.TRANSACTIONS, txId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Get transactions with filters
 * @param {Object} filters
 * @param {string} filters.ownerId - required
 * @param {string} [filters.farmId]
 * @returns {Promise<Array>}
 */
export const getTransactions = async (filters) => {
  const db = getDb();
  const constraints = [where('ownerId', '==', filters.ownerId)];

  const q = query(collection(db, COLLECTIONS.TRANSACTIONS), ...constraints);
  const snapshot = await getDocs(q);
  let transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const getDateMs = (dateVal) => {
    if (!dateVal) return 0;
    if (typeof dateVal === 'object') {
      if (dateVal.seconds !== undefined) return dateVal.seconds * 1000;
      if (typeof dateVal.toDate === 'function') return dateVal.toDate().getTime();
    }
    return new Date(dateVal).getTime();
  };

  if (filters.farmId) {
    transactions = transactions.filter((t) => t.farmId === filters.farmId);
  }
  if (filters.startDate) {
    const startMs = new Date(filters.startDate).getTime();
    transactions = transactions.filter((t) => getDateMs(t.date || t.createdAt) >= startMs);
  }
  if (filters.endDate) {
    const endMs = new Date(filters.endDate).getTime();
    transactions = transactions.filter((t) => getDateMs(t.date || t.createdAt) <= endMs);
  }

  transactions.sort((a, b) => {
    const aTime = getDateMs(a.date || a.createdAt);
    const bTime = getDateMs(b.date || b.createdAt);
    return bTime - aTime;
  });

  return transactions;
};
