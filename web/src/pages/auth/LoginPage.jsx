import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { Mail, Lock, User, MapPin, Globe, Check, Phone, Shield } from 'lucide-react';
import { LANGUAGES } from '../../../../shared/constants/index.js';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';
import OTPModal from './OTPModal.jsx';
import ProfileCompletionModal from './ProfileCompletionModal.jsx';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    loading, 
    error, 
    setLoading,
    setError,
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    updateProfile 
  } = useAuthStore();

  const { language, setLanguage } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if logged in & profile complete
  useEffect(() => {
    if (user && profile) {
      if (profile.state && profile.name) {
        navigate('/dashboard');
      } else {
        setTempUser(user);
        setIsProfileCompletionOpen(true);
      }
    }
  }, [user, profile, navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setFormError('');
    setMessage('');

    if (activeTab === 'login') {
      try {
        await loginWithEmail(email, password);
      } catch (err) {
        setFormError(err.message || 'Login failed');
      }
    } else {
      if (password !== confirmPassword) {
        setFormError(t('auth.errors.passwordMismatch'));
        return;
      }
      if (password.length < 6) {
        setFormError(t('auth.errors.weakPassword'));
        return;
      }
      if (!selectedState) {
        setFormError('Please select your state');
        return;
      }

      try {
        await registerWithEmail(email, password, {
          name: fullName,
          state: selectedState,
          language: language,
          unitPreference: 'bigha',
        });
        setMessage('Registration successful!');
      } catch (err) {
        setFormError(err.message || 'Registration failed');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError('');
    try {
      const { user: authedUser, isNewUser } = await loginWithGoogle();
      if (isNewUser) {
        setTempUser(authedUser);
        setIsProfileCompletionOpen(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.message || 'Google Sign-In failed');
    }
  };

  const handlePhoneAuthSuccess = async (authedUser, isNewUser) => {
    setIsOtpOpen(false);
    if (isNewUser) {
      setTempUser(authedUser);
      setIsProfileCompletionOpen(true);
    } else {
      // Reload profile
      await useAuthStore.getState().initializeAuth();
      navigate('/dashboard');
    }
  };

  const handleProfileCompletionSubmit = async (data) => {
    try {
      await updateProfile(data);
      setIsProfileCompletionOpen(false);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Failed to complete profile');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-stone-50 to-emerald-100 p-4 md:p-6">
      
      {/* Language picker top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center bg-white/80 backdrop-blur border border-stone-200/50 rounded-xl p-1.5 shadow-sm">
        <Globe className="w-4 h-4 text-primary mr-1 ml-1" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-sm font-semibold text-stone-700 bg-transparent focus:outline-none cursor-pointer pr-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border border-stone-100 shadow-2xl p-6 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl text-primary mb-3">
            {/* SVG Wheat/Sprout Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3c-1.2 2-3.5 3-6 3m6-3c1.2 2 3.5 3 6 3m-6 5c-1.5 2-4.5 3-7 3m7-3c1.5 2 4.5 3 7 3m-7 5c-2 2-5 3-8 3m8-3c2 2 5 3 8 3" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
            {t('app.name')}
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            {t('app.tagline')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 mb-6 relative">
          <button
            onClick={() => { setActiveTab('login'); setFormError(''); }}
            className={`w-1/2 text-center py-3 font-semibold text-sm transition-colors duration-200 ${activeTab === 'login' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setFormError(''); }}
            className={`w-1/2 text-center py-3 font-semibold text-sm transition-colors duration-200 ${activeTab === 'register' ? 'text-primary' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {t('auth.register')}
          </button>
          <div 
            className={`absolute bottom-0 h-0.5 bg-primary transition-all duration-300`} 
            style={{ 
              width: '50%', 
              left: activeTab === 'login' ? '0%' : '50%' 
            }}
          />
        </div>

        {/* Messages */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-xs text-red-600 font-semibold rounded-xl flex items-center">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 shrink-0"></span>
            {formError}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-xs text-green-700 font-semibold rounded-xl flex items-center">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 shrink-0"></span>
            {message}
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-stone-400">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ram Singh"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">
                  {t('auth.state')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-stone-400">
                    <MapPin className="w-4.5 h-4.5" />
                  </span>
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white appearance-none"
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
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kisan@khet.com"
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-500">
                {t('auth.password')}
              </label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => {
                    // Password Reset Link
                    if (!email) {
                      setFormError(t('auth.errors.invalidEmail'));
                      return;
                    }
                    setLoading(true);
                    setError(null);
                    import('../../../../shared/services/auth.js')
                      .then(m => m.sendPasswordReset(email))
                      .then(() => {
                        setMessage('Password reset email sent. Check your inbox!');
                        setLoading(false);
                      })
                      .catch(e => {
                        setFormError(e.message);
                        setLoading(false);
                      });
                  }}
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            /* Confirm Password */
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-stone-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-stone-50/50 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 mt-2 cursor-pointer flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            {activeTab === 'login' ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-150"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold text-stone-400 uppercase">
            {t('auth.orDivider')}
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition font-semibold text-sm text-stone-700 shadow-sm cursor-pointer"
          >
            {/* Google G Logo */}
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <button
            type="button"
            onClick={() => setIsOtpOpen(true)}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/20 bg-primary-light/30 text-primary hover:bg-primary-light/60 transition font-semibold text-sm shadow-sm cursor-pointer"
          >
            <Phone className="w-4.5 h-4.5" />
            {t('auth.phone')}
          </button>
        </div>

        {/* Secure badge */}
        <div className="flex items-center justify-center text-[10px] text-stone-400 mt-6 gap-1 font-semibold uppercase tracking-wider">
          <Shield className="w-3 h-3 text-stone-400" />
          Firebase Secure Authentication
        </div>

      </div>

      {/* Modals */}
      <OTPModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onAuthSuccess={handlePhoneAuthSuccess}
      />

      <ProfileCompletionModal
        isOpen={isProfileCompletionOpen}
        onSubmit={handleProfileCompletionSubmit}
        initialName={tempUser?.displayName || ''}
      />

    </div>
  );
}
