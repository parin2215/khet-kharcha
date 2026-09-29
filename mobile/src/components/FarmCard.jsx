import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import OwnershipBadge from './OwnershipBadge.jsx';
import SeasonBadge from './SeasonBadge.jsx';
import AmountDisplay from './AmountDisplay.jsx';
import { COLORS } from '../../../shared/constants/index.js';

export default function FarmCard({ farm, totalExpense = 0, unitPreference = 'bigha', onPress }) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{farm.name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.location}>{farm.location || 'India'}</Text>
            </View>
          </View>
          <OwnershipBadge type={farm.ownershipType} />
        </View>

        {/* Info Row */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{t('farm.size') || 'Size'}</Text>
            <Text style={styles.infoValue}>
              {farm.size} {t(`unit.${unitPreference || 'bigha'}`)}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{t('farm.crop') || 'Crop'}</Text>
            <Text style={styles.infoValue}>{farm.currentCrop || 'N/A'}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>{t('expense.total') || 'Expenses'}</Text>
            <AmountDisplay amount={totalExpense} textStyle={styles.expenseValue} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <SeasonBadge seasonId={farm.cropSeason} />
          
          {farm.ownershipType === 'partner' && farm.partners && farm.partners.length > 0 ? (
            <View style={styles.partnersTextContainer}>
              <Ionicons name="people" size={14} color={COLORS.partnerExpense} />
              <Text style={styles.partnersText} numberOfLines={1}>
                {farm.partners.map(p => p.name).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  expenseValue: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnersTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  partnersText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
});
