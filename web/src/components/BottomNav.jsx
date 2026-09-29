import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { 
  Home, 
  Sprout, 
  Plus, 
  BarChart3, 
  Menu, 
  FileText, 
  Users, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

const LABELS = {
  home: { en: 'Home', hi: 'होम', gu: 'હોમ', mr: 'होम' },
  farms: { en: 'Farms', hi: 'खेत', gu: 'ખેત', mr: 'शेत' },
  add: { en: 'Add', hi: 'जोड़ें', gu: 'ઉમેરો', mr: 'जोडा' },
  reports: { en: 'Reports', hi: 'रिपोर्ट', gu: 'રિપોર્ટ', mr: 'रिपोर्ट' },
  more: { en: 'More', hi: 'अधिक', gu: 'વધુ', mr: 'अधिक' },
  agreement: { en: 'Partnership Agreement', hi: 'भागीदारी समझौता', gu: 'ભાગીદારી પત્રક', mr: 'भागीदारी करारनामा' },
  settlement: { en: 'Partner Settlement', hi: 'सांझेदारी का निपटारा', gu: 'ભાગીદારી વહેંચણી', mr: 'भागीदाराचा हिशोब' },
  partners: { en: 'Partners Management', hi: 'भागीदार प्रबंधन', gu: 'ભાગીદાર સંચાલન', mr: 'भागीदार व्यवस्थापन' },
  bills: { en: 'Bills & Reminders', hi: 'बिल और रिमाइंडर', gu: 'બિલ और रीमाइंडर्स', mr: 'बिल व रिमाइंडर' },
  profile: { en: 'Profile & Settings', hi: 'प्रोफ़ाइल और सेटिंग्स', gu: 'પ્રોફાઇલ અને સેટિંગ્સ', mr: 'प्रोफाइल आणि सेटिंग्ज' },
  logout: { en: 'Logout', hi: 'लॉगआउट', gu: 'લોગઆઉટ', mr: 'लॉगआउट' }
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useSettingsStore();
  const { logout } = useAuthStore();
  
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [clickedTab, setClickedTab] = useState(null);
  
  // Touch dragging state for Bottom Sheet
  const [touchStartY, setTouchStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const lang = language === 'en' || language === 'hi' || language === 'gu' || language === 'mr' ? language : 'hi';

  const currentPath = location.pathname;
  const isHomeActive = currentPath === '/dashboard';
  const isFarmsActive = currentPath.startsWith('/farms') && !currentPath.includes('/harvest') && !currentPath.includes('/partners/new') && !currentPath.includes('/edit');
  const isAddActive = currentPath === '/add-expense' || currentPath === '/expenses/new';
  const isReportsActive = currentPath === '/reports';

  const handleTabClick = (route, tabName) => {
    setClickedTab(tabName);
    setTimeout(() => setClickedTab(null), 300);
    
    if (route) {
      setIsMoreOpen(false);
      navigate(route);
    } else {
      setIsMoreOpen(true);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateY > 100) {
      setIsMoreOpen(false);
    }
    setTranslateY(0);
  };

  const handleLogout = async () => {
    setIsMoreOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const renderTab = (isActive, icon, labelKey, route, tabName) => {
    const IconComponent = icon;
    const isClicked = clickedTab === tabName;
    
    return (
      <button 
        onClick={() => handleTabClick(route, tabName)}
        className="flex-1 flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer"
        aria-label={LABELS[labelKey][lang]}
        aria-current={isActive ? 'page' : undefined}
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        <div 
          className={`flex items-center justify-center rounded-xl transition-all duration-200 ${
            isActive 
              ? 'py-1 px-3 bg-[#FF9933]/10 text-[#FF9933]' 
              : 'text-stone-400'
          } ${isClicked ? 'animate-tab-bounce' : ''}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <span 
          className={`text-[10px] mt-0.5 transition-colors duration-200 ${
            isActive ? 'font-bold text-[#FF9933]' : 'font-medium text-stone-400'
          }`}
        >
          {LABELS[labelKey][lang]}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200/60 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:hidden flex items-center justify-between px-2"
        style={{ zIndex: 9999, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {renderTab(isHomeActive, Home, 'home', '/dashboard', 'home')}
        {renderTab(isFarmsActive, Sprout, 'farms', '/farms', 'farms')}
        
        {/* Highlighted Center Add Expense Button */}
        <button
          onClick={() => handleTabClick('/add-expense', 'add')}
          className="flex flex-col items-center justify-center -mt-5 focus:outline-none cursor-pointer"
          aria-label={LABELS.add[lang]}
          style={{ minWidth: '56px', minHeight: '56px' }}
        >
          <div className="w-[52px] h-[52px] bg-gradient-to-tr from-[#FF9933] to-[#2D6A4F] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 animate-add-pulse">
            <Plus className="w-7 h-7 stroke-[3px]" />
          </div>
          <span className="text-[10px] font-bold text-stone-500 mt-1">
            {LABELS.add[lang]}
          </span>
        </button>

        {renderTab(isReportsActive, BarChart3, 'reports', '/reports', 'reports')}
        {renderTab(isMoreOpen, Menu, 'more', null, 'more')}
      </nav>

      {/* Draggable More Bottom Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[99998] md:hidden">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-bottom-sheet"
            style={{
              transform: `translateY(${translateY}px)`,
              paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
          >
            {/* Drag Handle Bar */}
            <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1 bg-stone-300 rounded-full" />
            </div>

            {/* List Rows */}
            <div className="px-4 space-y-1 overflow-y-auto">
              
              {/* Partnership Agreement */}
              <button
                onClick={() => handleTabClick('/farms', 'agreement')}
                className="w-full h-[52px] flex items-center justify-between border-b border-stone-100 hover:bg-stone-50 px-2 rounded-xl transition active:bg-stone-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-stone-700">{LABELS.agreement[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Partner Settlement */}
              <button
                onClick={() => handleTabClick('/farms', 'settlement')}
                className="w-full h-[52px] flex items-center justify-between border-b border-stone-100 hover:bg-stone-50 px-2 rounded-xl transition active:bg-stone-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-stone-700">{LABELS.settlement[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Partners Management */}
              <button
                onClick={() => handleTabClick('/partners', 'partners')}
                className="w-full h-[52px] flex items-center justify-between border-b border-stone-100 hover:bg-stone-50 px-2 rounded-xl transition active:bg-stone-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-stone-700">{LABELS.partners[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Bills & Reminders */}
              <button
                onClick={() => handleTabClick('/bills', 'bills')}
                className="w-full h-[52px] flex items-center justify-between border-b border-stone-100 hover:bg-stone-50 px-2 rounded-xl transition active:bg-stone-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-stone-700">{LABELS.bills[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Profile / Settings */}
              <button
                onClick={() => handleTabClick('/settings', 'profile')}
                className="w-full h-[52px] flex items-center justify-between border-b border-stone-100 hover:bg-stone-50 px-2 rounded-xl transition active:bg-stone-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#2D6A4F]" />
                  <span className="text-xs font-bold text-stone-700">{LABELS.profile[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Logout (Red) */}
              <button
                onClick={handleLogout}
                className="w-full h-[52px] flex items-center justify-between hover:bg-red-50 px-2 rounded-xl transition active:bg-red-100 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-red-650">
                  <LogOut className="w-5 h-5" />
                  <span className="text-xs font-bold">{LABELS.logout[lang]}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-300" />
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
