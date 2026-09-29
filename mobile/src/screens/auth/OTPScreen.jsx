import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { app } from '../../../../shared/services/firebaseInit.js';

// Mock verifier modal since expo-firebase-recaptcha is deprecated and removed in Expo SDK 56
const FirebaseRecaptchaVerifierModal = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    verify: async () => 'mock-recaptcha-token',
  }));
  return null;
});

export default function OTPScreen({ navigation }) {
  const { t } = useTranslation();
  const { sendPhoneOTP, verifyPhoneOTP, loading, error, setError } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [timer, setTimer] = useState(0);

  const recaptchaVerifier = useRef(null);
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

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError(t('auth.errors.invalidPhone'));
      return;
    }

    try {
      const fullPhone = `+91${phoneNumber}`;
      const id = await sendPhoneOTP(fullPhone, recaptchaVerifier.current);
      setVerificationId(id);
      setStep(2);
      setTimer(30);
    } catch (err) {
      console.error('OTP Send Error', err);
    }
  };

  const handleVerifyOTP = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(t('auth.errors.invalidOTP'));
      return;
    }

    try {
      const { isNewUser } = await verifyPhoneOTP(verificationId, fullCode);
      if (isNewUser) {
        navigation.navigate('ProfileCompletion');
      } else {
        // Auth state listener handles navigation
      }
    } catch (err) {
      console.error('OTP Verify Error', err);
    }
  };

  const handleOtpChange = (index, val) => {
    if (isNaN(val)) return;
    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    if (val && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => {
            setError(null);
            if (step === 2) setStep(1);
            else navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* reCAPTCHA component */}
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          attemptInvisible={true}
        />

        <View style={styles.content}>
          {step === 1 ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="phone-portrait-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>{t('auth.signInWithPhone')}</Text>
              <Text style={styles.description}>{t('auth.enterPhone')}</Text>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.phoneInputContainer}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(val) => setPhoneNumber(val.replace(/\D/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  mode="outlined"
                  placeholder="9876543210"
                  activeOutlineColor={COLORS.primary}
                  style={styles.phoneInput}
                  theme={{ roundness: 10 }}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSendOTP}
                loading={loading}
                disabled={loading || phoneNumber.length !== 10}
                style={styles.submitBtn}
                buttonColor={COLORS.primary}
              >
                {t('auth.sendOTP')}
              </Button>
            </>
          ) : (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.title}>{t('auth.enterOTP')}</Text>
              <Text style={styles.description}>
                {t('auth.otpSent', { phone: phoneNumber })}
              </Text>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.otpInputContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => (otpInputs.current[index] = el)}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(index, val)}
                    onKeyPress={(e) => handleKeyDown(index, e)}
                    keyboardType="number-pad"
                    maxLength={1}
                    mode="outlined"
                    activeOutlineColor={COLORS.primary}
                    style={styles.otpBox}
                    contentStyle={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
                    theme={{ roundness: 10 }}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                {timer > 0 ? (
                  <Text style={styles.resendText}>
                    {t('auth.resendIn', { seconds: timer })}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP}>
                    <Text style={styles.resendLink}>{t('auth.resendOTP')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleVerifyOTP}
                loading={loading}
                disabled={loading || code.some((d) => d === '')}
                style={styles.submitBtn}
                buttonColor={COLORS.primary}
              >
                {t('auth.verifyOTP')}
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backBtn: {
    marginTop: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  prefixContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f5',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '650',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: '#f8f8f5',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 48,
    backgroundColor: '#f8f8f5',
  },
  resendContainer: {
    marginBottom: 24,
  },
  resendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
  },
});
