import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryById } from '../../../shared/constants/categories.js';

export default function CategoryIcon({ categoryId, size = 'standard' }) {
  const category = getCategoryById(categoryId);
  const iconName = category?.ionicon || 'ellipse-outline';
  const color = category?.color || '#888880';
  const bgColor = category?.bgColor || '#f0f0ec';

  const isSmall = size === 'small';
  const boxSize = isSmall ? 28 : 36;
  const borderRadius = isSmall ? 8 : 10;
  const iconSize = isSmall ? 14 : 18;

  return (
    <View style={[
      styles.iconContainer, 
      { 
        backgroundColor: bgColor,
        width: boxSize,
        height: boxSize,
        borderRadius: borderRadius
      }
    ]}>
      <Ionicons name={iconName} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
