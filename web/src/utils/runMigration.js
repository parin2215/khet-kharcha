import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Replace with local config if needed, or just import
import { firebaseConfig, COLLECTIONS } from '../../../shared/firebase.config.js';

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export const runMigration = async () => {
  console.log("Starting Migration: Expenses & Harvests -> Transactions...");
  
  try {
    const expensesSnap = await getDocs(collection(db, COLLECTIONS.EXPENSES));
    const farmsSnap = await getDocs(collection(db, COLLECTIONS.FARMS));
    
    let batch = writeBatch(db);
    let operationCount = 0;
    
    const commitBatchIfNeeded = async () => {
      if (operationCount >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
        console.log("Committed batch...");
      }
    };

    // 1. Migrate Expenses
    for (const docSnap of expensesSnap.docs) {
      const data = docSnap.data();
      const legacyId = docSnap.id;
      
      const newRef = doc(collection(db, COLLECTIONS.TRANSACTIONS), legacyId); // Reuse ID for consistency
      
      let type = 'expense';
      let loanDirection = null;

      if (data.category === 'loan_interest') {
        type = 'loan';
        // Legacy 'Lend Money' implicitly meant Owner lent to Partner
        loanDirection = 'owner_to_partner'; 
      }
      
      const txData = {
        ...data,
        type,
        legacyId,
        loanDirection,
        migratedAt: serverTimestamp()
      };
      
      batch.set(newRef, txData);
      operationCount++;
      await commitBatchIfNeeded();
    }
    
    // 2. Migrate Harvests from Farms
    for (const farmSnap of farmsSnap.docs) {
      const farmData = farmSnap.data();
      const farmId = farmSnap.id;
      
      if (farmData.harvests && Array.isArray(farmData.harvests)) {
        for (const harvest of farmData.harvests) {
          const newRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
          
          const txData = {
            farmId,
            ownerId: farmData.ownerId,
            type: 'crop_sale',
            category: 'crop_sale',
            amount: parseFloat(harvest.totalSaleAmount) || 0,
            totalYield: parseFloat(harvest.totalYield) || 0,
            yieldUnit: harvest.yieldUnit || 'kg',
            mandiRate: parseFloat(harvest.mandiRate) || 0,
            date: harvest.date || harvest.recordedAt || serverTimestamp(),
            createdAt: harvest.recordedAt || serverTimestamp(),
            migratedAt: serverTimestamp(),
            notes: harvest.notes || `Harvest of ${harvest.cropName || 'Crop'}`
          };
          
          batch.set(newRef, txData);
          operationCount++;
          await commitBatchIfNeeded();
        }
      }
    }
    
    if (operationCount > 0) {
      await batch.commit();
    }
    
    console.log("Migration completed successfully!");
    return true;
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  }
};
