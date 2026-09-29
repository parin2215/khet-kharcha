import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import CategoryIcon from './CategoryIcon.jsx';
import AmountDisplay from './AmountDisplay.jsx';
import OwnershipBadge from './OwnershipBadge.jsx';
import { formatDate } from '../../../shared/utils/helpers.js';
import { getCategoryById } from '../../../shared/constants/categories.js';
import { COLORS } from '../../../shared/constants/index.js';

export default function ExpenseCard({ expense, farmName, onPress }) {
  const { t } = useTranslation();
  const category = getCategoryById(expense.category);
  const categoryLabel = category?.nameKey ? t(category.nameKey) : expense.category;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <CategoryIcon categoryId={expense.category} size="standard" />
        
        <View style={styles.details}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
          <Text style={styles.subText}>
            {farmName || t('farm.title')} • {formatDate(expense.date)}
          </Text>
          {expense.notes ? (
            <Text style={styles.noteText} numberOfLines={1}>
              {expense.notes}
            </Text>
          ) : null}
        </View>
        
        <View style={styles.amountContainer}>
          <AmountDisplay 
            amount={expense.amount} 
            textStyle={styles.amountText} 
          />
          <View style={styles.badgeContainer}>
            <OwnershipBadge type={expense.expenseType} />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgeContainer: {
    marginTop: 4,
  },
});
