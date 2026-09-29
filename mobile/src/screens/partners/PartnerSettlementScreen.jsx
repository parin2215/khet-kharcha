import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, ActivityIndicator, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { calculateSettlement, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import { buildPartnerStatement, formatStatement } from '../../../../shared/utils/partnerKhata.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';

export default function PartnerSettlementScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { farmId } = route.params;

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm } = useFarmStore();
  const { totals, fetchStats, createExpense } = useExpenseStore();
  const { partners, settlements, fetchPartnersByFarm, fetchSettlements, createSettlement, loading } = usePartnerStore();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Lend Money states
  const [lendDialogVisible, setLendDialogVisible] = useState(false);
  const [lendAmount, setLendAmount] = useState('');
  const [lendNote, setLendNote] = useState('');
  const [lending, setLending] = useState(false);

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const db = await import('../../../../shared/services/farmService.js');
        const farm = await db.getFarmById(farmId);
        if (farm) {
          setSelectedFarm(farm);
          fetchStats(profile.uid, { farmId });
          fetchPartnersByFarm(farmId);
          fetchSettlements(farmId);
        } else {
          navigation.goBack();
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (profile?.uid && farmId) {
      loadFarm();
    }
  }, [farmId, profile]);

  const handleOpenSettle = (partner) => {
    setSelectedPartner(partner);
    const split = calculateSettlement(totals.total, partner.sharePercent, partner.totalPaid || 0);
    setSettleAmount(split.balance > 0 ? String(split.balance) : '');
    setSettleNote('');
    setDialogVisible(true);
  };

  const handleRecordSettlement = async () => {
    if (!selectedPartner || !settleAmount) return;
    const amountVal = parseFloat(settleAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Error', 'Please enter a valid settlement amount');
      return;
    }

    setSaving(true);
    try {
      await createSettlement({
        farmId,
        partnerId: selectedPartner.id,
        amount: amountVal,
        settledBy: profile.uid,
        note: settleNote,
        season: selectedFarm?.cropSeason || 'year-round'
      });

      // Refresh stats
      fetchStats(profile.uid, { farmId });
      setDialogVisible(false);
      Alert.alert('Success', 'Settlement payment recorded successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to record settlement payment');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenLend = (partner) => {
    setSelectedPartner(partner);
    setLendAmount('');
    setLendNote('');
    setLendDialogVisible(true);
  };

  const handleRecordLend = async () => {
    if (!selectedPartner || !lendAmount) return;
    const amountVal = parseFloat(lendAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return;
    }

    setLending(true);
    try {
      await createExpense({
        farmId,
        ownerId: profile.uid,
        amount: amountVal,
        category: 'loan_interest',
        expenseType: 'partner',
        ownerShare: 0,
        partnerShare: amountVal,
        partnerId: selectedPartner.id,
        partnerName: selectedPartner.name,
        note: lendNote || `Lent money to ${selectedPartner.name}`,
        date: toLocalDateString(),
        season: selectedFarm?.cropSeason || 'year-round'
      });

      // Refresh stats
      fetchStats(profile.uid, { farmId });
      fetchPartnersByFarm(farmId);
      fetchSettlements(farmId);
      
      setLendDialogVisible(false);
      Alert.alert('Success', 'Loan recorded successfully! Opening SMS client...');

      // Open SMS app
      const message = `Khet Kharcha: Lent money ₹${amountVal} to you for farm ${selectedFarm.name}. This will be payback in farming partnership profit.`;
      const smsUrl = `sms:${selectedPartner.phone}?body=${encodeURIComponent(message)}`;
      Linking.openURL(smsUrl).catch(err => {
        console.error('Failed to open SMS client', err);
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to record loan');
    } finally {
      setLending(false);
    }
  };
  if (!selectedFarm) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Live running statement (khata) for the selected partner.
  const khata = buildPartnerStatement({
    transactions: expenses,
    partner: selectedPartner,
    partnerId: selectedPartner?.id,
    crop: selectedFarm?.currentCrop,
  });

  // Share the full running statement (khata) with the partner over SMS/WhatsApp.
  const handleShareKhata = (partnerOverride) => {
    const target = partnerOverride || selectedPartner;
    if (!target) return;
    const statement = buildPartnerStatement({
      transactions: expenses,
      partner: target,
      partnerId: target.id,
      crop: selectedFarm?.currentCrop,
    });
    const text = formatStatement(statement, { farmName: selectedFarm?.name });
    const url = `sms:${target.phone}?body=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch((err) => console.error('Failed to open SMS client', err));
  };

  return (
    <> 
      <View style={styles.headerArea}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Settlements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Farm Header Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.farmName}>{selectedFarm.name}</Text>
            <Text style={styles.farmSub}>Current Crop: {selectedFarm.currentCrop || 'N/A'}</Text>
            <View style={styles.totalLedgerRow}>
              <View>
                <Text style={styles.ledgerLabel}>Total expenses</Text>
                <AmountDisplay amount={totals.total} textStyle={styles.ledgerVal} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.ledgerLabel}>Own Share</Text>
                <AmountDisplay amount={totals.own} textStyle={styles.ledgerValOwn} />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Partners Section */}
        <Text style={styles.sectionTitle}>Partner Balance Sheet</Text>
        {partners.length > 0 ? (
          partners.map((partner) => {
            const split = calculateSettlement(totals.total, partner.sharePercent, partner.totalPaid || 0);
            return (
              <Card key={partner.id} style={styles.partnerCard}>
                <Card.Content>
                  <View style={styles.partnerHeader}>
                    <View>
                      <Text style={styles.partnerNameText}>{partner.name}</Text>
                      <Text style={styles.partnerPhoneText}>{partner.phone}</Text>
                    </View>
                    <Text style={styles.shareBadge}>{partner.sharePercent}% Share</Text>
                  </View>

                  <View style={styles.splitGrid}>
                    <View style={styles.splitCol}>
                      <Text style={styles.splitLabel}>Share due</Text>
                      <AmountDisplay amount={split.due} textStyle={styles.splitVal} />
                    </View>
                    <View style={styles.splitCol}>
                      <Text style={styles.splitLabel}>Paid</Text>
                      <AmountDisplay amount={split.paid} textStyle={styles.splitVal} />
                    </View>
                    <View style={styles.splitCol}>
                      <Text style={styles.splitLabel}>Outstanding</Text>
                      <AmountDisplay amount={Math.abs(split.balance)} textStyle={[styles.splitVal, { color: split.balance > 0 ? COLORS.danger : COLORS.ownExpense }]} />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <Button
                      mode="contained"
                      buttonColor={COLORS.accent}
                      textColor="#FFFFFF"
                      icon="cash-refund"
                      onPress={() => handleOpenLend(partner)}
                      style={[styles.settleBtn, { flex: 1 }]}
                    >
                      Lend Money
                    </Button>
                    {split.balance !== 0 && (
                      <Button
                        mode="contained"
                        buttonColor={COLORS.primary}
                        icon="cash"
                        onPress={() => handleOpenSettle(partner)}
                        style={[styles.settleBtn, { flex: 1 }]}
                      >
                        Settle
                      </Button>
                    )}
                  </View>

                  <Button
                    mode="outlined"
                    icon="file-document-outline"
                    onPress={() => handleShareKhata(partner)}
                    style={[styles.settleBtn, { flex: 1 }]}
                  >
                    {t('expense.khataTitle')}
                  </Button>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No partners configured for this farm plot.</Text>
        )}

        {/* Settlement Log History */}
        <Text style={styles.sectionTitle}>Settlement History</Text>
        <Card style={styles.historyCard}>
          <Card.Content>
            {settlements.length > 0 ? (
              settlements.map((log, index) => {
                const partner = partners.find(p => p.id === log.partnerId);
                return (
                  <View key={log.id}>
                    <View style={styles.historyRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyPartnerName}>{partner?.name || 'Partner'}</Text>
                        <Text style={styles.historyDate}>{formatDate(log.settledAt)}</Text>
                        {log.note ? <Text style={styles.historyNote}>"{log.note}"</Text> : null}
                      </View>
                      <AmountDisplay amount={log.amount} textStyle={styles.historyAmount} />
                    </View>
                    {index < settlements.length - 1 && <Divider style={styles.divider} />}
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No settlements logged yet.</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Record Payment Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Record Partner Settlement</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogIntro}>
              Enter the amount paid by or settled with {selectedPartner?.name}.
            </Text>
            <TextInput
              label="Settlement Amount (₹) *"
              value={settleAmount}
              onChangeText={setSettleAmount}
              keyboardType="numeric"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.dialogInput}
              left={<TextInput.Icon icon="currency-inr" />}
              theme={{ roundness: 10 }}
            />
            <TextInput
              label="Note (e.g. Cash, GPay, Bank)"
              value={settleNote}
              onChangeText={setSettleNote}
              placeholder="e.g. Received via cash"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.dialogInput}
              theme={{ roundness: 10 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={COLORS.textSecondary}>
              Cancel
            </Button>
            <Button 
              onPress={handleRecordSettlement} 
              loading={saving} 
              disabled={saving || !settleAmount}
              textColor={COLORS.primary}
            >
              Record
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Lend Money Dialog */}
        <Dialog visible={lendDialogVisible} onDismiss={() => setLendDialogVisible(false)}>
          <Dialog.Title>Lend Money to Partner</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogIntro}>
              Enter the amount you are lending to {selectedPartner?.name}. This will be added to their expenses and deducted from their harvest profits.
            </Text>
            <TextInput
              label="Lending Amount (₹) *"
              value={lendAmount}
              onChangeText={setLendAmount}
              keyboardType="numeric"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.dialogInput}
              left={<TextInput.Icon icon="currency-inr" />}
              theme={{ roundness: 10 }}
            />
            <TextInput
              label="Note / Description"
              value={lendNote}
              onChangeText={setLendNote}
              placeholder="e.g. Household advance cash"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={styles.dialogInput}
              theme={{ roundness: 10 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLendDialogVisible(false)} textColor={COLORS.textSecondary}>
              Cancel
            </Button>
            <Button 
              onPress={handleRecordLend} 
              loading={lending} 
              disabled={lending || !lendAmount}
              textColor={COLORS.primary}
            >
              Lend & Send SMS
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    marginTop: -40,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  farmName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  farmSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  totalLedgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 12,
  },
  ledgerLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ledgerVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  ledgerValOwn: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    color: COLORS.ownExpense,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingLeft: 4,
  },
  partnerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 8,
    marginBottom: 12,
  },
  partnerNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  partnerPhoneText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  shareBadge: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  splitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  splitCol: {
    width: '30%',
  },
  splitLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  splitVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settleBtn: {
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 32,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  historyPartnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.ownExpense,
  },
  divider: {
    backgroundColor: COLORS.divider,
  },
  dialogIntro: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
});
