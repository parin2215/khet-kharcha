/**
 * Khet Kharcha — Bill Service
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

export const addBill = async (billData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.BILLS), {
    ...billData, paid: false, paidDate: null, createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateBill = async (billId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.BILLS, billId), data);
};

export const deleteBill = async (billId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.BILLS, billId));
};

export const markBillPaid = async (billId) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.BILLS, billId), {
    paid: true,
    paidDate: serverTimestamp(),
  });
};

export const getBillsByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BILLS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return bills.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
};

export const getBillsByFarm = async (farmId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BILLS),
    where('farmId', '==', farmId)
  );
  const snapshot = await getDocs(q);
  const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return bills.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
};

export const getOverdueBills = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BILLS),
    where('ownerId', '==', ownerId),
    where('paid', '==', false)
  );
  const snapshot = await getDocs(q);
  const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  // Filter by dueDate < now and sort in-memory to avoid index requirement
  const nowMs = Date.now();
  const overdue = bills.filter((b) => {
    const dueTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return dueTime < nowMs;
  });

  return overdue.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
};

export const getPendingBillsCount = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BILLS),
    where('ownerId', '==', ownerId),
    where('paid', '==', false)
  );
  const snapshot = await getDocs(q);
  let total = 0;
  snapshot.docs.forEach((d) => { total += d.data().amount || 0; });
  return { count: snapshot.size, total };
};
