/**
 * Khet Kharcha — Seed Script
 * Run this to populate Firestore with test data
 * 
 * Usage: node firebase/seed.js
 * 
 * Prerequisites:
 * 1. Set your Firebase config in shared/firebase.config.js
 * 2. Create a test user in Firebase Auth first (or use the app to register)
 * 3. Update TEST_USER_UID below with the actual uid
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ⚠️ Replace this with your actual test user's UID from Firebase Auth (or pass it as an argument/environment variable)
const TEST_USER_UID = process.env.TEST_USER_UID || process.argv[2] || 'REPLACE_WITH_YOUR_TEST_USER_UID';

const now = new Date();
const daysAgo = (days) => Timestamp.fromDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
const daysFromNow = (days) => Timestamp.fromDate(new Date(now.getTime() + days * 24 * 60 * 60 * 1000));

async function seed() {
  console.log('🌱 Seeding Khet Kharcha test data...\n');

  // ━━━ User Profile ━━━
  console.log('👤 Creating user profile...');
  await setDoc(doc(db, 'users', TEST_USER_UID), {
    name: 'Ramji Patel',
    email: 'ramji.patel@test.com',
    phone: '+919876543210',
    photoURL: '',
    state: 'GJ',
    language: 'hi',
    unitPreference: 'bigha',
    createdAt: Timestamp.fromDate(now),
    lastLoginAt: Timestamp.fromDate(now),
  });

  // ━━━ Farms ━━━
  console.log('🌾 Creating farms...');
  
  const farm1Ref = await addDoc(collection(db, 'farms'), {
    ownerId: TEST_USER_UID,
    name: 'Ghar nu Khet',
    location: 'Anand, Gujarat',
    sizeValue: 3,
    sizeUnit: 'bigha',
    ownershipType: 'own',
    cropSeason: 'kharif',
    currentCrop: 'Cotton',
    partners: [],
    active: true,
    createdAt: Timestamp.fromDate(now),
    notes: 'Main cotton field near home',
  });

  const farm2Ref = await addDoc(collection(db, 'farms'), {
    ownerId: TEST_USER_UID,
    name: 'Kaka nu Khet',
    location: 'Nadiad, Gujarat',
    sizeValue: 5,
    sizeUnit: 'bigha',
    ownershipType: 'partner',
    cropSeason: 'rabi',
    currentCrop: 'Wheat',
    partners: [{ partnerId: 'bhavesh_001', name: 'Bhavesh Patel', phone: '9876543211', sharePercent: 50 }],
    active: true,
    createdAt: Timestamp.fromDate(now),
    notes: 'Partnership with uncle Bhavesh',
  });

  const farm3Ref = await addDoc(collection(db, 'farms'), {
    ownerId: TEST_USER_UID,
    name: 'Pagdi Khet',
    location: 'Petlad, Gujarat',
    sizeValue: 2,
    sizeUnit: 'bigha',
    ownershipType: 'partner',
    cropSeason: 'kharif',
    currentCrop: 'Groundnut',
    partners: [{ partnerId: 'suresh_001', name: 'Suresh Bhai', phone: '9876543212', sharePercent: 40 }],
    active: true,
    createdAt: Timestamp.fromDate(now),
    notes: 'Leased land for groundnut',
  });

  // ━━━ Partners ━━━
  console.log('🤝 Creating partners...');
  
  await addDoc(collection(db, 'partners'), {
    farmId: farm2Ref.id,
    ownerId: TEST_USER_UID,
    name: 'Bhavesh Patel',
    phone: '9876543211',
    sharePercent: 50,
    totalOwed: 12500,
    totalPaid: 5000,
    notes: 'Uncle Bhavesh - 50% share',
    createdAt: Timestamp.fromDate(now),
  });

  await addDoc(collection(db, 'partners'), {
    farmId: farm3Ref.id,
    ownerId: TEST_USER_UID,
    name: 'Suresh Bhai',
    phone: '9876543212',
    sharePercent: 40,
    totalOwed: 8000,
    totalPaid: 3000,
    notes: 'Suresh Bhai - 40% share on pagdi',
    createdAt: Timestamp.fromDate(now),
  });

  // ━━━ Expenses ━━━
  console.log('💰 Creating expenses...');

  const expenses = [
    { farmId: farm1Ref.id, category: 'fertilizer', amount: 4500, expenseType: 'own', note: 'DAP fertilizer 2 bags', date: daysAgo(2), season: 'kharif' },
    { farmId: farm1Ref.id, category: 'pesticide', amount: 1800, expenseType: 'own', note: 'Insecticide spray', date: daysAgo(5), season: 'kharif' },
    { farmId: farm1Ref.id, category: 'labour', amount: 3000, expenseType: 'own', note: '3 workers × 2 days', date: daysAgo(7), season: 'kharif' },
    { farmId: farm2Ref.id, category: 'seeds', amount: 6000, expenseType: 'own', note: 'Wheat seeds HD-2967', date: daysAgo(10), season: 'rabi' },
    { farmId: farm2Ref.id, category: 'machinery', amount: 5000, expenseType: 'partner', partnerName: 'Bhavesh Patel', note: 'Tractor for plowing', date: daysAgo(12), season: 'rabi' },
    { farmId: farm2Ref.id, category: 'irrigation', amount: 2500, expenseType: 'own', note: 'Drip irrigation parts', date: daysAgo(15), season: 'rabi' },
    { farmId: farm3Ref.id, category: 'seeds', amount: 3500, expenseType: 'own', note: 'Groundnut seeds', date: daysAgo(18), season: 'kharif' },
    { farmId: farm3Ref.id, category: 'diesel', amount: 2000, expenseType: 'partner', partnerName: 'Suresh Bhai', note: 'Diesel for pump', date: daysAgo(20), season: 'kharif' },
    { farmId: farm1Ref.id, category: 'transport', amount: 1500, expenseType: 'own', note: 'Truck to mandi', date: daysAgo(25), season: 'kharif' },
    { farmId: farm2Ref.id, category: 'electricity', amount: 4200, expenseType: 'own', note: 'DGVCL bill May', date: daysAgo(30), season: 'rabi' },
  ];

  for (const exp of expenses) {
    await addDoc(collection(db, 'expenses'), {
      ...exp,
      ownerId: TEST_USER_UID,
      receiptURL: '',
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
  }

  // ━━━ Bills ━━━
  console.log('📄 Creating bills...');

  await addDoc(collection(db, 'bills'), {
    farmId: farm1Ref.id,
    ownerId: TEST_USER_UID,
    billType: 'electricity',
    providerName: 'DGVCL',
    amount: 4200,
    billMonth: '2026-05',
    dueDate: daysFromNow(5),
    paidDate: null,
    paid: false,
    receiptURL: '',
    createdAt: Timestamp.fromDate(now),
  });

  await addDoc(collection(db, 'bills'), {
    farmId: farm2Ref.id,
    ownerId: TEST_USER_UID,
    billType: 'diesel',
    providerName: 'Indian Oil',
    amount: 3500,
    billMonth: '2026-06',
    dueDate: daysAgo(3),
    paidDate: null,
    paid: false,
    receiptURL: '',
    createdAt: Timestamp.fromDate(now),
  });

  // ━━━ Reminders ━━━
  console.log('🔔 Creating reminders...');

  await addDoc(collection(db, 'reminders'), {
    ownerId: TEST_USER_UID,
    farmId: farm1Ref.id,
    title: 'Cotton spray schedule',
    description: 'Apply Monocrotophos spray on cotton field',
    dueDate: daysFromNow(3),
    type: 'spray',
    done: false,
    fcmSent: false,
    createdAt: Timestamp.fromDate(now),
  });

  await addDoc(collection(db, 'reminders'), {
    ownerId: TEST_USER_UID,
    farmId: farm1Ref.id,
    title: 'DGVCL bill due',
    description: 'Pay electricity bill before due date',
    dueDate: daysFromNow(5),
    type: 'bill',
    done: false,
    fcmSent: false,
    createdAt: Timestamp.fromDate(now),
  });

  await addDoc(collection(db, 'reminders'), {
    ownerId: TEST_USER_UID,
    farmId: farm3Ref.id,
    title: 'Groundnut harvest',
    description: 'Expected harvest date for groundnut field',
    dueDate: daysFromNow(45),
    type: 'harvest',
    done: false,
    fcmSent: false,
    createdAt: Timestamp.fromDate(now),
  });

  console.log('\n✅ Seed data created successfully!');
  console.log(`   User: Ramji Patel (${TEST_USER_UID})`);
  console.log(`   Farms: 3 (${farm1Ref.id}, ${farm2Ref.id}, ${farm3Ref.id})`);
  console.log('   Expenses: 10');
  console.log('   Bills: 2');
  console.log('   Reminders: 3');
  console.log('   Partners: 2');
  
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
