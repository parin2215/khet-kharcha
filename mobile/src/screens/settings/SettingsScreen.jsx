import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Text, TextInput, Button, Dialog, Portal, Switch, Card, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useSettingsStore } from '../../store/useSettingsStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { COLORS, LANGUAGES, SIZE_UNITS } from '../../../../shared/constants/index.js';
import { INDIAN_STATES } from '../../../../shared/constants/states.js';

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile, updateProfile, logout } = useAuthStore();
  const { 
    language, 
    setLanguage, 
    unitPreference, 
    setUnitPreference, 
    notificationsEnabled, 
    setNotificationsEnabled 
  } = useSettingsStore();

  const [name, setName] = useState(profile?.name || '');
  const [state, setState] = useState(profile?.state || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Dialog Visibility states
  const [langPickerVisible, setLangPickerVisible] = useState(false);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [statePickerVisible, setStatePickerVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setState(profile.state || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name, state });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleShareJSON = async () => {
    try {
      const exportData = {
        profile,
        farms: useFarmStore.getState().farms,
        expenses: useExpenseStore.getState().expenses,
        bills: useBillStore.getState().bills,
        reminders: useReminderStore.getState().reminders
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      await Share.share({
        message: jsonString,
        title: 'Khet Kharcha Backup'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share backup data');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout') || 'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ]
    );
  };

  const selectedStateName = INDIAN_STATES.find(s => s.code === state)?.name || 'Select State';
  const selectedLangName = LANGUAGES.find(l => l.code === language)?.name || 'Language';

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>App preferences & profile configuration</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Profile Card */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
            </View>

            <TextInput
              label={t('auth.fullName') || "Full Name"}
              value={name}
              onChangeText={setName}
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.input}
              theme={{ roundness: 10 }}
            />

            <Text style={styles.label}>{t('auth.state') || "State"}</Text>
            <TouchableOpacity 
              style={styles.selectorTrigger}
              onPress={() => setStatePickerVisible(true)}
            >
              <Text style={styles.selectorText}>{selectedStateName}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleSaveProfile}
              loading={savingProfile}
              disabled={savingProfile || !name}
              buttonColor={COLORS.primary}
              style={styles.saveBtn}
            >
              {t('settings.save') || "Save Changes"}
            </Button>
          </Card.Content>
        </Card>

        {/* Tools & Trackers Card */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Tools & Trackers</Text>
            </View>

            <TouchableOpacity 
              style={styles.navRow}
              onPress={() => navigation.navigate('Bills')}
            >
              <View style={styles.navRowLeft}>
                <Ionicons name="receipt-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 12 }} />
                <Text style={styles.navRowText}>{t('navigation.bills') || "Bills Tracker"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navRow, { borderBottomWidth: 0, paddingBottom: 0 }]}
              onPress={() => navigation.navigate('Reminders')}
            >
              <View style={styles.navRowLeft}>
                <Ionicons name="alarm-outline" size={20} color={COLORS.textPrimary} style={{ marginRight: 12 }} />
                <Text style={styles.navRowText}>{t('navigation.reminders') || "Reminders"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Display Preferences Card */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="options-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>App Preferences</Text>
            </View>

            {/* Language */}
            <Text style={styles.label}>{t('settings.language') || "Language"}</Text>
            <TouchableOpacity 
              style={styles.selectorTrigger}
              onPress={() => setLangPickerVisible(true)}
            >
              <Text style={styles.selectorText}>{selectedLangName}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Area Unit */}
            <Text style={styles.label}>{t('settings.unitPreference') || "Land Size Unit"}</Text>
            <TouchableOpacity 
              style={styles.selectorTrigger}
              onPress={() => setUnitPickerVisible(true)}
            >
              <Text style={styles.selectorText}>{t(`unit.${unitPreference}`)}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Notifications Switch */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>{t('settings.notifications') || "Push Notifications"}</Text>
                <Text style={styles.switchSub}>Spray alerts & payment reminders</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={COLORS.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Backup Card */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="download-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>{t('settings.exportData') || "Backup & Exports"}</Text>
            </View>
            <Text style={styles.cardDesc}>
              Export all your logged farm plots, split balances, utilities bills, and activity schedules as a JSON file backup.
            </Text>
            <Button
              mode="outlined"
              icon="share-social-outline"
              onPress={handleShareJSON}
              textColor={COLORS.primary}
              borderColor={COLORS.primary}
              style={styles.backupBtn}
            >
              Share JSON Database Backup
            </Button>
          </Card.Content>
        </Card>

        {/* Danger Account Actions Card */}
        <Card style={[styles.sectionCard, { marginBottom: 40 }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="exit-outline" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Account Actions</Text>
            </View>
            <Button
              mode="contained"
              buttonColor={COLORS.danger}
              onPress={handleLogout}
              style={styles.logoutBtn}
            >
              {t('auth.logout') || "Sign Out"}
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>

      {/* Pickers Portals */}
      <Portal>
        {/* Language Selection Dialog */}
        <Dialog visible={langPickerVisible} onDismiss={() => setLangPickerVisible(false)}>
          <Dialog.Title>Choose Language</Dialog.Title>
          <Dialog.Content>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={styles.pickerItem}
                onPress={() => {
                  setLanguage(l.code);
                  setLangPickerVisible(false);
                }}
              >
                <Text style={styles.pickerText}>{l.flag} {l.name} ({l.nameEn})</Text>
                {language === l.code && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* Unit Selection Dialog */}
        <Dialog visible={unitPickerVisible} onDismiss={() => setUnitPickerVisible(false)}>
          <Dialog.Title>Choose Land Area Unit</Dialog.Title>
          <Dialog.Content>
            {SIZE_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={styles.pickerItem}
                onPress={() => {
                  setUnitPreference(u.value);
                  setUnitPickerVisible(false);
                }}
              >
                <Text style={styles.pickerText}>{t(u.labelKey)}</Text>
                {unitPreference === u.value && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* State Selection Dialog */}
        <Dialog visible={statePickerVisible} onDismiss={() => setStatePickerVisible(false)}>
          <Dialog.Title>Select Indian State</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 350 }}>
              {INDIAN_STATES.map((s) => (
                <TouchableOpacity
                  key={s.code}
                  style={styles.pickerItem}
                  onPress={() => {
                    setState(s.code);
                    setStatePickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerText}>{s.name} ({s.nameHi})</Text>
                  {state === s.code && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  selectorTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f8f8f5',
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    marginTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  backupBtn: {
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
  },
  logoutBtn: {
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  pickerText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
