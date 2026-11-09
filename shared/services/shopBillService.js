/**
 * Khet Kharcha — Shop Bills & Vendor Service
 * Dedicated independent ledger for tracking agro-dealer shops and product bills.
 * NOTE: Independent of farm financials/analytics.
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

// ==========================================
// SHOPS MANAGEMENT
// ==========================================

export const addShop = async (shopData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.SHOPS), {
    ...shopData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateShop = async (shopId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.SHOPS, shopId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteShop = async (shopId) => {
  const db = getDb();
  // 1. Delete shop document
  await deleteDoc(doc(db, COLLECTIONS.SHOPS, shopId));

  // 2. Delete all bills associated with this shop
  try {
    const q = query(
      collection(db, COLLECTIONS.SHOP_BILLS),
      where('shopId', '==', shopId)
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Failed to delete associated shop bills:', err);
  }
};

export const getShopsByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.SHOPS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const shops = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return shops.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

// ==========================================
// SHOP BILLS MANAGEMENT
// ==========================================

export const addShopBill = async (billData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.SHOP_BILLS), {
    ...billData,
    amount: parseFloat(billData.amount) || 0,
    paid: Boolean(billData.paid),
    paidDate: billData.paid ? (billData.paidDate || new Date().toISOString()) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateShopBill = async (billId, data) => {
  const db = getDb();
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  if (data.amount !== undefined) {
    payload.amount = parseFloat(data.amount) || 0;
  }
  if (data.paid !== undefined) {
    payload.paid = Boolean(data.paid);
    payload.paidDate = data.paid ? (data.paidDate || new Date().toISOString()) : null;
  }
  await updateDoc(doc(db, COLLECTIONS.SHOP_BILLS, billId), payload);
};

export const deleteShopBill = async (billId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.SHOP_BILLS, billId));
};

export const toggleShopBillPaid = async (billId, currentPaidStatus) => {
  const nextPaid = !currentPaidStatus;
  await updateShopBill(billId, {
    paid: nextPaid,
    paidDate: nextPaid ? new Date().toISOString() : null,
  });
  return nextPaid;
};

export const getShopBillsByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.SHOP_BILLS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const bills = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return bills.sort((a, b) => new Date(b.billDate || 0) - new Date(a.billDate || 0));
};

