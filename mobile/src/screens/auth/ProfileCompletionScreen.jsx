import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { COLORS, LANGUAGES, SIZE_UNITS } from '../../../../shared/constants/index.js';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';

export default function ProfileCompletionScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, updateProfile, loading, error } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();

  const [name, setName] = useState(user?.displayName || '');
  const [state, setState] = useState('');
  const [unit, setUnit] = useState('bigha');
  
  const [stateDialogVisible, setStateDialogVisible] = useState(false);
  const [langDialogVisible, setLangDialogVisible] = useState(false);
  const [unitDialogVisible, setUnitDialogVisible] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSaveProfile = async () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('Please enter your name');
      return;
    }
    if (!state) {
      setFormError('Please select your state');
      return;
    }

    try {
      await updateProfile({
        name,
        state,
        language,
        unitPreference: unit,
      });
      // Navigation will be handled by auth listener shifting root stack
    } catch (err) {
      setFormError(err.message || 'Failed to complete profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.iconCircle}>
        <Ionicons name="person-add-outline" size={40} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>{t('auth.completeProfile')}</Text>
      <Text style={styles.subtitle}>
        Please tell us a bit about yourself to customize your experience.
      </Text>

      {formError || error ? (
        <Text style={styles.errorText}>{formError || error}</Text>
      ) : null}

      <View style={styles.form}>
        {/* Name Input */}
        <TextInput
          label={t('auth.fullName')}
          value={name}
          onChangeText={setName}
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
          theme={{ roundness: 10 }}
        />

        {/* State Selector */}
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setStateDialogVisible(true)}
        >
          <Ionicons name="map-outline" size={20} color={COLORS.textSecondary} style={styles.selectorIcon} />
          <Text style={{ 
            color: state ? COLORS.textPrimary : COLORS.textSecondary,
            fontSize: 16
          }}>
            {state ? INDIAN_STATES.find(s => s.code === state)?.name : t('auth.selectState')}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Language Selector */}
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setLangDialogVisible(true)}
        >
          <Ionicons name="globe-outline" size={20} color={COLORS.textSecondary} style={styles.selectorIcon} />
          <Text style={styles.selectorText}>
            {LANGUAGES.find(l => l.code === language)?.name || t('auth.selectLanguage')}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Unit Selector */}
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setUnitDialogVisible(true)}
        >
          <Ionicons name="scale-outline" size={20} color={COLORS.textSecondary} style={styles.selectorIcon} />
          <Text style={styles.selectorText}>
            {t('auth.selectUnit')}: {t(`unit.${unit}`)}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
          buttonColor={COLORS.primary}
        >
          Save & Continue
        </Button>
      </View>

      {/* Dialogs */}
      <Portal>
        {/* State Dialog */}
        <Dialog visible={stateDialogVisible} onDismiss={() => setStateDialogVisible(false)}>
          <Dialog.Title>{t('auth.selectState')}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
            <ScrollView>
              {INDIAN_STATES.map((s) => (
                <TouchableOpacity
                  key={s.code}
                  style={styles.dialogItem}
                  onPress={() => {
                    setState(s.code);
                    setStateDialogVisible(false);
                  }}
                >
                  <Text style={styles.dialogItemText}>
                    {s.name} ({s.nameHi})
                  </Text>
                  {state === s.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>

        {/* Language Dialog */}
        <Dialog visible={langDialogVisible} onDismiss={() => setLangDialogVisible(false)}>
          <Dialog.Title>{t('auth.selectLanguage')}</Dialog.Title>
          <Dialog.Content>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={styles.dialogItem}
                onPress={() => {
                  setLanguage(l.code);
                  setLangDialogVisible(false);
                }}
              >
                <Text style={styles.dialogItemText}>
                  {l.flag} {l.name}
                </Text>
                {language === l.code && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* Unit Dialog */}
        <Dialog visible={unitDialogVisible} onDismiss={() => setUnitDialogVisible(false)}>
          <Dialog.Title>{t('auth.selectUnit')}</Dialog.Title>
          <Dialog.Content>
            {SIZE_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={styles.dialogItem}
                onPress={() => {
                  setUnit(u.value);
                  setUnitDialogVisible(false);
                }}
              >
                <Text style={styles.dialogItemText}>
                  {t(u.labelKey)}
                </Text>
                {unit === u.value && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  selectorTrigger: {
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
  selectorIcon: {
    marginRight: 10,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 12,
    height: 46,
    justifyContent: 'center',
  },
  dialogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dialogItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
