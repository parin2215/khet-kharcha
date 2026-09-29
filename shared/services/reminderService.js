/**
 * Khet Kharcha — Reminder Service
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebaseInit.js';
import { COLLECTIONS } from '../firebase.config.js';

export const addReminder = async (reminderData) => {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTIONS.REMINDERS), {
    ...reminderData, done: false, fcmSent: false, createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateReminder = async (reminderId, data) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.REMINDERS, reminderId), data);
};

export const toggleReminderDone = async (reminderId, done) => {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.REMINDERS, reminderId), { done });
};

export const deleteReminder = async (reminderId) => {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.REMINDERS, reminderId));
};

export const getRemindersByOwner = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.REMINDERS),
    where('ownerId', '==', ownerId)
  );
  const snapshot = await getDocs(q);
  const reminders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return reminders.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
};

export const getUpcomingReminders = async (ownerId, count = 3) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.REMINDERS),
    where('ownerId', '==', ownerId),
    where('done', '==', false)
  );
  const snapshot = await getDocs(q);
  const reminders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  const nowMs = Date.now();
  const upcoming = reminders.filter((r) => {
    const dueTime = r.dueDate?.seconds ? r.dueDate.seconds * 1000 : new Date(r.dueDate).getTime();
    return dueTime >= nowMs;
  });

  upcoming.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });

  return upcoming.slice(0, count);
};

export const getOverdueReminders = async (ownerId) => {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.REMINDERS),
    where('ownerId', '==', ownerId),
    where('done', '==', false)
  );
  const snapshot = await getDocs(q);
  const reminders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  const nowMs = Date.now();
  const overdue = reminders.filter((r) => {
    const dueTime = r.dueDate?.seconds ? r.dueDate.seconds * 1000 : new Date(r.dueDate).getTime();
    return dueTime < nowMs;
  });

  return overdue.sort((a, b) => {
    const aTime = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : new Date(a.dueDate).getTime();
    const bTime = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : new Date(b.dueDate).getTime();
    return aTime - bTime;
  });
};
