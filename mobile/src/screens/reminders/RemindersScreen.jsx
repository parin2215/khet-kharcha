import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import EmptyState from '../../components/EmptyState.jsx';

export default function RemindersScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { reminders, fetchReminders, createReminder, toggleReminder, removeReminder, loading } = useReminderStore();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [dialogVisible, setDialogVisible] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(toLocalDateString()); // YYYY-MM-DD
  const [type, setType] = useState('spray'); // bill | spray | fertilizer | harvest | loan | other
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchReminders(profile.uid);
    }
  }, [profile]);

  const handleCreateReminder = async () => {
    if (!title || !dueDate) {
      Alert.alert('Error', 'Please enter a title and due date');
      return;
    }

    setSaving(true);
    try {
      await createReminder({
        ownerId: profile.uid,
        title,
        description,
        dueDate: new Date(dueDate),
        type
      });
      fetchReminders(profile.uid);
      setDialogVisible(false);
      setTitle('');
      setDescription('');
      Alert.alert('Success', 'Reminder created successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminder = async (id, isDone) => {
    try {
      await toggleReminder(id, isDone);
      fetchReminders(profile.uid);
    } catch (err) {
      Alert.alert('Error', 'Failed to update reminder status');
    }
  };

  const handleDeleteReminder = (id) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReminder(id);
              fetchReminders(profile.uid);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete reminder');
            }
          }
        }
      ]
    );
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'spray': return 'water-outline';
      case 'fertilizer': return 'leaf-outline';
      case 'harvest': return 'cut-outline';
      case 'bill': return 'receipt-outline';
      case 'loan': return 'cash-outline';
      default: return 'notifications-outline';
    }
  };

  const getReminderIconColor = (type) => {
    switch (type) {
      case 'spray': return '#0ea5e9';
      case 'fertilizer': return '#16a34a';
      case 'harvest': return '#eab308';
      case 'bill': return '#f97316';
      case 'loan': return '#dc2626';
      default: return COLORS.primary;
    }
  };

  const getDueStatus = (reminder) => {
    if (reminder.done) return { label: 'Completed', color: COLORS.ownExpense, bg: COLORS.primaryLight };

    const due = reminder.dueDate?.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', color: COLORS.danger, bg: COLORS.dangerLight };
    }
    if (diffDays === 0) {
      return { label: 'Today', color: COLORS.accent, bg: COLORS.accentLight };
    }
    if (diffDays <= 3) {
      return { label: `Due in ${diffDays} days`, color: COLORS.partnerExpense, bg: COLORS.accentLight };
    }
    return { label: `Due: ${formatDate(reminder.dueDate)}`, color: COLORS.textSecondary, bg: COLORS.divider };
  };

  const filteredReminders = reminders.filter(r => activeTab === 'completed' ? r.done : !r.done);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('navigation.reminders')}</Text>
          <Text style={styles.headerSubtitle}>Sprays, harvest & loan schedules</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setDialogVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'active', label: `Active (${reminders.filter(r => !r.done).length})` },
          { value: 'completed', label: 'Completed' }
        ]}
        style={styles.tabs}
        theme={{ colors: { primary: COLORS.primary } }}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredReminders.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredReminders.map((rem) => {
            const status = getDueStatus(rem);
            return (
              <Card key={rem.id} style={styles.reminderCard}>
                <Card.Content style={styles.cardContent}>
                  
                  {/* Custom Checkbox */}
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => handleToggleReminder(rem.id, !rem.done)}
                  >
                    <Ionicons 
                      name={rem.done ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={rem.done ? COLORS.primary : COLORS.textSecondary} 
                    />
                  </TouchableOpacity>

                  {/* Details */}
                  <View style={styles.detailsCol}>
                    <View style={styles.titleRow}>
                      <Ionicons 
                        name={getReminderIcon(rem.type)} 
                        size={16} 
                        color={getReminderIconColor(rem.type)} 
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.reminderTitle, rem.done && styles.lineThrough]} numberOfLines={1}>
                        {rem.title}
                      </Text>
                    </View>

                    {rem.description ? (
                      <Text style={[styles.descriptionText, rem.done && styles.lineThrough]} numberOfLines={2}>
                        {rem.description}
                      </Text>
                    ) : null}

                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteReminder(rem.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>

                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="notifications-outline"
            message={activeTab === 'active' ? "All caught up! No active reminders." : "No reminders completed yet."}
            btnLabel={activeTab === 'active' ? "Add Reminder Alert" : null}
            onBtnPress={activeTab === 'active' ? () => setDialogVisible(true) : null}
          />
        </View>
      )}

      {/* Add Reminder Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add New Reminder Alert</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 350 }} keyboardShouldPersistTaps="handled">
              
              {/* Reminder Title */}
              <TextInput
                label="Task Title *"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                placeholder="e.g. Spray cotton crop"
                theme={{ roundness: 10 }}
              />

              {/* Task Type */}
              <Text style={styles.dialogLabel}>Task Category</Text>
              <View style={styles.typeGrid}>
                {['spray', 'fertilizer', 'harvest', 'bill', 'loan', 'other'].map((tVal) => {
                  const isSelected = type === tVal;
                  return (
                    <TouchableOpacity
                      key={tVal}
                      style={[
                        styles.typeBtn,
                        isSelected && { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }
                      ]}
                      onPress={() => setType(tVal)}
                    >
                      <Ionicons name={getReminderIcon(tVal)} size={18} color={getReminderIconColor(tVal)} />
                      <Text style={[styles.typeBtnText, isSelected && { color: COLORS.primary, fontWeight: '700' }]}>
                        {tVal.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Due Date */}
              <TextInput
                label="Due Date (YYYY-MM-DD) *"
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="e.g. 2026-06-12"
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="calendar-outline" />}
                theme={{ roundness: 10 }}
              />

              {/* Description */}
              <TextInput
                label="Description / Note"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                multiline
                numberOfLines={2}
                placeholder="Add dosage details, shop name, etc."
                theme={{ roundness: 10 }}
              />

            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={COLORS.textSecondary}>Cancel</Button>
            <Button 
              onPress={handleCreateReminder} 
              loading={saving} 
              disabled={saving || !title}
              textColor={COLORS.primary}
            >
              Save Alert
            </Button>
          </Dialog.Actions>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  headerTextContainer: {
    flex: 1,
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
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    margin: 16,
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  reminderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    padding: 4,
    marginRight: 10,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  lineThrough: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  descriptionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dialogLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f8f8f5',
  },
  typeBtnText: {
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
