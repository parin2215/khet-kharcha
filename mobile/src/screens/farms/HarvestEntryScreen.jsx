import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Card, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { calculateTermsSettlement, formatINR, toLocalDateString } from '../../../../shared/utils/helpers.js';
import { analyzeSale } from '../../../../shared/utils/mandiRates.js';
import { COLORS } from '../../../../shared/constants/index.js';

export default function HarvestEntryScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { farmId } = route.params;

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm, editFarm } = useFarmStore();
  const { partners, fetchPartnersByFarm, createSettlement } = usePartnerStore();
  const { expenses, fetchExpenses } = useExpenseStore();

  // Harvest form states
  const [totalYield, setTotalYield] = useState('');
  const [yieldUnit, setYieldUnit] = useState('quintal'); // 'quintal' | 'kg' | 'ton'
  const [mandiRate, setMandiRate] = useState('');
  const [totalSaleAmount, setTotalSaleAmount] = useState('');
  const [saleDate, setSaleDate] = useState(toLocalDateString());
  
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);

  // Load farm, expenses, and partners
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!selectedFarm || selectedFarm.id !== farmId) {
          const db = await import('../../../../shared/services/farmService.js');
          const farm = await db.getFarmById(farmId);
          if (farm) setSelectedFarm(farm);
        }
        await fetchPartnersByFarm(farmId);
        await fetchExpenses(profile.uid, { farmId });
      } catch (err) {
        console.error(err);
      }
    };
    if (farmId && profile?.uid) loadData();
  }, [farmId, profile]);

  // Auto-calculate sale amount from yield & rate
  useEffect(() => {
    const qty = parseFloat(totalYield) || 0;
    const rate = parseFloat(mandiRate) || 0;
    if (qty && rate) {
      setTotalSaleAmount((qty * rate).toString());

    }
  }, [totalYield, mandiRate]);

  // Get active partner
  const activePartner = partners.find(p => p.status === 'active') || partners[0];

  const handleSaveHarvest = async () => {
    if (!totalYield || parseFloat(totalYield) <= 0) {
      Alert.alert(t('common.error'), 'Please enter a valid yield amount');
      return;
    }
    setLoading(true);

    try {
      const harvestData = {
        totalYield: parseFloat(totalYield),
        yieldUnit,
        mandiRate: mandiRate ? parseFloat(mandiRate) : 0,
        totalSaleAmount: parseFloat(totalSaleAmount) || 0,
        saleDate: new Date(saleDate).toISOString(),
        recordedAt: new Date().toISOString()
      };

      // Save harvest on farm object
      const currentHarvests = selectedFarm.harvests || [];
      currentHarvests.push(harvestData);
      
      await editFarm(farmId, { 
        harvests: currentHarvests,
        currentCrop: '' // Reset crop since it has been harvested
      });

      Alert.alert(t('common.success'), t('harvest.saveSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('harvest.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSettled = async () => {
    if (!activePartner) return;
    setSettling(true);

    try {
      const settlement = calculateTermsSettlement(expenses, activePartner, {
        totalYield: parseFloat(totalYield) || 0,
        mandiRate: parseFloat(mandiRate) || 0,
        totalSaleAmount: parseFloat(totalSaleAmount) || 0
      });

      // Log a settlement document
      await createSettlement({
        farmId,
        partnerId: activePartner.id,
        amount: Math.abs(settlement.netSettlement),
        settledBy: profile.uid,
        note: `Harvest Final Settlement: ${totalYield} ${yieldUnit} of crop`,
        season: selectedFarm?.cropSeason || 'year-round'
      });

      // Update partner status to settled
      const pDb = await import('../../../../shared/services/partnerService.js');
      await pDb.updatePartner(activePartner.id, { status: 'settled' });

      // Refresh partner details
      await fetchPartnersByFarm(farmId);

      Alert.alert(t('common.success'), t('harvest.settleSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (err) {
      Alert.alert(t('common.error'), err.message || t('harvest.settleFailed'));
    } finally {
      setSettling(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!activePartner) return;
    const settlement = calculateTermsSettlement(expenses, activePartner, {
      totalYield: parseFloat(totalYield) || 0,
      mandiRate: parseFloat(mandiRate) || 0,
      totalSaleAmount: parseFloat(totalSaleAmount) || 0
    });

    const netText = settlement.netSettlement > 0 
      ? `Owner owes Partner: ₹${settlement.netSettlement.toLocaleString('en-IN')}`
      : `Partner owes Owner: ₹${Math.abs(settlement.netSettlement).toLocaleString('en-IN')}`;

    const text = `🌾 *KHET KHARCHA - HARVEST REPORT* 🌾\n` +
      `-----------------------------------\n` +
      `*Farm Plot:* ${selectedFarm?.name}\n` +
      `*Partner:* ${activePartner.name}\n` +
      `*Crop Season:* ${selectedFarm?.cropSeason?.toUpperCase()}\n` +
      `-----------------------------------\n` +
      `*Total Yield:* ${totalYield} ${yieldUnit}\n` +
      `*Partner Share (${settlement.cropSharePercent}%):* ${Math.round(totalYield * settlement.cropSharePercent / 100)} ${yieldUnit}\n` +
      `*Crop Valuation:* ₹${settlement.estimatedCropShare.toLocaleString('en-IN')}\n` +
      `*Partner Crop Share:* ₹${settlement.partnerCropDue.toLocaleString('en-IN')}\n` +
      `-----------------------------------\n` +
      `*Partner Expense Due:* ₹${settlement.partnerBalance.toLocaleString('en-IN')}\n` +
      `(Total Farm Cost: ₹${settlement.totalFarmExpense.toLocaleString('en-IN')})\n` +
      `-----------------------------------\n` +
      `*NET FINAL ACCOUNT:*\n` +
      `${netText}\n` +
      `-----------------------------------\n` +
      `_Generated via Khet Kharcha App_`;

    const encoded = encodeURIComponent(text);
    Linking.openURL(`whatsapp://send?text=${encoded}`).catch(() => {
      // Fallback if WhatsApp is not installed
      Linking.openURL(`https://api.whatsapp.com/send?text=${encoded}`);
    });
  };

  const season = selectedFarm?.cropSeason || 'year-round';

  const settlement = activePartner 
    ? calculateTermsSettlement(expenses, activePartner, {
        totalYield: parseFloat(totalYield) || 0,
        mandiRate: parseFloat(mandiRate) || 0,
        totalSaleAmount: parseFloat(totalSaleAmount) || 0
      })
    : null;

  const mandiAdvice = analyzeSale({
    crop: selectedFarm?.currentCrop,
    quantity: totalYield,
    unit: yieldUnit,
    amount: totalSaleAmount,
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('harvest.title')}</Text>
      <Text style={styles.subtitle}>
        {selectedFarm?.name} {selectedFarm?.currentCrop ? `(${selectedFarm.currentCrop})` : ''}
      </Text>
      {mandiAdvice.verdict !== 'unknown' && (
        <Card style={[styles.card, styles.mandiCard, {
          borderLeftWidth: 4,
          borderLeftColor:
            mandiAdvice.verdict === 'good' ? COLORS.success
              : mandiAdvice.verdict === 'low' ? COLORS.danger
                : COLORS.accent,
        }]}>
          <Card.Content>
            <View style={styles.mandiHeader}>
              <Ionicons
                name={mandiAdvice.verdict === 'good' ? 'trending-up' : mandiAdvice.verdict === 'low' ? 'trending-down' : 'remove'}
                size={18}
                color={
                  mandiAdvice.verdict === 'good' ? COLORS.success
                    : mandiAdvice.verdict === 'low' ? COLORS.danger
                      : COLORS.accent
                }
              />
              <Text style={styles.mandiTitle}>{t('expense.mandiTitle')}</Text>
            </View>
            <Text style={styles.mandiMessage}>{mandiAdvice.message}</Text>
            <Text style={styles.mandiMeta}>
              {`₹${mandiAdvice.realizedRate?.toLocaleString('en-IN') || 0}/quintal`}
              {mandiAdvice.benchmarkRate ? `  •  ref ₹${mandiAdvice.benchmarkRate.toLocaleString('en-IN')}` : ''}
            </Text>
          </Card.Content>
        </Card>
      )}


      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          
          {/* Yield Quantity */}
          <View style={styles.yieldRow}>
            <TextInput
              label={t('harvest.totalYield') + ' *'}
              value={totalYield}
              onChangeText={setTotalYield}
              keyboardType="numeric"
              mode="outlined"
              activeOutlineColor={COLORS.primary}
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              left={<TextInput.Icon icon="scale-balance" />}
            />
            <View style={{ width: 120 }}>
              <Text style={styles.unitLabel}>Unit</Text>
              <SegmentedButtons
                value={yieldUnit}
                onValueChange={setYieldUnit}
                buttons={[
                  { value: 'quintal', label: 'Q' },
                  { value: 'kg', label: 'KG' },
                  { value: 'ton', label: 'Ton' },
                ]}
                style={styles.segmentedBtn}
                theme={{ colors: { primary: COLORS.primary } }}
              />
            </View>
          </View>

          {/* Mandi Rate */}
          <TextInput
            label={t('harvest.mandiRate', { unit: yieldUnit })}
            value={mandiRate}
            onChangeText={setMandiRate}
            keyboardType="numeric"
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            left={<TextInput.Icon icon="cash-outline" />}
          />

          {/* Total Sale Amount */}
          <TextInput
            label={t('harvest.saleAmount')}
            value={totalSaleAmount}
            onChangeText={setTotalSaleAmount}
            keyboardType="numeric"
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            left={<TextInput.Icon icon="currency-inr" />}
          />

          {/* Sale Date */}
          <TextInput
            label={t('harvest.saleDate')}
            value={saleDate}
            onChangeText={setSaleDate}
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            left={<TextInput.Icon icon="calendar-outline" />}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.btnRow}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              textColor={COLORS.textSecondary}
              style={[styles.btn, { borderColor: COLORS.border }]}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveHarvest}
              loading={loading}
              disabled={loading || !totalYield}
              buttonColor={COLORS.primary}
              style={styles.btn}
            >
              {t('common.save')}
            </Button>
          </View>

        </Card.Content>
      </Card>

      {/* Settlement Details */}
      {activePartner && settlement && (
        <Card style={[styles.card, styles.settlementCard]}>
          <Card.Content>
            <Text style={styles.settlementTitle}>🌾 {t('harvest.finalAccount').toUpperCase()}</Text>
            
            <View style={styles.receiptContainer}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptPartnerName}>{activePartner.name}</Text>
                <Text style={styles.receiptSub}>{selectedFarm?.name} • {season.toUpperCase()}</Text>
              </View>

              <View style={styles.receiptBody}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Yield:</Text>
                  <Text style={styles.receiptVal}>{totalYield || 0} {yieldUnit}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Partner Share ({settlement.cropSharePercent}%):</Text>
                  <Text style={[styles.receiptVal, { color: COLORS.primary }]}>
                    {Math.round((parseFloat(totalYield) || 0) * settlement.cropSharePercent / 100)} {yieldUnit}
                  </Text>
                </View>
                <View style={[styles.receiptRow, styles.receiptBorder]}>
                  <Text style={styles.receiptLabel}>Crop Value:</Text>
                  <Text style={styles.receiptVal}>₹{settlement.estimatedCropShare.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.receiptRow, styles.receiptBorder]}>
                  <Text style={styles.receiptLabel}>Partner Expense Due:</Text>
                  <Text style={[styles.receiptVal, { color: COLORS.danger }]}>₹{settlement.partnerBalance.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.netAccountContainer}>
                  {settlement.netSettlement > 0 ? (
                    <View style={styles.netBox}>
                      <Text style={styles.netLabel}>{t('harvest.partnerReceives')}</Text>
                      <Text style={[styles.netVal, { color: COLORS.success }]}>
                        ₹{settlement.netSettlement.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.netSub}>
                        OR {Math.round((parseFloat(totalYield) || 0) * settlement.cropSharePercent / 100)} {yieldUnit} crop
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.netBox}>
                      <Text style={styles.netLabel}>{t('harvest.partnerOwes')}</Text>
                      <Text style={[styles.netVal, { color: COLORS.danger }]}>
                        ₹{Math.abs(settlement.netSettlement).toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.netSub}>Outstanding expense share due</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Button
              mode="contained"
              icon="logo-whatsapp"
              onPress={handleShareWhatsApp}
              buttonColor="#25D366"
              textColor="#FFFFFF"
              style={styles.actionBtn}
            >
              {t('harvest.shareWhatsApp')}
            </Button>

            <Button
              mode="contained"
              icon="checkbox-marked-circle-outline"
              onPress={handleMarkSettled}
              loading={settling}
              disabled={settling || !totalYield}
              buttonColor={COLORS.primary}
              style={[styles.actionBtn, { marginTop: 10 }]}
            >
              {t('harvest.markSettled')}
            </Button>

          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mandiCard: { marginTop: 12 },
  mandiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mandiTitle: { fontWeight: '800', fontSize: 13, color: COLORS.textPrimary },
  mandiMessage: { marginTop: 6, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  mandiMeta: { marginTop: 4, fontSize: 11, color: COLORS.textTertiary },
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    elevation: 1.5,
    marginBottom: 20,
  },
  cardContent: {
    paddingVertical: 8,
  },
  yieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
    paddingLeft: 2,
  },
  segmentedBtn: {
    height: 40,
  },
  input: {
    marginBottom: 12,
    backgroundColor: COLORS.card,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    width: '48%',
    borderRadius: 12,
  },
  settlementCard: {
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  settlementTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  receiptContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  receiptHeader: {
    backgroundColor: '#333333',
    padding: 12,
    alignItems: 'center',
  },
  receiptPartnerName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  receiptSub: {
    color: '#AAAAAA',
    fontSize: 10,
    marginTop: 2,
  },
  receiptBody: {
    padding: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10,
  },
  receiptLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '750',
    color: COLORS.textPrimary,
  },
  netAccountContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  netBox: {
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  netVal: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  netSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
});
