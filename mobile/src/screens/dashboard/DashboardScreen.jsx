import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import MonthSelector from '../../components/MonthSelector.jsx';
import ExpenseCard from '../../components/ExpenseCard.jsx';

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { expenses, totals, fetchExpenses, fetchStats, loading } = useExpenseStore();
  const { pendingCount, fetchPendingSummary } = useBillStore();
  const { upcoming, fetchUpcoming, toggleReminder } = useReminderStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!profile?.uid) return;
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    await Promise.all([
      fetchFarms(profile.uid),
      fetchExpenses(profile.uid, { startDate, endDate }),
      fetchStats(profile.uid, { startDate, endDate }),
      fetchPendingSummary(profile.uid),
      fetchUpcoming(profile.uid, 3),
    ]);
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Jai Kisan, {profile?.name || 'Farmer'}! 🌾</Text>
            <Text style={styles.subtitle}>Let's manage your farm ledger details.</Text>
          </View>
        </View>

        {/* Month Selector */}
        <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />

        {/* 2x2 summary cards */}
        <View style={styles.summaryGrid}>
          {/* Total Expense */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.cardLabel}>{t('expense.total')}</Text>
              <AmountDisplay amount={totals.total} style={styles.cardValue} />
            </Card.Content>
          </Card>
          
          {/* Own Expense */}
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.primaryLight }]}>
            <Card.Content>
              <Text style={[styles.cardLabel, { color: COLORS.ownExpense }]}>{t('expense.own')}</Text>
              <AmountDisplay amount={totals.own} style={[styles.cardValue, { color: COLORS.ownExpense }]} />
            </Card.Content>
          </Card>

          {/* Partner Expense */}
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.accentLight }]}>
            <Card.Content>
              <Text style={[styles.cardLabel, { color: COLORS.partnerExpense }]}>{t('expense.partner')}</Text>
              <AmountDisplay amount={totals.partner} style={[styles.cardValue, { color: COLORS.partnerExpense }]} />
            </Card.Content>
          </Card>

          {/* Pending bills */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.cardLabel}>{t('navigation.bills')}</Text>
              <View style={styles.billsRow}>
                <Text style={styles.billsCount}>{pendingCount.count} unpaid</Text>
                <AmountDisplay amount={pendingCount.total} style={styles.billsTotal} />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Expenses List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : expenses.length > 0 ? (
            expenses.slice(0, 5).map((item) => {
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
            <Text style={styles.emptyText}>No expenses logged for this month.</Text>
          )}
        </View>

        {/* Reminders list */}
        <View style={[styles.section, { marginBottom: 80 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Activities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SettingsTab', { screen: 'Reminders' })}>
              <Text style={styles.viewAllText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {upcoming.length > 0 ? (
            upcoming.map((rem) => (
              <Card key={rem.id} style={styles.reminderCard}>
                <Card.Content style={styles.reminderContent}>
                  <TouchableOpacity 
                    style={styles.checkbox}
                    onPress={() => toggleReminder(rem.id, true)}
                  >
                    <Ionicons name="ellipse-outline" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <View style={styles.reminderDetails}>
                    <Text style={styles.reminderTitle}>{rem.title}</Text>
                    <Text style={styles.reminderDue}>
                      Due: {new Date(rem.dueDate?.toDate ? rem.dueDate.toDate() : rem.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming reminders.</Text>
          )}
        </View>

      </ScrollView>

      {/* Quick Add Expense FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddExpenseTab')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  billsRow: {
    marginTop: 6,
  },
  billsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  billsTotal: {
    fontSize: 13,
    color: COLORS.danger,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginVertical: 12,
  },
  reminderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    marginRight: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reminderDue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 76,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
});
