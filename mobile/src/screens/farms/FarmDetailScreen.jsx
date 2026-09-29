import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, SegmentedButtons, Button, ActivityIndicator, Portal, Dialog, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { PieChart } from 'react-native-chart-kit';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import ExpenseCard from '../../components/ExpenseCard.jsx';
import SeasonBadge from '../../components/SeasonBadge.jsx';
import OwnershipBadge from '../../components/OwnershipBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { calculateSettlement } from '../../../../shared/utils/helpers.js';

export default function FarmDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { id } = route.params;

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm, removeFarm, editFarm } = useFarmStore();
  const { expenses, totals, fetchExpenses, fetchStats, loading } = useExpenseStore();
  const { partners, fetchPartnersByFarm, createPartner } = usePartnerStore();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'partners' | 'settings'

  // Add partner state
  const [partnerDialogVisible, setPartnerDialogVisible] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerShare, setPartnerShare] = useState('');
  const [submittingPartner, setSubmittingPartner] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await import('../../../../shared/services/farmService.js');
        const farm = await db.getFarmById(id);
        if (farm) {
          setSelectedFarm(farm);
          fetchExpenses(profile.uid, { farmId: id });
          fetchStats(profile.uid, { farmId: id });
          if (farm.ownershipType === 'partner') {
            fetchPartnersByFarm(id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (profile?.uid && id) {
      loadData();
    }
  }, [id, profile]);

  const handleAddPartnerSubmit = async () => {
    if (!partnerName.trim()) {
      Alert.alert('Error', 'Please enter partner name');
      return;
    }
    if (!partnerPhone.trim() || partnerPhone.replace(/\D/g, '').length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    const shareVal = parseFloat(partnerShare);
    if (isNaN(shareVal) || shareVal <= 0 || shareVal >= 100) {
      Alert.alert('Error', 'Partner share percentage must be between 1% and 99%');
      return;
    }

    setSubmittingPartner(true);
    try {
      const formattedPhone = partnerPhone.startsWith('+91') ? partnerPhone : `+91${partnerPhone.replace(/\D/g, '').slice(-10)}`;
      const pObj = {
        name: partnerName,
        phone: formattedPhone,
        sharePercent: shareVal,
        totalOwed: 0,
        totalPaid: 0
      };

      const terms = {
        templateName: `Batai ${shareVal}-${100 - shareVal}`,
        systemType: 'batai',
        cropSharePercent: shareVal,
        cropShareBasis: 'yield_kg',
        paymentTiming: 'after_harvest',
        expenseSharing: {
          khad_fertilizer: shareVal,
          keetnashak_pesticide: shareVal,
          beej_seeds: shareVal,
          bijli_electricity: shareVal,
          sinchai_irrigation: shareVal,
          majdoori_labour: shareVal,
          tractor_machinery: shareVal,
          diesel_fuel: shareVal,
          transport: shareVal,
          mandi_charges: shareVal,
          packaging: shareVal,
          other: shareVal
        },
        partnerResponsibilities: ['labour', 'irrigation', 'sowing', 'weeding', 'harvesting'],
        customNotes: ''
      };

      const newPartnerId = await createPartner({
        farmId: id,
        ownerId: profile.uid,
        name: partnerName,
        phone: formattedPhone,
        season: selectedFarm.cropSeason || 'kharif',
        startDate: new Date(),
        status: 'active',
        totalOwed: 0,
        totalPaid: 0,
        terms
      });

      pObj.partnerId = newPartnerId;

      // Determine updated partners list and whether we are converting ownership type
      const isCurrentlyOwn = selectedFarm.ownershipType === 'own';
      const updatedPartners = isCurrentlyOwn ? [pObj] : [...(selectedFarm.partners || []), pObj];

      const updateData = {
        partners: updatedPartners
      };
      if (isCurrentlyOwn) {
        updateData.ownershipType = 'partner';
      }

      await editFarm(id, updateData);

      // Refresh states
      const updatedFarm = { ...selectedFarm, ...updateData };
      setSelectedFarm(updatedFarm);
      await fetchPartnersByFarm(id);
      await fetchStats(profile.uid, { farmId: id });

      setPartnerName('');
      setPartnerPhone('');
      setPartnerShare('');
      setPartnerDialogVisible(false);

      Alert.alert(
        'Success', 
        isCurrentlyOwn 
          ? 'Partner added and farm plot converted to Partnership!' 
          : 'Partner added successfully!'
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add partner');
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Farm Plot',
      'Are you sure you want to delete this farm? All expense logs will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFarm(id);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete farm plot');
            }
          }
        }
      ]
    );
  };

  if (!selectedFarm) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Chart configs
  const screenWidth = Dimensions.get('window').width - 40;
  const chartData = [
    {
      name: 'Own Share',
      population: totals.own || 0,
      color: COLORS.ownExpense,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 11
    },
    {
      name: 'Partner Share',
      population: totals.partner || 0,
      color: COLORS.partnerExpense,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 11
    }
  ].filter(c => c.population > 0);

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      {/* Custom Header Area */}
      <View style={styles.headerArea}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('farm.title') || 'Farm Details'}</Text>
      </View>
      
      {/* Farm details summary card */}
      <Card style={styles.summaryCard} elevation={0}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={styles.farmName}>{selectedFarm.name}</Text>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                {' '}{selectedFarm.location || 'India'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <SeasonBadge seasonId={selectedFarm.cropSeason} />
              <View style={{ marginTop: 4 }}>
                <OwnershipBadge type={selectedFarm.ownershipType} />
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Size: <Text style={styles.boldText}>{selectedFarm.size} {t(`unit.${selectedFarm.sizeUnit || 'bigha'}`)}</Text>
            </Text>
            <Text style={styles.infoText}>
              Crop: <Text style={styles.boldText}>{selectedFarm.currentCrop || 'N/A'}</Text>
            </Text>
          </View>

          {selectedFarm.ownershipType === 'partner' && selectedFarm.currentCrop ? (
            <Button
              mode="contained"
              icon="leaf"
              buttonColor={COLORS.ownExpense}
              textColor="#FFFFFF"
              onPress={() => navigation.navigate('HarvestEntry', { farmId: id })}
              style={{ marginTop: 16, borderRadius: 12 }}
            >
              Record Harvest (Fasal Aai)
            </Button>
          ) : null}
        </Card.Content>
      </Card>

      {/* Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'expenses', label: 'Expenses', checkedColor: COLORS.primary },
          ...(selectedFarm.ownershipType === 'partner' ? [{ value: 'partners', label: 'Partners', checkedColor: COLORS.primary }] : []),
          { value: 'settings', label: 'Settings', checkedColor: COLORS.primary }
        ]}
        style={styles.tabs}
        theme={{ colors: { primary: COLORS.primary } }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'expenses' && (
          <View style={styles.tabContent}>
            {/* Split cards */}
            <View style={styles.splitRow}>
              <View style={styles.splitBox}>
                <Text style={styles.splitLabel}>My Share</Text>
                <AmountDisplay amount={totals.own} style={styles.splitValueOwn} />
              </View>
              <View style={styles.splitBox}>
                <Text style={styles.splitLabel}>Partner Share</Text>
                <AmountDisplay amount={totals.partner} style={styles.splitValuePartner} />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Expense Ledger</Text>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : expenses.length > 0 ? (
              expenses.map((item) => (
                <ExpenseCard
                  key={item.id}
                  expense={item}
                  farmName={selectedFarm.name}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No expenses logged for this farm.</Text>
            )}
          </View>
        )}

        {activeTab === 'partners' && (
          <View style={styles.tabContent}>
            {/* Pie Chart */}
            {chartData.length > 0 && (
              <Card style={styles.chartCard}>
                <Card.Content style={{ alignItems: 'center' }}>
                  <Text style={styles.chartTitle}>Cost Split Ratio</Text>
                  <PieChart
                    data={chartData}
                    width={screenWidth}
                    height={150}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </Card.Content>
              </Card>
            )}

            {/* Partners List */}
            <View style={styles.partnersHeaderRow}>
              <Text style={styles.sectionTitle}>Share Details</Text>
              <Button
                mode="text"
                icon="plus"
                onPress={() => setPartnerDialogVisible(true)}
                textColor={COLORS.primary}
                labelStyle={{ fontWeight: 'bold' }}
              >
                Add Partner
              </Button>
            </View>
            {partners.map((partner) => {
              const split = calculateSettlement(totals.total, partner.sharePercent, partner.totalPaid || 0);
              return (
                <Card key={partner.id} style={styles.partnerCard}>
                  <Card.Content>
                    <View style={styles.partnerHeader}>
                      <View>
                        <Text style={styles.partnerName}>{partner.name}</Text>
                        <Text style={styles.partnerPhone}>{partner.phone}</Text>
                      </View>
                      <Text style={styles.partnerShare}>Share: {partner.sharePercent}%</Text>
                    </View>

                    <View style={styles.partnerMath}>
                      <View>
                        <Text style={styles.mathLabel}>Calculated Share</Text>
                        <AmountDisplay amount={split.due} style={styles.mathVal} />
                      </View>
                      <View>
                        <Text style={styles.mathLabel}>Paid</Text>
                        <AmountDisplay amount={split.paid} style={styles.mathVal} />
                      </View>
                      <View>
                        <Text style={styles.mathLabel}>Outstanding</Text>
                        <AmountDisplay amount={Math.abs(split.balance)} style={[styles.mathVal, { color: split.balance > 0 ? COLORS.danger : COLORS.ownExpense }]} />
                      </View>
                    </View>

                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('ReportsTab', { screen: 'PartnerSettlement', params: { farmId: id } })}
                      style={styles.settleBtn}
                      textColor={COLORS.primary}
                    >
                      View Full Settlement
                    </Button>
                  </Card.Content>
                </Card>
              );
            })}

            {/* Harvest History */}
            {selectedFarm.harvests && selectedFarm.harvests.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Harvest History</Text>
                {selectedFarm.harvests.map((h, idx) => (
                  <Card key={idx} style={[styles.partnerCard, { marginBottom: 8 }]}>
                    <Card.Content>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                          <Text style={{ fontWeight: '750', fontSize: 14, color: COLORS.textPrimary }}>
                            {h.totalYield} {h.yieldUnit}
                          </Text>
                          <Text style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 2 }}>
                            {new Date(h.saleDate).toLocaleDateString('en-IN')}
                          </Text>
                        </View>
                        <Text style={{ fontWeight: '800', color: COLORS.ownExpense, fontSize: 14 }}>
                          ₹{h.totalSaleAmount?.toLocaleString('en-IN') || '0'}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            {selectedFarm.ownershipType === 'own' && (
              <Card style={[styles.settingsCard, { marginBottom: 16 }]}>
                <Card.Content style={styles.settingsCardContent}>
                  <Text style={styles.settingsSectionTitleOwn}>Take a Partner / Add Partnership</Text>
                  <Text style={styles.settingsLabel}>
                    Convert this self-owned plot into a partnership plot. You can add a partner and start splitting costs.
                  </Text>
                  <Button
                    mode="contained"
                    icon="account-plus-outline"
                    buttonColor={COLORS.primary}
                    textColor="#FFFFFF"
                    onPress={() => setPartnerDialogVisible(true)}
                    style={styles.addPartnerBtn}
                  >
                    Add Partner & Enable Splits
                  </Button>
                </Card.Content>
              </Card>
            )}

            <Card style={styles.settingsCard}>
              <Card.Content style={styles.settingsCardContent}>
                <Text style={styles.settingsSectionTitle}>Danger Zone</Text>
                <Text style={styles.settingsLabel}>
                  Deleting this farm plot will permanently erase all associated crop expenses and invoices logs.
                </Text>
                
                <Button
                  mode="contained"
                  buttonColor={COLORS.danger}
                  textColor="#FFFFFF"
                  icon="trash-can-outline"
                  onPress={handleDelete}
                  style={styles.deleteBtn}
                >
                  Delete Plot
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Add Partner Dialog */}
      <Portal>
        <Dialog visible={partnerDialogVisible} onDismiss={() => !submittingPartner && setPartnerDialogVisible(false)}>
          <Dialog.Title>
            {selectedFarm.ownershipType === 'own' ? 'Take a Partner (Convert Plot)' : 'Add Partner to Plot'}
          </Dialog.Title>
          <Dialog.Content>
            {selectedFarm.ownershipType === 'own' && (
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 16 }}>
                Adding a partner will convert this self-owned plot into a Batai (partnership) plot and enable expense splitting.
              </Text>
            )}
            <TextInput
              label="Partner Name *"
              value={partnerName}
              onChangeText={setPartnerName}
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={{ marginBottom: 12, backgroundColor: COLORS.card }}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <TextInput
              label="Phone Number *"
              value={partnerPhone}
              onChangeText={setPartnerPhone}
              keyboardType="phone-pad"
              placeholder="e.g. 9876543210"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={{ marginBottom: 12, backgroundColor: COLORS.card }}
              left={<TextInput.Icon icon="phone-outline" />}
            />
            <TextInput
              label="Crop/Cost Share % *"
              value={partnerShare}
              onChangeText={setPartnerShare}
              keyboardType="numeric"
              placeholder="e.g. 50"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={{ backgroundColor: COLORS.card }}
              left={<TextInput.Icon icon="percent-outline" />}
              right={<TextInput.Affix text="%" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setPartnerDialogVisible(false)} 
              textColor={COLORS.textSecondary}
              disabled={submittingPartner}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleAddPartnerSubmit} 
              loading={submittingPartner} 
              disabled={submittingPartner}
              textColor={COLORS.primary}
            >
              {selectedFarm.ownershipType === 'own' ? 'Convert & Add' : 'Add'}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  summaryCard: {
    marginTop: -40,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 12,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  farmName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  boldText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  tabs: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  tabContent: {
    flex: 1,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  splitBox: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  splitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  splitValueOwn: {
    fontSize: 16,
    color: COLORS.ownExpense,
    marginTop: 4,
  },
  splitValuePartner: {
    fontSize: 16,
    color: COLORS.partnerExpense,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: 24,
    fontSize: 13,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  partnerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: 8,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  partnerPhone: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  partnerShare: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  partnerMath: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mathLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  mathVal: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  settleBtn: {
    borderRadius: 8,
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  settingsCardContent: {
    padding: 16,
  },
  settingsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
    marginBottom: 8,
  },
  settingsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteBtn: {
    borderRadius: 10,
  },
  partnersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsSectionTitleOwn: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  addPartnerBtn: {
    borderRadius: 10,
    marginTop: 8,
  },
});
