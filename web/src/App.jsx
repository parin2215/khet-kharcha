import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.js';
import { useSettingsStore } from './store/useSettingsStore.js';
import { initAuth, initFirestore } from '../../shared/services/firebaseInit.js';

// Layout and routing wrappers
import Layout from './components/Layout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';

// Pages
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import FarmsPage from './pages/farms/FarmsPage.jsx';
import FarmDetailPage from './pages/farms/FarmDetailPage.jsx';
import AddFarmPage from './pages/farms/AddFarmPage.jsx';
import AddExpensePage from './pages/expenses/AddExpensePage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import PartnerSettlementPage from './pages/partners/PartnerSettlementPage.jsx';
import BillsPage from './pages/bills/BillsPage.jsx';
import RemindersPage from './pages/reminders/RemindersPage.jsx';
import SettingsPage from './pages/settings/SettingsPage.jsx';
import PartnershipTermsBuilderPage from './pages/partners/PartnershipTermsBuilderPage.jsx';
import HarvestEntryPage from './pages/farms/HarvestEntryPage.jsx';
import LandingPage from './pages/landing/LandingPage.jsx';
import PartnersPage from './pages/partners/PartnersPage.jsx';

function ProtectedRoute({ children }) {
  const { user, initialized, loading } = useAuthStore();
  
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F5]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-[#6b6b67] animate-pulse">Loading Khet Kharcha...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { initializeAuth, profile } = useAuthStore();
  const { syncFromProfile } = useSettingsStore();

  // Initialize Firebase and Auth listener on mount
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initAuth(true);
        await initFirestore(true);
        const unsubscribe = initializeAuth();
        return unsubscribe;
      } catch (e) {
        console.error('Firebase setup failed', e);
      }
    };
    
    let unsubscribeFn;
    setupFirebase().then(unsub => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [initializeAuth]);

  // Sync settings when profile updates
  useEffect(() => {
    if (profile) {
      syncFromProfile(profile);
    }
  }, [profile, syncFromProfile]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/farms" element={
          <ProtectedRoute>
            <FarmsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/farms/new" element={
          <ProtectedRoute>
            <AddFarmPage />
          </ProtectedRoute>
        } />
        
        <Route path="/farms/:id" element={
          <ProtectedRoute>
            <FarmDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/expenses/new" element={
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        } />
        
        <Route path="/add-expense" element={
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/partners/:farmId" element={
          <ProtectedRoute>
            <PartnerSettlementPage />
          </ProtectedRoute>
        } />

        <Route path="/partners" element={
          <ProtectedRoute>
            <PartnersPage />
          </ProtectedRoute>
        } />

        <Route path="/expenses/:expenseId/edit" element={
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        } />

        <Route path="/farms/:farmId/partners/new" element={
          <ProtectedRoute>
            <PartnershipTermsBuilderPage />
          </ProtectedRoute>
        } />

        <Route path="/farms/:farmId/partners/:partnerId/edit" element={
          <ProtectedRoute>
            <PartnershipTermsBuilderPage />
          </ProtectedRoute>
        } />

        <Route path="/farms/:farmId/harvest" element={
          <ProtectedRoute>
            <HarvestEntryPage />
          </ProtectedRoute>
        } />
        
        <Route path="/bills" element={
          <ProtectedRoute>
            <BillsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/reminders" element={
          <ProtectedRoute>
            <RemindersPage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
