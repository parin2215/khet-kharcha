import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/index.js';

export default function EmptyState({ icon = 'alert-circle-outline', message, btnLabel, onBtnPress }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textSecondary + '40'} />
      <Text style={styles.message}>{message}</Text>
      {btnLabel && onBtnPress ? (
        <Button
          mode="contained"
          buttonColor={COLORS.primary}
          onPress={onBtnPress}
          style={styles.btn}
        >
          {btnLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 20,
  },
  btn: {
    borderRadius: 8,
  },
});
