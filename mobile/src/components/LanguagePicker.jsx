import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Portal, Dialog, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LANGUAGES } from '../../../shared/constants/index.js';

export default function LanguagePicker({ visible, onDismiss, selectedLang, onSelect }) {
  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{t('auth.selectLanguage')}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <ScrollView>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.item}
                onPress={() => onSelect(lang.code)}
              >
                <Text style={styles.text}>
                  {lang.flag} {lang.name}
                </Text>
                {selectedLang === lang.code && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  text: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
