import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText, Portal, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { COLORS, LANGUAGES } from '../../../../shared/constants/index.js';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';
import { sendPasswordReset } from '../../../../shared/services/auth.js';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../../../../shared/firebase.config.js';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { 
    user, 
    profile, 
    loading, 
    error, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle 
  } = useAuthStore();

  const { language, setLanguage } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  
  const [langMenuVisible, setLangMenuVisible] = useState(false);
  const [stateMenuVisible, setStateMenuVisible] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (user && profile) {
      if (profile.name && profile.state) {
        // Handled by navigator switching stack
      } else {
        navigation.navigate('ProfileCompletion');
      }
    }
  }, [user, profile]);

  const handleGoogleSignIn = async () => {
    setFormError('');
    setInfoMessage('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo.data?.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID token received');
      }
      await loginWithGoogle(idToken);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setFormError('Google Sign-In cancelled');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setFormError('Google Sign-In in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setFormError('Google Play Services not available');
      } else {
        setFormError(err.message || 'Google Sign-In failed');
      }
    }
  };

  const handleAuth = async () => {
    setFormError('');
    setInfoMessage('');

    if (activeTab === 'login') {
      if (!email.trim() || !password) {
        setFormError('Please enter email and password');
        return;
      }
      try {
        await loginWithEmail(email, password);
      } catch (err) {
        setFormError(err.message || 'Login failed');
      }
    } else {
      if (!fullName.trim()) {
        setFormError('Please enter your full name');
        return;
      }
      if (!selectedState) {
        setFormError('Please select your state');
        return;
      }
      if (password !== confirmPassword) {
        setFormError(t('auth.errors.passwordMismatch'));
        return;
      }
      if (password.length < 6) {
        setFormError(t('auth.errors.weakPassword'));
        return;
      }

      try {
        await registerWithEmail(email, password, {
          name: fullName,
          state: selectedState,
          language: language,
          unitPreference: 'bigha',
        });
      } catch (err) {
        setFormError(err.message || 'Registration failed');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFormError(t('auth.errors.invalidEmail'));
      return;
    }
    try {
      await sendPasswordReset(email);
      setInfoMessage('Password reset link sent to your email.');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Language selector top-right */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.langBtn} 
            onPress={() => setLangMenuVisible(true)}
          >
            <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
            <Text style={styles.langBtnText}>
              {LANGUAGES.find(l => l.code === language)?.name || 'Language'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Brand/Logo Header */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
          />
          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('app.tagline')}</Text>
        </View>

        {/* Tab Switcher */}
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'login', label: t('auth.login'), checkedColor: COLORS.primary },
            { value: 'register', label: t('auth.register'), checkedColor: COLORS.primary },
          ]}
          style={styles.tabs}
          theme={{ colors: { primary: COLORS.primary } }}
        />

        {/* General Error / Success notifications */}
        {formError || error ? (
          <Text style={styles.errorText}>{formError || error}</Text>
        ) : null}
        {infoMessage ? (
          <Text style={styles.infoText}>{infoMessage}</Text>
        ) : null}

        {/* Fields */}
        <View style={styles.form}>
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <TextInput
                label={t('auth.fullName')}
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.input}
                left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />} />}
                theme={{ roundness: 10 }}
              />

              {/* State Dropdown Trigger */}
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => setStateMenuVisible(true)}
              >
                <Ionicons name="map-outline" size={20} color={COLORS.textSecondary} style={styles.dropdownIcon} />
                <Text style={{ 
                  color: selectedState ? COLORS.textPrimary : COLORS.textSecondary,
                  fontSize: 16
                }}>
                  {selectedState ? INDIAN_STATES.find(s => s.code === selectedState)?.name : t('auth.selectState')}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </>
          )}

          {/* Email */}
          <TextInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />} />}
            theme={{ roundness: 10 }}
          />

          {/* Password */}
          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />} />}
            theme={{ roundness: 10 }}
          />

          {activeTab === 'register' && (
            /* Confirm Password */
            <TextInput
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.input}
              left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />} />}
              theme={{ roundness: 10 }}
            />
          )}

          {activeTab === 'login' && (
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleAuth}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            buttonColor={COLORS.primary}
          >
            {activeTab === 'login' ? t('auth.login') : t('auth.register')}
          </Button>
        </View>

        {/* Divider OR */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('auth.orDivider')}</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Authentication */}
        <View style={styles.socialContainer}>
          <Button
            mode="outlined"
            icon="google"
            onPress={handleGoogleSignIn}
            textColor="#4285F4"
            style={[styles.socialBtn, { borderColor: '#4285F430', marginBottom: 12 }]}
          >
            {t('auth.signInWithGoogle')}
          </Button>

          <Button
            mode="outlined"
            icon="phone"
            onPress={() => navigation.navigate('OTP')}
            textColor={COLORS.primary}
            style={[styles.socialBtn, { borderColor: COLORS.primary + '30' }]}
          >
            {t('auth.signInWithPhone')}
          </Button>
        </View>
      </ScrollView>

      {/* Language Selection Dialog */}
      <Portal>
        <Dialog visible={langMenuVisible} onDismiss={() => setLangMenuVisible(false)}>
          <Dialog.Title>{t('auth.selectLanguage')}</Dialog.Title>
          <Dialog.Content>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.dialogItem}
                onPress={() => {
                  setLanguage(lang.code);
                  setLangMenuVisible(false);
                }}
              >
                <Text style={styles.dialogItemText}>
                  {lang.flag} {lang.name}
                </Text>
                {language === lang.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* State Selection Dialog */}
        <Dialog visible={stateMenuVisible} onDismiss={() => setStateMenuVisible(false)}>
          <Dialog.Title>{t('auth.selectState')}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
            <ScrollView>
              {INDIAN_STATES.map((state) => (
                <TouchableOpacity
                  key={state.code}
                  style={styles.dialogItem}
                  onPress={() => {
                    setSelectedState(state.code);
                    setStateMenuVisible(false);
                  }}
                >
                  <Text style={styles.dialogItemText}>
                    {state.name} ({state.nameHi})
                  </Text>
                  {selectedState === state.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 48,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerActions: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginHorizontal: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: COLORS.primaryLight,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  tabs: {
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  dropdownIcon: {
    marginRight: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 8,
    height: 46,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    color: COLORS.ownExpense,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  socialContainer: {
    width: '100%',
    marginBottom: 24,
  },
  socialBtn: {
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
  },
  dialogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dialogItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
