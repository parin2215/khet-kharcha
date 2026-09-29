import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatINR } from '../../../shared/utils/helpers.js';
import { COLORS } from '../../../shared/constants/index.js';

export default function AmountDisplay({ amount, style, textStyle }) {
  return (
    <Text style={[styles.text, textStyle, style]}>
      {formatINR(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'], // alignment for numeric chars
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
