/**
 * Khet Kharcha — VoiceExpenseSheet
 *
 * Lets a farmer log an expense by speaking instead of typing. The parsing engine
 * (shared/utils/voiceExpense.js) is dependency-free and always available; audio
 * capture is optional and only enabled when a recorder module is installed
 * (expo-audio / expo-av), so the feature degrades gracefully to a text box rather
 * than crashing on a build that lacks the native module.
 */
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, TextInput, Button, Portal, Dialog, Chip, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { parseVoiceExpense } from '../../../shared/utils/voiceExpense.js';
import { COLORS } from '../../../shared/constants/index.js';
import { getCategoryById } from '../../../shared/constants/categories.js';

// Optional native recorder. Resolved lazily so a missing module never breaks the bundle.
let RecorderModule = null;
try {
  // eslint-disable-next-line global-require
  RecorderModule = require('expo-audio');
} catch {
  try {
    // eslint-disable-next-line global-require
    RecorderModule = require('expo-av');
  } catch {
    RecorderModule = null;
  }
}

const EXAMPLES = [
  'diesel do hazaar rupaye',
  'khet ka khad 1500',
  'majdoori 500 per din',
  'bijli ka bill 4200',
];

export default function VoiceExpenseSheet({ visible, onDismiss, onApply, initialCategory = null }) {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState('');

  const parsed = useMemo(
    () => parseVoiceExpense(transcript, { defaultCategory: initialCategory }),
    [transcript, initialCategory]
  );

  const hasMic = Boolean(RecorderModule);

  const startRecording = async () => {
    setError('');
    if (!hasMic) {
      setError(
        'Microphone capture needs the expo-audio package. Type the expense instead, or install: npx expo install expo-audio'
      );
      return;
    }
    try {
      const Audio = RecorderModule;
      const permission = await (Audio.requestRecordingPermissionsAsync
        ? Audio.requestRecordingPermissionsAsync()
        : Promise.resolve({ granted: true }));
      if (permission && permission.granted === false) {
        setError('Microphone permission denied.');
        return;
      }
      const next = Audio.createAudioRecorder
        ? new Audio.AudioRecorder()
        : await Audio.Audio.Recording.createAsync(Audio.Audio.RecordingOptionsPresets.LOW_QUALITY);
      setRecorder(next);
      if (next.prepareToRecordAsync) await next.prepareToRecordAsync();
      if (next.startAsync) await next.startAsync();
      setIsListening(true);
    } catch (e) {
      setError(e?.message || 'Could not start recording.');
      setIsListening(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recorder) return;
      let uri = null;
      if (recorder.stop) {
        await recorder.stop();
        uri = recorder.uri || null;
      } else if (recorder.stopAndUnloadAsync) {
        await recorder.stopAndUnloadAsync();
        uri = recorder.getURI ? recorder.getURI() : null;
      }
      setIsListening(false);
      setRecorder(null);
      // Transcription requires an on-device STT service; without one the user
      // types what they said, and the same parser handles both paths.
      if (uri) setError('Recorded. Add the transcription below to fill the form.');
    } catch (e) {
      setError(e?.message || 'Could not stop recording.');
      setIsListening(false);
    }
  };

  const handleApply = () => {
    if (!parsed.amount) {
      setError('Could not find an amount. Try "diesel 2000".');
      return;
    }
    onApply({
      amount: String(parsed.amount),
      category: parsed.category || initialCategory || 'other',
      expenseType: parsed.expenseType || undefined,
    });
    setTranscript('');
    setError('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{t('expense.voiceTitle', 'Speak your expense')}</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={{ maxHeight: 420 }}>
            <Text variant="bodySmall" style={styles.hint}>
              {t(
                'expense.voiceHint',
                'Say the category and amount, e.g. "diesel do hazaar rupaye".'
              )}
            </Text>

            <View style={styles.micRow}>
              <TouchableOpacity
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={isListening ? stopRecording : startRecording}
                accessibilityLabel={isListening ? 'Stop recording' : 'Start recording'}
              >
                <Ionicons
                  name={isListening ? 'stop' : 'mic'}
                  size={30}
                  color={isListening ? COLORS.danger : '#FFFFFF'}
                />
              </TouchableOpacity>
              <Text style={styles.micLabel}>
                {isListening ? t('common.listening', 'Listening...') : t('common.tapToSpeak', 'Tap to speak')}
              </Text>
            </View>

            {!hasMic && (
              <HelperText type="info" visible>
                Voice capture needs the expo-audio package. You can type below instead.
              </HelperText>
            )}

            <TextInput
              mode="outlined"
              label={t('expense.voiceTranscript', 'What did you say?')}
              value={transcript}
              onChangeText={setTranscript}
              placeholder="diesel do hazaar rupaye"
              style={styles.input}
            />

            <View style={styles.examples}>
              {EXAMPLES.map((ex) => (
                <Chip key={ex} compact onPress={() => setTranscript(ex)} style={styles.chip}>
                  {ex}
                </Chip>
              ))}
            </View>

            {transcript.length > 0 && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>{t('expense.detected', 'Detected')}</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>{t('expense.amount', 'Amount')}</Text>
                  <Text style={styles.previewValue}>
                    {parsed.amount !== null ? `₹${parsed.amount.toLocaleString('en-IN')}` : '—'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>{t('expense.category', 'Category')}</Text>
                  <Text style={styles.previewValue}>
                    {parsed.category
                      ? t(getCategoryById(parsed.category)?.nameKey || 'category.other')
                      : '—'}
                  </Text>
                </View>
                {parsed.expenseType && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{t('expense.type', 'Type')}</Text>
                    <Text style={styles.previewValue}>{parsed.expenseType}</Text>
                  </View>
                )}
                <Text style={styles.confidence}>
                  {t('expense.confidence', 'Confidence')}: {Math.round(parsed.confidence * 100)}%
                </Text>
              </View>
            )}

            {error ? <HelperText type="error" visible>{error}</HelperText> : null}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('common.cancel', 'Cancel')}</Button>
          <Button mode="contained" onPress={handleApply} disabled={!parsed.amount}>
            {t('expense.useThis', 'Use this')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: { borderRadius: 20 },
  hint: { marginBottom: 12, color: COLORS.textSecondary },
  micRow: { alignItems: 'center', marginVertical: 8 },
  micButton: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  micButtonActive: { backgroundColor: COLORS.danger },
  micLabel: { marginTop: 8, fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  input: { marginTop: 12 },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: { marginBottom: 4 },
  preview: {
    marginTop: 14, padding: 12, borderRadius: 12,
    backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border,
  },
  previewTitle: { fontWeight: '800', marginBottom: 6, color: COLORS.textPrimary },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  previewLabel: { color: COLORS.textSecondary, fontSize: 13 },
  previewValue: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 13 },
  confidence: { marginTop: 6, fontSize: 11, color: COLORS.textTertiary },
});