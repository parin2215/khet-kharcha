import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Dialog, Portal, ActivityIndicator, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { COLORS, EXPENSE_CATEGORIES } from '../../../../shared/constants/index.js';
import { getCategoryById } from '../../../../shared/constants/categories.js';
import { uploadFile } from '../../../../shared/services/storageService.js';
import { STORAGE_PATHS } from '../../../../shared/firebase.config.js';
import CategoryIcon from '../../components/CategoryIcon.jsx';
import { toLocalDateString } from '../../../../shared/utils/helpers.js';
import VoiceExpenseSheet from '../../components/VoiceExpenseSheet.jsx';

export default function AddExpenseScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { createExpense } = useExpenseStore();

  const [farmId, setFarmId] = useState('');
  const [expenseType, setExpenseType] = useState('own'); // 'own' | 'partner'
  const [partnerId, setPartnerId] = useState('');
  const [category, setCategory] = useState('seeds');
  const [amount, setAmount] = useState('');
  const [dateType, setDateType] = useState('today'); // 'today' | 'yesterday' | 'custom'
  const [customDate, setCustomDate] = useState(toLocalDateString());
  const [notes, setNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [farmDialogVisible, setFarmDialogVisible] = useState(false);
  const [voiceSheetVisible, setVoiceSheetVisible] = useState(false);

  // Apply a parsed voice result to the form fields.
  const applyVoiceResult = ({ amount: voiceAmount, category: voiceCategory, expenseType: voiceType }) => {
    if (voiceAmount) setAmount(String(voiceAmount));
    if (voiceCategory) setCategory(voiceCategory);
    if (voiceType) setExpenseType(voiceType);
  };

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);

  // Set default farm
  useEffect(() => {
    if (farms.length > 0 && !farmId) {
      setFarmId(farms[0].id);
    }
  }, [farms, farmId]);

  const selectedFarm = farms.find((f) => f.id === farmId);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        t('common.error') || 'Error',
        'Camera and Photo Library permissions are required to attach receipts.'
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Pick image error', e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Take photo error', e);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUri(null);
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!farmId) {
      setErrorMsg('Please select a farm');
      return;
    }

    const expAmount = parseFloat(amount);
    if (isNaN(expAmount) || expAmount <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    if (expenseType === 'partner' && selectedFarm?.ownershipType === 'partner' && !partnerId) {
      setErrorMsg('Please select a partner');
      return;
    }

    let finalDate = new Date();
    if (dateType === 'yesterday') {
      finalDate.setDate(finalDate.getDate() - 1);
    } else if (dateType === 'custom') {
      const parts = customDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        finalDate = new Date(year, month, day);
      } else {
        setErrorMsg('Please enter date in YYYY-MM-DD format');
        return;
      }
    }

    setLoading(true);

    try {
      let receiptURL = '';
      const expId = Math.random().toString(36).substring(7);

      if (receiptUri) {
        const path = STORAGE_PATHS.receipts(profile.uid, farmId, expId);
        receiptURL = await uploadFile(receiptUri, path, (progress) => {
          setUploadProgress(progress);
        });
      }

      const expenseData = {
        farmId,
        ownerId: profile.uid,
        category,
        amount: expAmount,
        expenseType,
        partnerId: expenseType === 'partner' ? partnerId : '',
        date: finalDate,
        notes,
        receiptURL,
        season: selectedFarm?.cropSeason || 'year-round'
      };

      await createExpense(expenseData);
      Alert.alert(t('common.success') || 'Success', t('expenses.saved') || 'Expense saved successfully!');
      navigation.goBack();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('navigation.addExpense')}</Text>
          <Text style={styles.headerSubtitle}>Record a new farm expense</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Farm Selection */}
        <Text style={styles.label}>{t('expenses.selectFarm') || 'Select Farm'}</Text>
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setFarmDialogVisible(true)}
        >
          <Ionicons name="leaf-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.selectorText}>
            {selectedFarm ? `${selectedFarm.name} (${selectedFarm.ownershipType === 'own' ? 'My Farm' : 'Partnership'})` : 'Choose Farm'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Date Mode Toggle */}
        <Text style={styles.label}>{t('expenses.date') || 'Date'}</Text>
        <SegmentedButtons
          value={dateType}
          onValueChange={setDateType}
          buttons={[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'custom', label: 'Custom' }
          ]}
          style={styles.segmented}
          theme={{ colors: { primary: COLORS.primary } }}
        />

        {dateType === 'custom' && (
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={customDate}
            onChangeText={setCustomDate}
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={styles.input}
            placeholder="e.g. 2026-06-08"
            keyboardType="numeric"
            left={<TextInput.Icon icon="calendar" />}
            theme={{ roundness: 10 }}
          />
        )}

        {/* Expense Type Toggle for Partnership Farms */}
        {selectedFarm?.ownershipType === 'partner' && (
          <View style={styles.partnerContainer}>
            <Text style={styles.label}>{t('expenses.expenseType') || 'Expense Type'}</Text>
            <SegmentedButtons
              value={expenseType}
              onValueChange={(val) => {
                setExpenseType(val);
                setPartnerId('');
              }}
              buttons={[
                { value: 'own', label: 'Own', checkedColor: COLORS.ownExpense },
                { value: 'partner', label: 'Partner', checkedColor: COLORS.partnerExpense }
              ]}
              style={styles.segmented}
              theme={{ colors: { primary: COLORS.primary } }}
            />

            {expenseType === 'partner' && (
              <View style={styles.partnerPickerSection}>
                <Text style={styles.label}>Select Partner *</Text>
                <View style={styles.partnerRow}>
                  {selectedFarm.partners?.map((p, idx) => {
                    const isSelected = partnerId === p.name;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.partnerSelectBtn,
                          isSelected && { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight }
                        ]}
                        onPress={() => setPartnerId(p.name)}
                      >
                        <Text style={[styles.partnerSelectText, isSelected && { color: COLORS.primary, fontWeight: '700' }]}>
                          {p.name}
                        </Text>
                        <Text style={styles.partnerSelectSub}>({p.sharePercent}%)</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Voice entry */}
        <Button
          mode="outlined"
          icon="microphone"
          onPress={() => setVoiceSheetVisible(true)}
          style={styles.voiceButton}
          contentStyle={styles.voiceButtonContent}
        >
          {t('expenses.speakExpense') || 'Speak expense'}
        </Button>

        {/* Amount Input */}
        <Text style={styles.label}>{t('expenses.amount') || 'Expense Amount (₹)'}</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.amountInput}
          left={<TextInput.Icon icon="currency-inr" />}
          theme={{ roundness: 10 }}
        />

        {/* Categories Grid */}
        <Text style={styles.label}>{t('expenses.category') || 'Select Category'}</Text>
        <View style={styles.categoriesGrid}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const categoryData = getCategoryById(cat.id);
            const activeColor = categoryData?.color || COLORS.primary;
            const activeBg = categoryData?.bgColor || COLORS.primaryLight;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  isSelected 
                    ? { borderColor: activeColor, backgroundColor: activeBg }
                    : { borderColor: '#e0e0d8', backgroundColor: '#fafaf8' }
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <CategoryIcon categoryId={cat.id} size="standard" />
                <Text style={[
                  styles.categoryLabel, 
                  isSelected 
                    ? { fontWeight: '700', color: activeColor }
                    : { color: '#aaaaaa' }
                ]}>
                  {t(cat.nameKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.label}>{t('expenses.note') || 'Note (Optional)'}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Specify seed type, tractor hire details, etc."
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          left={<TextInput.Icon icon="pencil" />}
          theme={{ roundness: 10 }}
        />

        {/* Attach Receipt Photo */}
        <Text style={styles.label}>{t('expenses.receipt') || 'Attach Receipt Photo'}</Text>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptButtons}>
            <Button 
              mode="outlined" 
              icon="camera" 
              onPress={handleTakePhoto}
              style={styles.receiptBtn}
              textColor={COLORS.textPrimary}
              borderColor={COLORS.border}
            >
              {t('expenses.takePhoto') || 'Camera'}
            </Button>
            <Button 
              mode="outlined" 
              icon="image" 
              onPress={handlePickImage}
              style={styles.receiptBtn}
              textColor={COLORS.textPrimary}
              borderColor={COLORS.border}
            >
              {t('expenses.chooseFromGallery') || 'Gallery'}
            </Button>
          </View>

          {receiptUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: receiptUri }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removePreviewBtn}
                onPress={handleRemoveReceipt}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading && uploadProgress > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>{t('expenses.uploading') || 'Uploading receipt...'} {uploadProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressIndicator, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
          buttonColor={COLORS.primary}
          contentStyle={{ paddingVertical: 8 }}
        >
          {t('expenses.save') || 'Save Expense'}
        </Button>
      </ScrollView>

      {/* Farm Picker Dialog */}
      <VoiceExpenseSheet
        visible={voiceSheetVisible}
        onDismiss={() => setVoiceSheetVisible(false)}
        onApply={applyVoiceResult}
        initialCategory={category}
      />

      <Portal>
        <Dialog visible={farmDialogVisible} onDismiss={() => setFarmDialogVisible(false)}>
          <Dialog.Title>Select Farm</Dialog.Title>
          <Dialog.Content>
            {farms.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.dialogItem}
                onPress={() => {
                  setFarmId(f.id);
                  setPartnerId('');
                  setFarmDialogVisible(false);
                }}
              >
                <Text style={styles.dialogText}>{f.name}</Text>
                <Text style={styles.dialogSub}>({f.ownershipType === 'own' ? 'My Farm' : 'Partnership'})</Text>
                {farmId === f.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  voiceButton: { marginBottom: 10, borderRadius: 10 },
  voiceButtonContent: { height: 46 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#f8f8f5',
  },
  selectorText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  segmented: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8f8f5',
  },
  amountInput: {
    marginBottom: 16,
    backgroundColor: '#f8f8f5',
    fontSize: 18,
    fontWeight: '800',
  },
  partnerContainer: {
    marginBottom: 8,
  },
  partnerPickerSection: {
    marginTop: 4,
    marginBottom: 12,
  },
  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  partnerSelectBtn: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  partnerSelectText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  partnerSelectSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBtn: {
    width: '31%',
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  receiptContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 16,
  },
  receiptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptBtn: {
    flex: 0.48,
  },
  previewContainer: {
    marginTop: 12,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
    height: 46,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.divider,
  },
  dialogText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  dialogSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 'auto',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});
