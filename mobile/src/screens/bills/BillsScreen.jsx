import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function BillsScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { bills, fetchBills, createBill, payBill, removeBill, loading } = useBillStore();

  const [activeTab, setActiveTab] = useState('unpaid'); // 'unpaid' | 'paid'
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Form States
  const [farmId, setFarmId] = useState('');
  const [billType, setBillType] = useState('electricity');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [billMonth, setBillMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [dueDate, setDueDate] = useState(toLocalDateString()); // YYYY-MM-DD
  const [saving, setSaving] = useState(false);
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
      fetchBills(profile.uid);
    }
  }, [profile]);

  // Default farm selection
  useEffect(() => {
    if (farms.length > 0 && !farmId) {
      setFarmId(farms[0].id);
    }
  }, [farms, farmId]);

  const handleCreateBill = async () => {
    if (!farmId || !amount || !dueDate) {
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
      await createBill({
        farmId,
        ownerId: profile.uid,
        billType,
        providerName,
        amount: parsedAmount,
        billMonth,
        dueDate: new Date(dueDate)
      });
      fetchBills(profile.uid);
      setDialogVisible(false);
      setProviderName('');
      setAmount('');
      Alert.alert('Success', 'Bill recorded successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  const handlePayBill = (billId) => {
    Alert.alert(
      'Pay Bill',
      'Are you sure you want to mark this bill as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              await payBill(billId);
              fetchBills(profile.uid);
            } catch (err) {
              Alert.alert('Error', 'Failed to update bill payment');
            }
          }
        }
      ]
    );
  };

  const handleDeleteBill = (billId) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this bill statement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBill(billId);
              fetchBills(profile.uid);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete bill record');
            }
          }
        }
      ]
    );
  };

  const getBillIcon = (type) => {
    switch (type) {
      case 'electricity': return 'flash-outline';
      case 'water': return 'water-outline';
      case 'diesel': return 'speedometer-outline';
      default: return 'receipt-outline';
    }
  };

  const getBillIconColor = (type) => {
    switch (type) {
      case 'electricity': return '#eab308';
      case 'water': return '#0ea5e9';
      case 'diesel': return '#78716c';
      default: return COLORS.primary;
    }
  };

  const getDueStatus = (bill) => {
    if (bill.paid) return { label: 'Paid', color: COLORS.ownExpense, bg: COLORS.primaryLight };

    const due = bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', color: COLORS.danger, bg: COLORS.dangerLight };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days`, color: COLORS.partnerExpense, bg: COLORS.accentLight };
    }
    return { label: `Due: ${formatDate(bill.dueDate)}`, color: COLORS.textSecondary, bg: COLORS.divider };
  };

  const filteredBills = bills.filter(b => activeTab === 'paid' ? b.paid : !b.paid);
  const selectedFarm = farmId === 'custom_bill' ? { name: 'Custom Bill (No Farm)' } : farms.find(f => f.id === farmId);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('navigation.bills')}</Text>
          <Text style={styles.headerSubtitle}>Electricity, water & fuel payments</Text>
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
          { value: 'unpaid', label: `Unpaid (${bills.filter(b => !b.paid).length})` },
          { value: 'paid', label: 'Paid History' }
        ]}
        style={styles.tabs}
        theme={{ colors: { primary: COLORS.primary } }}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredBills.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredBills.map((bill) => {
            const farm = farms.find(f => f.id === bill.farmId);
            const status = getDueStatus(bill);
            return (
              <Card key={bill.id} style={styles.billCard}>
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.iconBox, { backgroundColor: getBillIconColor(bill.billType) + '15' }]}>
                    <Ionicons name={getBillIcon(bill.billType)} size={22} color={getBillIconColor(bill.billType)} />
                  </View>

                  <View style={styles.detailsCol}>
                    <Text style={styles.providerText} numberOfLines={1}>
                      {bill.providerName || 'Utility Bill'}
                    </Text>
                    <Text style={styles.subText}>
                      {bill.farmId === 'custom_bill' ? 'Custom Bill (No Plot)' : `Plot: ${farm?.name || 'Unknown'}`} • Period: {bill.billMonth}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsCol}>
                    <AmountDisplay amount={bill.amount} textStyle={styles.amountText} />
                    
                    <View style={styles.buttonsRow}>
                      <TouchableOpacity 
                        style={styles.deleteAction}
                        onPress={() => handleDeleteBill(bill.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                      </TouchableOpacity>

                      {!bill.paid && (
                        <TouchableOpacity 
                          style={styles.payAction}
                          onPress={() => handlePayBill(bill.id)}
                        >
                          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="receipt-outline"
            message={activeTab === 'unpaid' ? "All bills paid! Outstanding is clear." : "No bills settled yet."}
            btnLabel={activeTab === 'unpaid' ? "Add Bill Statement" : null}
            onBtnPress={activeTab === 'unpaid' ? () => setDialogVisible(true) : null}
          />
        </View>
      )}

      {/* Add Bill Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Record Utility Bill</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 350 }} keyboardShouldPersistTaps="handled">
              
              {/* Farm Selector */}
              <Text style={styles.dialogLabel}>Select Farm Plot *</Text>
              <TouchableOpacity 
                style={styles.dialogSelector}
                onPress={() => setFarmPickerVisible(true)}
              >
                <Text style={{ color: COLORS.textPrimary }}>{selectedFarm ? selectedFarm.name : 'Choose Farm Plot'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Bill Category Toggle */}
              <Text style={styles.dialogLabel}>Bill Category</Text>
              <SegmentedButtons
                value={billType}
                onValueChange={setBillType}
                buttons={[
                  { value: 'electricity', label: 'Power' },
                  { value: 'water', label: 'Water' },
                  { value: 'diesel', label: 'Fuel' },
                  { value: 'other', label: 'Other' }
                ]}
                style={{ marginBottom: 12 }}
                theme={{ colors: { primary: COLORS.primary } }}
              />

              {/* Provider Name */}
              <TextInput
                label="Provider / Merchant"
                value={providerName}
                onChangeText={setProviderName}
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                placeholder="e.g. Pump owner name, DGVCL"
                theme={{ roundness: 10 }}
              />

              {/* Amount */}
              <TextInput
                label="Bill Amount (₹) *"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="currency-inr" />}
                theme={{ roundness: 10 }}
              />

              {/* Period Month */}
              <TextInput
                label="Billing Period (YYYY-MM)"
                value={billMonth}
                onChangeText={setBillMonth}
                placeholder="e.g. 2026-06"
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="calendar-outline" />}
                theme={{ roundness: 10 }}
              />

              {/* Due Date */}
              <TextInput
                label="Due Date (YYYY-MM-DD) *"
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="e.g. 2026-06-20"
                mode="outlined"
                activeOutlineColor={COLORS.primary}
                style={styles.dialogInput}
                left={<TextInput.Icon icon="alarm-outline" />}
                theme={{ roundness: 10 }}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={COLORS.textSecondary}>Cancel</Button>
            <Button 
              onPress={handleCreateBill} 
              loading={saving} 
              disabled={saving || !farmId}
              textColor={COLORS.primary}
            >
              Add Bill
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Inner Farm Picker Dialog */}
        <Dialog visible={farmPickerVisible} onDismiss={() => setFarmPickerVisible(false)}>
          <Dialog.Title>Choose Farm Plot</Dialog.Title>
          <Dialog.Content>
            {farms.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.pickerItem}
                onPress={() => {
                  setFarmId(f.id);
                  setFarmPickerVisible(false);
                }}
              >
                <Text style={styles.pickerText}>{f.name}</Text>
                {farmId === f.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setFarmId('custom_bill');
                setFarmPickerVisible(false);
              }}
            >
              <Text style={styles.pickerText}>Custom Bill (No Farm)</Text>
              {farmId === 'custom_bill' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
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
  billCard: {
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
    marginTop: 2,
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
  actionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
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
    marginRight: 8,
  },
  payAction: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dialogLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dialogSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
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
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
