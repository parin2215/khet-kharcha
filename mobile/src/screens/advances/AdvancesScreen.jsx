import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useAdvanceStore } from '../../store/useAdvanceStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { formatDate, toLocalDateString, parseLocalDateString } from '../../../../shared/utils/helpers.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdvancesScreen() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { advances, fetchAdvances, createAdvance, removeAdvance, loading } = useAdvanceStore();

  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalDateString());
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchAdvances(profile.uid);
    }
  }, [profile, fetchAdvances]);

  const handleCreateAdvance = async () => {
    if (!amount || !date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await createAdvance({
        ownerId: profile.uid,
        amount: parsedAmount,
        date: parseLocalDateString(date) || new Date(),
        description,
        type: 'received'
      });
      fetchAdvances(profile.uid);
      setDialogVisible(false);
      setAmount('');
      setDescription('');
      Alert.alert('Success', 'Advance payment recorded successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save advance');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdvance = (advanceId) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this advance record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAdvance(advanceId);
              fetchAdvances(profile.uid);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete record');
            }
          }
        }
      ]
    );
  };

  const totalAdvances = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Owner Advances</Text>
          <Text style={styles.headerSubtitle}>Money received from farm owner</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setDialogVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Total Advances Received</Text>
        <AmountDisplay amount={totalAdvances} textStyle={styles.statsAmount} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : advances.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {advances.map((adv) => (
            <Card key={adv.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <Ionicons name="cash-outline" size={22} color={COLORS.primary} />
                </View>

                <View style={styles.detailsCol}>
                  <Text style={styles.providerText} numberOfLines={1}>
                    {adv.description || 'Advance Payment'}
                  </Text>
                  <Text style={styles.subText}>
                    {formatDate(adv.date)}
                  </Text>
                </View>

                <View style={styles.actionsCol}>
                  <AmountDisplay amount={adv.amount} textStyle={styles.amountText} />
                  
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity 
                      style={styles.deleteAction}
                      onPress={() => handleDeleteAdvance(adv.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="wallet-outline"
            message="No advances recorded yet."
            btnLabel="Record Advance"
            onBtnPress={() => setDialogVisible(true)}
          />
        </View>
      )}

      {/* Add Advance Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Record Owner Advance</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 350 }} keyboardShouldPersistTaps="handled">
              
              <TextInput
                label="Amount (₹) *"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="currency-inr" />}
                theme={{ roundness: 10 }}
              />

              <TextInput
                label="Date (YYYY-MM-DD) *"
                value={date}
                onChangeText={setDate}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="calendar-outline" />}
                theme={{ roundness: 10 }}
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                placeholder="e.g. Initial setup advance"
                theme={{ roundness: 10 }}
              />

            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={COLORS.textSecondary}>Cancel</Button>
            <Button 
              onPress={handleCreateAdvance} 
              loading={saving} 
              disabled={saving || !amount}
              textColor={COLORS.primary}
            >
              Record
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
  statsContainer: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  providerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteAction: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  }
});
