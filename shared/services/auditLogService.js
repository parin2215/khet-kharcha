import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase.config.js';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export const logTransactionAction = async (action, transactionId, data, userId) => {
  try {
    const auditData = {
      action, // 'CREATE', 'UPDATE', 'DELETE'
      transactionId,
      entity: 'transaction',
      userId: userId || data?.ownerId || 'unknown',
      timestamp: serverTimestamp(),
      dataDetails: data || {}
    };

    const docRef = await addDoc(collection(db, 'audit_logs'), auditData);
    return docRef.id;
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Swallowing error to prevent main transaction failure
  }
};
