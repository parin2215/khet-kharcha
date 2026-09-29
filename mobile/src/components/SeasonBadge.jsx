import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getSeasonById } from '../../../shared/constants/seasons.js';

export default function SeasonBadge({ seasonId }) {
  const { t } = useTranslation();
  const season = getSeasonById(seasonId);
  const label = season?.nameKey ? t(season.nameKey) : seasonId;

  const getSeasonStyles = (id) => {
    switch (id) {
      case 'kharif':
        return { bg: '#E6F1FB', text: '#0C447C' };
      case 'rabi':
        return { bg: '#FAEEDA', text: '#633806' };
      case 'zaid':
        return { bg: '#FAECE7', text: '#D85A30' };
      default:
        return { bg: '#f0f0ec', text: '#888880' };
    }
  };

  const style = getSeasonStyles(seasonId);

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.text + '30' }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
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
