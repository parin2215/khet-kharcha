import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { COLORS } from '../../../../shared/constants/index.js';
import FarmCard from '../../components/FarmCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function FarmListScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms, loading } = useFarmStore();

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('navigation.farms')}</Text>
          <Text style={styles.subtitle}>Manage your crop lands and splits</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditFarm')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : farms.length > 0 ? (
        <FlatList
          data={farms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FarmCard
              farm={item}
              totalExpense={0} // Can fetch stats per farm if needed
              unitPreference={profile?.unitPreference || 'bigha'}
              onPress={() => navigation.navigate('FarmDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="leaf"
            message="No farm plots added yet. Click Add to log your first field plot."
            btnLabel="Add Farm Plot"
            onBtnPress={() => navigation.navigate('AddEditFarm')}
          />
        </View>
      )}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
