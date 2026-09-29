import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Text, Card, Button, Dialog, Portal, ActivityIndicator, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import { getCategoryById } from '../../../../shared/constants/categories.js';
import { formatINR, formatDate } from '../../../../shared/utils/helpers.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ExpenseCard from '../../components/ExpenseCard.jsx';

export default function ReportsScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const {
    expenses,
    totals,
    categoryBreakdown,
    farmWiseTotals,
    fetchExpenses,
    fetchStats,
    loading
  } = useExpenseStore();

  const [farmFilter, setFarmFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'own' | 'partner'
  const [dateRange, setDateRange] = useState('this-month'); // 'this-month' | 'last-month' | 'all'

  const [farmDialogVisible, setFarmDialogVisible] = useState(false);
  const [typeDialogVisible, setTypeDialogVisible] = useState(false);
  const [dateDialogVisible, setDateDialogVisible] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);

  const loadData = () => {
    if (!profile?.uid) return;
    let startDate = null;
    let endDate = null;
    const now = new Date();

    if (dateRange === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (dateRange === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    const filters = {};
    if (farmFilter !== 'all') filters.farmId = farmFilter;
    if (typeFilter !== 'all') filters.expenseType = typeFilter;
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    fetchExpenses(profile.uid, filters);
    fetchStats(profile.uid, filters);
  };

  useEffect(() => {
    loadData();
  }, [profile, farmFilter, typeFilter, dateRange]);

  const selectedFarmLabel = farmFilter === 'all' 
    ? 'All Farms' 
    : farms.find(f => f.id === farmFilter)?.name || 'Farm';

  const selectedTypeLabel = typeFilter === 'all'
    ? 'All Splits'
    : typeFilter === 'own' ? 'Maro Kharcha (Own)' : 'Bhagidari (Partner)';

  const selectedDateLabel = dateRange === 'this-month'
    ? 'This Month'
    : dateRange === 'last-month' ? 'Last Month' : 'All Records';

  // Export report to PDF
  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #1a1a18; }
              h1 { color: #1D9E75; text-align: center; margin-bottom: 5px; }
              .tagline { text-align: center; color: #6b6b67; font-size: 14px; margin-bottom: 25px; }
              .summary-box { background-color: #F7F7F5; border: 1px solid #e5e5e3; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
              .summary-grid { display: flex; justify-content: space-between; margin-top: 10px; }
              .summary-col { text-align: center; flex: 1; }
              .summary-col span { font-size: 10px; text-transform: uppercase; color: #6b6b67; font-weight: bold; }
              .summary-col h2 { margin: 5px 0 0 0; color: #1a1a18; }
              .summary-col h2.own { color: #16a34a; }
              .summary-col h2.partner { color: #d97706; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e5e5e3; padding: 10px; text-align: left; font-size: 12px; }
              th { background-color: #1D9E75; color: white; text-transform: uppercase; font-weight: bold; }
              tr:nth-child(even) { background-color: #F7F7F5; }
              .amount { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Khet Kharcha (खेत खर्चा)</h1>
            <div class="tagline">Farming Ledger Statement</div>
            <div class="summary-box">
              <div><strong>Farmer Name:</strong> ${profile?.name || 'Farmer'}</div>
              <div><strong>State:</strong> ${profile?.state || 'N/A'}</div>
              <div><strong>Report Filter:</strong> ${selectedFarmLabel} | ${selectedTypeLabel} | ${selectedDateLabel}</div>
              <div class="summary-grid">
                <div class="summary-col">
                  <span>Total Expense</span>
                  <h2>₹${totals.total.toLocaleString('en-IN')}</h2>
                </div>
                <div class="summary-col">
                  <span>Own Costs</span>
                  <h2 class="own">₹${totals.own.toLocaleString('en-IN')}</h2>
                </div>
                <div class="summary-col">
                  <span>Partner Splits</span>
                  <h2 class="partner">₹${totals.partner.toLocaleString('en-IN')}</h2>
                </div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Farm Plot</th>
                  <th>Split Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map((exp) => {
                  const farm = farms.find(f => f.id === exp.farmId);
                  const cat = getCategoryById(exp.category);
                  const categoryLabel = cat ? t(cat.nameKey) : exp.category;
                  return `
                    <tr>
                      <td>${new Date(exp.date?.toDate ? exp.date.toDate() : exp.date).toLocaleDateString('en-IN')}</td>
                      <td>${categoryLabel}</td>
                      <td>${farm?.name || 'Unknown'}</td>
                      <td>${exp.expenseType === 'own' ? 'Own Share' : 'Partner Share'}</td>
                      <td class="amount">₹${exp.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate PDF Report.');
    }
  };

  // Screen layout details
  const screenWidth = Dimensions.get('window').width;

  // Format category chart data
  const validCategories = categoryBreakdown.filter(item => item.total > 0).slice(0, 5);
  const categoryChartData = {
    labels: validCategories.map(item => {
      const cat = getCategoryById(item.category);
      const label = cat ? t(cat.nameKey) : item.category;
      return label.substring(0, 10);
    }),
    datasets: [{
      data: validCategories.map(item => item.total)
    }]
  };

  // Format farm chart data
  const validFarms = farmWiseTotals.filter(item => item.total > 0).slice(0, 5);
  const farmChartData = {
    labels: validFarms.map(item => {
      const farm = farms.find(f => f.id === item.farmId);
      const name = farm?.name || 'Unknown';
      return name.substring(0, 10);
    }),
    datasets: [{
      data: validFarms.map(item => item.total)
    }]
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('navigation.reports')}</Text>
          <Text style={styles.headerSubtitle}>Physical statement & analytics</Text>
        </View>
        <TouchableOpacity
          disabled={expenses.length === 0}
          style={[styles.exportBtn, expenses.length === 0 && styles.disabledBtn]}
          onPress={handleExportPDF}
        >
          <Ionicons name="document-text" size={20} color={expenses.length === 0 ? COLORS.textSecondary : '#FFFFFF'} />
          <Text style={[styles.exportBtnText, expenses.length === 0 && { color: COLORS.textSecondary }]}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filters Summary Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity style={styles.filterChip} onPress={() => setFarmDialogVisible(true)}>
            <Text style={styles.filterChipText}>{selectedFarmLabel}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setTypeDialogVisible(true)}>
            <Text style={styles.filterChipText}>{selectedTypeLabel}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setDateDialogVisible(true)}>
            <Text style={styles.filterChipText}>{selectedDateLabel}</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Totals Summary Cards */}
        <View style={styles.totalsRow}>
          <Card style={styles.totalCard}>
            <Card.Content style={styles.totalContent}>
              <Text style={styles.totalLabel}>Total ledger</Text>
              <AmountDisplay amount={totals.total} textStyle={styles.totalVal} />
            </Card.Content>
          </Card>
          <Card style={[styles.totalCard, { backgroundColor: COLORS.primaryLight }]}>
            <Card.Content style={styles.totalContent}>
              <Text style={[styles.totalLabel, { color: COLORS.ownExpense }]}>Own Costs</Text>
              <AmountDisplay amount={totals.own} textStyle={[styles.totalVal, { color: COLORS.ownExpense }]} />
            </Card.Content>
          </Card>
          <Card style={[styles.totalCard, { backgroundColor: COLORS.accentLight }]}>
            <Card.Content style={styles.totalContent}>
              <Text style={[styles.totalLabel, { color: COLORS.partnerExpense }]}>Partners</Text>
              <AmountDisplay amount={totals.partner} textStyle={[styles.totalVal, { color: COLORS.partnerExpense }]} />
            </Card.Content>
          </Card>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View>
            {/* Category Cost Breakdown Chart */}
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>{t('reports.categoryBreakdown') || 'Category Cost Breakdown'}</Text>
                {validCategories.length > 0 ? (
                  <BarChart
                    data={categoryChartData}
                    width={screenWidth - 56}
                    height={200}
                    chartConfig={{
                      backgroundColor: COLORS.card,
                      backgroundGradientFrom: COLORS.card,
                      backgroundGradientTo: COLORS.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(29, 158, 117, ${opacity})`,
                      labelColor: () => COLORS.textPrimary,
                      style: { borderRadius: 16 }
                    }}
                    style={{ marginVertical: 8, borderRadius: 12 }}
                    verticalLabelRotation={15}
                  />
                ) : (
                  <Text style={styles.noChartText}>{t('reports.noData') || 'No data for category chart'}</Text>
                )}
              </Card.Content>
            </Card>

            {/* Farm Cost comparison chart */}
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>{t('reports.farmWise') || 'Farm Wise Cost comparison'}</Text>
                {validFarms.length > 0 ? (
                  <BarChart
                    data={farmChartData}
                    width={screenWidth - 56}
                    height={200}
                    chartConfig={{
                      backgroundColor: COLORS.card,
                      backgroundGradientFrom: COLORS.card,
                      backgroundGradientTo: COLORS.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(217, 119, 6, ${opacity})`,
                      labelColor: () => COLORS.textPrimary,
                      style: { borderRadius: 16 }
                    }}
                    style={{ marginVertical: 8, borderRadius: 12 }}
                    verticalLabelRotation={15}
                  />
                ) : (
                  <Text style={styles.noChartText}>{t('reports.noData') || 'No data for farm chart'}</Text>
                )}
              </Card.Content>
            </Card>

            {/* Ledger List */}
            <Text style={styles.sectionTitle}>Ledger Logs</Text>
            {expenses.length > 0 ? (
              expenses.map((item) => {
                const farm = farms.find((f) => f.id === item.farmId);
                return (
                  <ExpenseCard
                    key={item.id}
                    expense={item}
                    farmName={farm?.name}
                    onPress={() => navigation.navigate('FarmsTab', { screen: 'FarmDetail', params: { id: item.farmId } })}
                  />
                );
              })
            ) : (
              <Card style={styles.emptyCard}>
                <EmptyState
                  icon="journal-outline"
                  message="No expenses found matching the selected filters."
                />
              </Card>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Selection Dialogs */}
      <Portal>
        {/* Farm Dialog */}
        <Dialog visible={farmDialogVisible} onDismiss={() => setFarmDialogVisible(false)}>
          <Dialog.Title>Select Farm Plot</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setFarmFilter('all'); setFarmDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>All Farms</Text>
              {farmFilter === 'all' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
            {farms.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.dialogItem}
                onPress={() => { setFarmFilter(f.id); setFarmDialogVisible(false); }}
              >
                <Text style={styles.dialogText}>{f.name}</Text>
                {farmFilter === f.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* Type Dialog */}
        <Dialog visible={typeDialogVisible} onDismiss={() => setTypeDialogVisible(false)}>
          <Dialog.Title>Select Split Mode</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setTypeFilter('all'); setTypeDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>All Splits</Text>
              {typeFilter === 'all' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setTypeFilter('own'); setTypeDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>Maro Kharcha (Own)</Text>
              {typeFilter === 'own' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setTypeFilter('partner'); setTypeDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>Bhagidari (Partnership)</Text>
              {typeFilter === 'partner' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          </Dialog.Content>
        </Dialog>

        {/* Date Dialog */}
        <Dialog visible={dateDialogVisible} onDismiss={() => setDateDialogVisible(false)}>
          <Dialog.Title>Select Date Interval</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setDateRange('this-month'); setDateDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>This Month</Text>
              {dateRange === 'this-month' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setDateRange('last-month'); setDateDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>Last Month</Text>
              {dateRange === 'last-month' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogItem}
              onPress={() => { setDateRange('all'); setDateDialogVisible(false); }}
            >
              <Text style={styles.dialogText}>All Records</Text>
              {dateRange === 'all' && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
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
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
  },
  scrollContent: {
    padding: 16,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '31%',
    justifyContent: 'space-between',
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalCard: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    elevation: 1,
  },
  totalContent: {
    padding: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  totalVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  loader: {
    marginVertical: 40,
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1.5,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  noChartText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 12,
    paddingLeft: 4,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    elevation: 1,
    marginBottom: 20,
  },
  dialogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dialogText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});
