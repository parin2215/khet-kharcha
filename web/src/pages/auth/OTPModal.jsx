import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import { sendOTPWeb, verifyOTPWeb } from '../../../../shared/services/auth.js';
import { getAuthInstance } from '../../../../shared/services/firebaseInit.js';
import { RecaptchaVerifier } from 'firebase/auth';

export default function OTPModal({ isOpen, onClose, onAuthSuccess }) {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpInputs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Clean up recaptcha container on close or step changes
  useEffect(() => {
    if (isOpen && step === 1) {
      // Small timeout to ensure container is in DOM
      const timer = setTimeout(() => {
        try {
          const auth = getAuthInstance();
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            }
          });
          setRecaptchaVerifier(verifier);
        } catch (e) {
          console.error('Failed to initialize recaptcha', e);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError(t('auth.errors.invalidPhone'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const fullPhone = `+91${phoneNumber}`;
      const result = await sendOTPWeb(fullPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
      setTimer(30);
    } catch (err) {
      console.error('OTP Send Error', err);
      setError(err.message || t('common.error'));
      // Reset recaptcha if it fails
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError(t('auth.errors.invalidOTP'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { user, isNewUser } = await verifyOTPWeb(confirmationResult, code);
      onAuthSuccess(user, isNewUser);
    } catch (err) {
      console.error('OTP Verification Error', err);
      setError(t('auth.errors.invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value.substring(value.length - 1);
    setVerificationCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits filled
    if (newCode.every(num => num !== '') && index === 5) {
      setTimeout(() => {
        // Small delay to let input render
        const finalCode = newCode.join('');
        setLoading(true);
        verifyOTPWeb(confirmationResult, finalCode)
          .then(({ user, isNewUser }) => {
            onAuthSuccess(user, isNewUser);
          })
          .catch((err) => {
            console.error('Auto verify failed', err);
            setError(t('auth.errors.invalidOTP'));
            setLoading(false);
          });
      }, 50);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError('');
    try {
      const fullPhone = `+91${phoneNumber}`;
      const result = await sendOTPWeb(fullPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setTimer(30);
      setVerificationCode(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#6b6b67] hover:text-[#1a1a18] hover:bg-stone-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {step === 1 ? (
            <div>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-50 text-primary rounded-full">
                  <Phone className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-[#1a1a18] mb-2">
                {t('auth.signInWithPhone')}
              </h3>
              <p className="text-sm text-center text-[#6b6b67] mb-6">
                {t('auth.enterPhone')}
              </p>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6b6b67] mb-1">
                    {t('auth.phone')}
                  </label>
                  <div className="relative flex rounded-xl border border-stone-200 shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition">
                    <span className="flex items-center justify-center px-4 bg-stone-100 border-r border-stone-200 text-sm font-medium text-[#1a1a18]">
                      +91
                    </span>
                    <input 
                      type="tel"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                )}

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200"
                >
                  {loading ? t('common.loading') : t('auth.sendOTP')}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setStep(1)}
                className="flex items-center text-xs font-semibold text-primary mb-4 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                {t('common.cancel')}
              </button>

              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-50 text-primary rounded-full">
                  <MessageSquare className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-[#1a1a18] mb-2">
                {t('auth.enterOTP')}
              </h3>
              <p className="text-sm text-center text-[#6b6b67] mb-6">
                {t('auth.otpSent', { phone: phoneNumber })}
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none rounded-xl transition shadow-sm bg-stone-50 focus:bg-white"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                )}

                <div className="text-center">
                  {timer > 0 ? (
                    <span className="text-xs text-[#6b6b67] font-medium">
                      {t('auth.resendIn', { seconds: timer })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs font-semibold text-primary hover:underline hover:text-primary-dark"
                    >
                      {t('auth.resendOTP')}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.some(num => num === '')}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200"
                >
                  {loading ? t('common.loading') : t('auth.verifyOTP')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
