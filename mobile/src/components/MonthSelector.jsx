import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/index.js';

export default function MonthSelector({ selectedDate, onChange }) {
  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  const formatMonthYear = (date) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePreviousMonth} style={styles.arrow}>
        <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
      
      <Text style={styles.text}>{formatMonthYear(selectedDate)}</Text>
      
      <TouchableOpacity onPress={handleNextMonth} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  arrow: {
    padding: 4,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
