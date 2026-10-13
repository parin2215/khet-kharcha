import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Sprout, 
  PlusCircle, 
  BarChart3, 
  Receipt, 
  Bell, 
  Settings, 
  LogOut, 
  Wheat, 
  Globe, 
  User, 
  Users,
  Activity,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { LANGUAGES } from '../../../shared/constants/index.js';
import BottomNav from './BottomNav.jsx';

export default function Layout({ children }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();

  // Keyboard navigation shortcuts (Desktop power users)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        navigate('/current-state');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        navigate('/farms');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const navItems = [
    { to: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('navigation.farms'), icon: Sprout },
    { to: '/current-state', label: 'Current State', icon: Activity },
    { to: '/library', label: 'Library', icon: BookOpen },
    { to: '/partners', label: t('navigation.partners') || 'Partners', icon: Users },
    { to: '/bills', label: t('navigation.bills'), icon: Receipt },
    { to: '/reminders', label: t('navigation.reminders'), icon: Bell },
    { to: '/settings', label: t('settings.title'), icon: Settings },
  ];

  // Derive page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return t('navigation.dashboard');
    if (path.startsWith('/current-state')) return 'Current State - Ongoing Crops';
    if (path.startsWith('/library')) return 'Crop Knowledge Library & Agronomy Guides';
    if (path.startsWith('/farms/new')) return 'Add Farm';
    if (path.startsWith('/farms/')) return 'Farm Details & Historical Analytics';
    if (path.startsWith('/farms')) return t('navigation.farms');
    if (path.startsWith('/expenses/new')) return t('navigation.addExpense');
    if (path.startsWith('/reports')) return t('navigation.reports');
    if (path.startsWith('/partners/')) return 'Partner Settlement';
    if (path.startsWith('/partners')) return 'Partners Management';
    if (path.startsWith('/bills')) return t('navigation.bills');
    if (path.startsWith('/reminders')) return t('navigation.reminders');
    if (path.startsWith('/settings')) return t('settings.title');
    return t('app.name');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F7F5]">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1a1a18] text-white border-r border-stone-850 shrink-0">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-stone-800">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/20 rounded-xl text-primary">
            <Wheat className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block">{t('app.name')}</span>
            <span className="text-[10px] text-stone-400 font-medium block">{t('app.tagline')}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                      : 'text-stone-300 hover:bg-stone-800/50 hover:text-white border border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Info & Logout */}
        <div className="p-4 border-t border-stone-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-primary overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-stone-100">{profile?.name || 'Ramji Patel'}</p>
              <p className="text-xs text-stone-400 truncate">{profile?.email || profile?.phone || 'Farmer Account'}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-stone-800/50 hover:bg-red-950/20 hover:text-red-400 text-stone-300 border border-stone-800 hover:border-red-900/30 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t('auth.logout')}
          </button>
        </div>

      </aside>

      {/* Mobile Header (Sticky top) */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1a1a18] text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg text-primary">
            <Wheat className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight">{t('app.name')}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar - Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200/50 shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-[#1a1a18]">{getPageTitle()}</h2>

          <div className="flex items-center gap-6">
            {/* Quick Keyboard shortcuts helper */}
            <div className="hidden lg:flex items-center text-xs text-stone-400 gap-3 border-r border-stone-200 pr-6">
              <span>Shortcuts:</span>
              <span className="bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-bold font-mono">C</span> Current State
              <span className="bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-bold font-mono">F</span> Farms
              
            </div>

            {/* Language Selection */}
            <div className="flex items-center bg-stone-100 hover:bg-stone-200/50 border border-stone-200/50 rounded-xl p-1.5 shadow-sm transition">
              <Globe className="w-4 h-4 text-emerald-600 mr-1.5 ml-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs font-bold text-stone-700 bg-transparent focus:outline-none cursor-pointer pr-2"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

      {/* Fixed Bottom Nav (mobile only) */}
      <BottomNav />

    </div>
  );
}
