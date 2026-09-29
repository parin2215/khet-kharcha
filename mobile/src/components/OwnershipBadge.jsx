import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../shared/constants/index.js';

export default function OwnershipBadge({ type }) {
  const { t } = useTranslation();
  const isOwn = type === 'own';
  const color = isOwn ? COLORS.ownExpense : COLORS.partnerExpense;
  const label = isOwn ? t('farm.own') || 'My Farm' : t('farm.partner') || 'Partnership';

  return (
    <View style={[
      styles.badge, 
      { 
        backgroundColor: isOwn ? COLORS.ownExpenseLight : COLORS.partnerExpenseLight,
        borderColor: color + '30'
      }
    ]}>
      <Text style={[styles.text, { color: color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
