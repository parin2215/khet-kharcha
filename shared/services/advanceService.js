import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

export const addAdvance = async (advanceData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.ADVANCES), {
    ...advanceData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateAdvance = async (advanceId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.ADVANCES, advanceId), data);
};

export const deleteAdvance = async (advanceId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.ADVANCES, advanceId));
};

export const getAdvancesByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.ADVANCES),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const advances = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return advances.sort((a, b) => {
    const aTime = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
    const bTime = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
    return bTime - aTime;
  });
};
