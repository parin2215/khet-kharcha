# 🌾 Khet Kharcha (खेत खर्चा)

> **अपने खेत का हिसाब** — Your farm's account

A complete farming expense management application for Indian farmers who farm their own land AND partner/leased land (batai/adha system).

## 🚀 Tech Stack

| Platform | Technology |
|----------|-----------|
| **Mobile** | React Native (Expo SDK 56) |
| **Web** | React 18 + Vite + Tailwind CSS |
| **Backend** | Firebase (Auth, Firestore, Storage, Cloud Messaging) |
| **State** | Zustand |
| **Charts** | react-native-chart-kit (mobile), Recharts (web) |
| **PDF** | expo-print (mobile), jsPDF (web) |
| **i18n** | i18next (Hindi, Gujarati, Marathi, English) |

## 📁 Project Structure

```
khet-kharcha/
├── mobile/          ← React Native Expo app (Android + iOS)
├── web/             ← React Vite web app
├── shared/          ← Shared types, constants, services, i18n
│   ├── constants/   ← Categories, states, seasons, colors
│   ├── services/    ← Firebase services (auth, CRUD, storage)
│   ├── i18n/        ← Translation files (en, hi, gu, mr)
│   ├── types/       ← Data model definitions
│   └── utils/       ← Helper functions (INR formatting, etc.)
├── firebase/        ← Security rules & seed script
├── firebase.json    ← Firebase Hosting config
└── README.md
```

## 🔧 Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project (created at https://console.firebase.google.com)

### 1. Firebase Configuration

1. Go to Firebase Console → Project Settings → Your apps
2. Copy the Firebase config object
3. Paste into `shared/firebase.config.js`

### 2. Mobile App

```bash
cd mobile
npm install
npx expo start
```

### 3. Web App

```bash
cd web
npm install
npm run dev
```

### 4. Seed Test Data

```bash
# Update TEST_USER_UID in firebase/seed.js first
node firebase/seed.js
```

### 5. Deploy Web App

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy --only hosting
```

## 🔐 Authentication

Three login methods:
1. **Email & Password** — Register/Login with email
2. **Google Sign-In** — OAuth popup (web) / native (mobile dev build)
3. **Phone OTP** — Indian mobile number (+91) with 6-digit OTP

## 🌍 Languages

- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 ગુજરાતી (Gujarati)
- 🇮🇳 मराठी (Marathi)
- 🇬🇧 English

## 📱 Features

- ✅ Farm management (own + partnership farms)
- ✅ Expense tracking with 15 categories
- ✅ Own vs Partner expense separation
- ✅ Partner settlement calculator
- ✅ Bills tracker (electricity, water, diesel)
- ✅ Reminders & notifications
- ✅ Reports with charts & analytics
- ✅ PDF export with WhatsApp sharing
- ✅ Receipt photo upload
- ✅ Season-wise filtering (Kharif/Rabi/Zaid)
- ✅ Offline support (mobile)
- ✅ Multi-language (4 languages)

## 🎨 Design

- Primary: `#1D9E75` (green)
- Accent: `#F59E0B` (amber)
- Own expenses: `#16a34a` (green)
- Partner expenses: `#d97706` (amber)
- INR formatting: ₹1,25,000 (Indian comma system)

## 📄 License

Private — All rights reserved.
