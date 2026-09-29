import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

export const addLoan = async (loanData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.PARTNER_LOANS), {
    ...loanData,
    status: loanData.status || 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateLoan = async (loanId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.PARTNER_LOANS, loanId), data);
};

export const deleteLoan = async (loanId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.PARTNER_LOANS, loanId));
};

export const getLoansByPartner = async (partnerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PARTNER_LOANS),
    where('partnerId', '==', partnerId)
  );
  const snapshot = await getDocs(q);
  const loans = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return loans.sort((a, b) => {
    const aTime = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
    const bTime = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
    return bTime - aTime;
  });
};

export const clearPendingLoansForPartner = async (partnerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PARTNER_LOANS),
    where('partnerId', '==', partnerId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map(d => 
    updateDoc(doc(db, COLLECTIONS.PARTNER_LOANS, d.id), { status: 'cleared', clearedAt: serverTimestamp() })
  );
  await Promise.all(updatePromises);
};
