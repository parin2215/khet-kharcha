import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Globe, Scale } from 'lucide-react';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';
import { LANGUAGES, SIZE_UNITS } from '../../../../shared/constants/index.js';

export default function ProfileCompletionModal({ isOpen, onSubmit, initialName = '' }) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [state, setState] = useState('');
  const [language, setLanguage] = useState('hi');
  const [unit, setUnit] = useState('bigha');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('auth.errors.invalidEmail')); // name validation placeholder
      return;
    }
    if (!state) {
      setError('Please select a state');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit({
        name,
        state,
        language,
        unitPreference: unit,
      });
    } catch (err) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-center text-[#1a1a18] mb-2">
            {t('auth.completeProfile')}
          </h3>
          <p className="text-sm text-center text-[#6b6b67] mb-6">
            We need a few details to set up your Khet Kharcha dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#6b6b67] mb-1">
                {t('auth.fullName')} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-[#6b6b67]">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ram Singh"
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-[#6b6b67] mb-1">
                {t('auth.state')} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-[#6b6b67]">
                  <MapPin className="w-4 h-4" />
                </span>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white appearance-none"
                >
                  <option value="">-- {t('auth.selectState')} --</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.nameHi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-[#6b6b67] mb-1">
                {t('auth.selectLanguage')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-[#6b6b67]">
                  <Globe className="w-4 h-4" />
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white appearance-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit Preference */}
            <div>
              <label className="block text-sm font-medium text-[#6b6b67] mb-1">
                {t('auth.selectUnit')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-[#6b6b67]">
                  <Scale className="w-4 h-4" />
                </span>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white appearance-none"
                >
                  {SIZE_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {t(u.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200"
            >
              {loading ? t('common.loading') : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
