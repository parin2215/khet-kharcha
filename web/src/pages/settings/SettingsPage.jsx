import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { Settings, User, MapPin, Globe, Scale, Download, Save, ShieldCheck } from 'lucide-react';
import { LANGUAGES, SIZE_UNITS } from '../../../../shared/constants/index.js';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';
import Toast from '../../components/Toast.jsx';
import { toLocalDateString } from '../../../../shared/utils/helpers.js';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useAuthStore();
  const { language, setLanguage, unitPreference, setUnitPreference } = useSettingsStore();

  const [name, setName] = useState(profile?.name || '');
  const [state, setState] = useState(profile?.state || '');
  
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      await updateProfile({
        name,
        state
      });
      setToastMsg('Profile details updated successfully');
      setToastType('success');
    } catch (err) {
      setToastMsg(err.message || 'Error updating profile');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const exportData = {
        profile,
        farms: useFarmStore.getState().farms,
        transactions: useTransactionStore.getState().transactions,
        bills: useBillStore.getState().bills,
        reminders: useReminderStore.getState().reminders
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `khet_kharcha_data_backup_${toLocalDateString()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToastMsg('All data exported as backup file successfully');
      setToastType('success');
    } catch (err) {
      setToastMsg('Backup generation failed');
      setToastType('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Title */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900">{t('settings.title')}</h1>
        <p className="text-xs text-stone-400 font-medium mt-1">
          Customize display parameters, preferred size units, and download full backups.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Profile Card */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('settings.profile')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                {t('auth.fullName')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                {t('auth.state')}
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
              >
                <option value="">-- Select --</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-stone-100">
            <button
              type="submit"
              disabled={loading || !name}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl text-sm shadow transition duration-200 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : t('settings.save')}
            </button>
          </div>
        </form>

        {/* Display preferences */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Display Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Language */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe className="w-4 h-4 text-stone-400" />
                {t('settings.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Land Area Unit */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Scale className="w-4 h-4 text-stone-400" />
                {t('settings.unitPreference')}
              </label>
              <select
                value={unitPreference}
                onChange={(e) => setUnitPreference(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
              >
                {SIZE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {t(u.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Database Export & Backups */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            {t('settings.exportData')}
          </h3>
          <p className="text-xs text-stone-400 font-medium">
            Export a full JSON backup of your farms list, expense entries, utility statements, and reminder lists.
          </p>

          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-stone-100 hover:bg-stone-200/50 text-stone-700 font-bold border border-stone-200/60 rounded-xl text-sm transition duration-200 cursor-pointer shadow-sm"
          >
            <Download className="w-4.5 h-4.5" />
            Download complete database JSON
          </button>
        </div>

      </div>
    </div>
  );
}
