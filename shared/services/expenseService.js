/**
 * Khet Kharcha — Expense Service
 * CRUD operations with filtering for expenses
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
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

/**
 * Add a new expense
 * @param {Object} expenseData
 * @returns {Promise<string>} expenseId
 */
export const addExpense = async (expenseData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.EXPENSES), {
    ...expenseData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Update an expense
 * @param {string} expenseId
 * @param {Object} data
 */
export const updateExpense = async (expenseId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.EXPENSES, expenseId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete an expense
 * @param {string} expenseId
 */
export const deleteExpense = async (expenseId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
};

/**
 * Get a single expense
 * @param {string} expenseId
 * @returns {Promise<Object|null>}
 */
export const getExpenseById = async (expenseId) => {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Get expenses with filters
 * @param {Object} filters
 * @param {string} filters.ownerId - required
 * @param {string} [filters.farmId]
 * @param {string} [filters.category]
 * @param {string} [filters.expenseType] - 'own' | 'partner'
 * @param {string} [filters.season]
 * @param {Date} [filters.startDate]
 * @param {Date} [filters.endDate]
 * @param {number} [filters.limitCount]
 * @returns {Promise<Array>}
 */
export const getExpenses = async (filters) => {
  const db = getDb();
  const constraints = [where('ownerId', '==', filters.ownerId)];

  const q = query(collection(db, COLLECTIONS.EXPENSES), ...constraints);
  const snapshot = await getDocs(q);
  let expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const getDateMs = (dateVal) => {
    if (!dateVal) return 0;
    if (typeof dateVal === 'object') {
      if (dateVal.seconds !== undefined) return dateVal.seconds * 1000;
      if (typeof dateVal.toDate === 'function') return dateVal.toDate().getTime();
    }
    return new Date(dateVal).getTime();
  };

  // In-memory filters to bypass Firestore composite index constraints
  if (filters.farmId) {
    expenses = expenses.filter((e) => e.farmId === filters.farmId);
  }
  if (filters.category) {
    expenses = expenses.filter((e) => e.category === filters.category);
  }
  if (filters.expenseType) {
    expenses = expenses.filter((e) => e.expenseType === filters.expenseType);
  }
  if (filters.season) {
    expenses = expenses.filter((e) => e.season === filters.season);
  }
  if (filters.startDate) {
    const startMs = new Date(filters.startDate).getTime();
    expenses = expenses.filter((e) => getDateMs(e.date) >= startMs);
  }
  if (filters.endDate) {
    const endMs = new Date(filters.endDate).getTime();
    expenses = expenses.filter((e) => getDateMs(e.date) <= endMs);
  }

  // Sort in-memory by date desc to avoid composite index requirements
  expenses.sort((a, b) => {
    const aTime = getDateMs(a.date);
    const bTime = getDateMs(b.date);
    return bTime - aTime;
  });

  if (filters.limitCount) {
    return expenses.slice(0, filters.limitCount);
  }

  return expenses;
};

/**
 * Get recent expenses for dashboard
 * @param {string} ownerId
 * @param {number} count
 * @returns {Promise<Array>}
 */
export const getRecentExpenses = async (ownerId, count = 5) => {
  return getExpenses({ ownerId, limitCount: count });
};

/**
 * Get monthly total for a user
 * @param {string} ownerId
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Promise<{ total: number, own: number, partner: number }>}
 */
export const getMonthlyTotals = async (ownerId, year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const expenses = await getExpenses({ ownerId, startDate, endDate });

  let total = 0;
  let own = 0;
  let partner = 0;

  expenses.forEach((exp) => {
    total += exp.amount || 0;
    const ownShare = exp.ownerShare !== undefined ? exp.ownerShare : (exp.expenseType === 'own' ? exp.amount : 0);
    const partnerShare = exp.partnerShare !== undefined ? exp.partnerShare : (exp.expenseType === 'partner' ? exp.amount : 0);
    own += ownShare;
    partner += partnerShare;
  });

  return { total, own, partner };
};

/**
 * Get category-wise breakdown
 * @param {string} ownerId
 * @param {Object} [filters] - { farmId, startDate, endDate, season }
 * @returns {Promise<Array<{ category: string, total: number, count: number }>>}
 */
export const getCategoryBreakdown = async (ownerId, filters = {}) => {
  const expenses = await getExpenses({ ownerId, ...filters });

  const categoryMap = {};
  expenses.forEach((exp) => {
    if (!categoryMap[exp.category]) {
      categoryMap[exp.category] = { category: exp.category, total: 0, count: 0 };
    }
    categoryMap[exp.category].total += exp.amount || 0;
    categoryMap[exp.category].count += 1;
  });

  return Object.values(categoryMap).sort((a, b) => b.total - a.total);
};

/**
 * Get farm-wise expense totals
 * @param {string} ownerId
 * @param {Object} [filters]
 * @returns {Promise<Array<{ farmId: string, total: number }>>}
 */
export const getFarmWiseTotals = async (ownerId, filters = {}) => {
  const expenses = await getExpenses({ ownerId, ...filters });

  const farmMap = {};
  expenses.forEach((exp) => {
    if (!farmMap[exp.farmId]) {
      farmMap[exp.farmId] = { farmId: exp.farmId, total: 0, own: 0, partner: 0 };
    }
    farmMap[exp.farmId].total += exp.amount || 0;
    
    const ownShare = exp.ownerShare !== undefined ? exp.ownerShare : (exp.expenseType === 'own' ? exp.amount : 0);
    const partnerShare = exp.partnerShare !== undefined ? exp.partnerShare : (exp.expenseType === 'partner' ? exp.amount : 0);
    
    farmMap[exp.farmId].own += ownShare;
    farmMap[exp.farmId].partner += partnerShare;
  });

  return Object.values(farmMap).sort((a, b) => b.total - a.total);
};

/**
 * Get expense totals by owner with optional filters
 * @param {string} ownerId
 * @param {Object} [filters]
 * @returns {Promise<{ total: number, own: number, partner: number }>}
 */
export const getExpenseTotals = async (ownerId, filters = {}) => {
  const expenses = await getExpenses({ ownerId, ...filters });

  let total = 0;
  let own = 0;
  let partner = 0;

  expenses.forEach((exp) => {
    const amt = exp.amount || 0;
    total += amt;
    const ownShare = exp.ownerShare !== undefined ? exp.ownerShare : (exp.expenseType === 'own' ? exp.amount : 0);
    const partnerShare = exp.partnerShare !== undefined ? exp.partnerShare : (exp.expenseType === 'partner' ? exp.amount : 0);
    own += ownShare;
    partner += partnerShare;
  });

  return { total, own, partner };
};
