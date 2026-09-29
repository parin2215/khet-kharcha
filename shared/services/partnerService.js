/**
 * Khet Kharcha — Partner & Settlement Service
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

// ━━━ PARTNERS ━━━

export const addPartner = async (partnerData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.PARTNERS), {
    ...partnerData, totalOwed: 0, totalPaid: 0, createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updatePartner = async (partnerId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.PARTNERS, partnerId), data);
};

export const deletePartner = async (partnerId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.PARTNERS, partnerId));
};

export const getPartnersByFarm = async (farmId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PARTNERS),
    where('farmId', '==', farmId)
  );
  const snapshot = await getDocs(q);
  const partners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return partners.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getPartnersByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.PARTNERS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const partners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return partners.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

// ━━━ SETTLEMENTS ━━━

export const addSettlement = async (settlementData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.SETTLEMENTS), {
    ...settlementData, settledAt: serverTimestamp(),
  });

  // Update partner's totalPaid
  if (settlementData.partnerId) {
    const partnerDoc = doc(db, COLLECTIONS.PARTNERS, settlementData.partnerId);
    const partnerSnap = await import('firebase/firestore').then(m => m.getDoc(partnerDoc));
    if (partnerSnap.exists()) {
      const currentPaid = partnerSnap.data().totalPaid || 0;
      await updateDoc(partnerDoc, {
        totalPaid: currentPaid + (settlementData.amount || 0),
      });
    }
  }

  return docRef.id;
};

export const getSettlementsByFarm = async (farmId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.SETTLEMENTS),
    where('farmId', '==', farmId)
  );
  const snapshot = await getDocs(q);
  const settlements = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return settlements.sort((a, b) => {
    const aTime = a.settledAt?.seconds || 0;
    const bTime = b.settledAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getSettlementsByPartner = async (partnerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.SETTLEMENTS),
    where('partnerId', '==', partnerId)
  );
  const snapshot = await getDocs(q);
  const settlements = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return settlements.sort((a, b) => {
    const aTime = a.settledAt?.seconds || 0;
    const bTime = b.settledAt?.seconds || 0;
    return bTime - aTime;
  });
};

// ━━━ PARTNERSHIP TEMPLATES ━━━

export const savePartnershipTemplate = async (uid, templateData) => {
  const db = getDb();
  const templatesRef = collection(db, 'users', uid, 'partnershipTemplates');
  const docRef = await addDoc(templatesRef, {
    ...templateData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getPartnershipTemplates = async (uid) => {
  const db = getDb();
  const templatesRef = collection(db, 'users', uid, 'partnershipTemplates');
  const snapshot = await getDocs(templatesRef);
  const templates = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return templates.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const deletePartnershipTemplate = async (uid, templateId) => {
  const db = getDb();
  const docRef = doc(db, 'users', uid, 'partnershipTemplates', templateId);
  await deleteDoc(docRef);
};
