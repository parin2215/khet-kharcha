import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Dialog, Portal, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { COLORS, SIZE_UNITS } from '../../../../shared/constants/index.js';
import { getSeasonOptions } from '../../../../shared/constants/seasons.js';

export default function AddEditFarmScreen({ navigation }) {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { createFarm, editFarm, loading } = useFarmStore();
  const { createPartner } = usePartnerStore();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState('bigha');
  const [ownershipType, setOwnershipType] = useState('own'); // 'own' | 'partner'
  const [cropSeason, setCropSeason] = useState('kharif');
  const [currentCrop, setCurrentCrop] = useState('');
  const [notes, setNotes] = useState('');

  const [partners, setPartners] = useState([]);
  
  const [existingPartners, setExistingPartners] = useState([]);
  const [partnerSelectVisible, setPartnerSelectVisible] = useState(false);
  
  const [unitDialogVisible, setUnitDialogVisible] = useState(false);
  const [seasonDialogVisible, setSeasonDialogVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadExistingPartners = async () => {
      if (profile?.uid) {
        try {
          const { getPartnersByOwner } = await import('../../../../shared/services/partnerService.js');
          const list = await getPartnersByOwner(profile.uid);
          
          // De-duplicate by phone number
          const uniqueMap = {};
          list.forEach(p => {
            const key = p.phone ? p.phone.replace(/\D/g, '') : p.name;
            if (!uniqueMap[key]) {
              uniqueMap[key] = { name: p.name, phone: p.phone };
            }
          });
          setExistingPartners(Object.values(uniqueMap));
        } catch (e) {
          console.error('Failed to load existing partners', e);
        }
      }
    };
    loadExistingPartners();
  }, [profile]);

  const handleAddPartnerClick = () => {
    if (existingPartners.length > 0) {
      setPartnerSelectVisible(true);
    } else {
      setPartners([...partners, { name: '', phone: '', sharePercent: '' }]);
    }
  };

  const handleRemovePartner = (index) => {
    setPartners(partners.filter((_, i) => i !== index));
  };

  const handlePartnerChange = (index, field, value) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a farm name');
      return;
    }

    const farmSize = parseFloat(size);
    if (isNaN(farmSize) || farmSize <= 0) {
      setErrorMsg('Please enter a valid size');
      return;
    }

    let formattedPartners = [];
    if (ownershipType === 'partner') {
      if (partners.length === 0) {
        setErrorMsg('Please add at least one partner');
        return;
      }

      let totalPartnerShare = 0;
      for (const p of partners) {
        if (!p.name.trim() || !p.phone.trim() || !p.sharePercent) {
          setErrorMsg('Please fill in all details for all partners');
          return;
        }

        const share = parseFloat(p.sharePercent);
        if (isNaN(share) || share <= 0 || share >= 100) {
          setErrorMsg('Partner share % must be between 0 and 100');
          return;
        }
        totalPartnerShare += share;
        formattedPartners.push({
          name: p.name,
          phone: p.phone,
          sharePercent: share,
          totalOwed: 0,
          totalPaid: 0
        });
      }

      if (totalPartnerShare >= 100) {
        setErrorMsg('Total partner shares cannot equal or exceed 100%');
        return;
      }
    }

    try {
      const farmData = {
        name,
        location,
        size: farmSize,
        sizeUnit: unit,
        ownershipType,
        cropSeason,
        currentCrop,
        notes,
        ownerId: profile.uid,
        partners: ownershipType === 'partner' ? formattedPartners : []
      };

      const newFarmId = await createFarm(farmData);

      // Save partners to the partners collection with default Batai terms
      if (ownershipType === 'partner' && formattedPartners.length > 0) {
        const finalPartners = [];
        for (const p of formattedPartners) {
          const shareVal = parseFloat(p.sharePercent) || 50;
          const terms = {
            templateName: `Batai ${shareVal}-${100 - shareVal}`,
            systemType: 'batai',
            cropSharePercent: shareVal,
            cropShareBasis: 'yield_kg',
            paymentTiming: 'after_harvest',
            expenseSharing: {
              khad_fertilizer: shareVal,
              keetnashak_pesticide: shareVal,
              beej_seeds: shareVal,
              bijli_electricity: shareVal,
              sinchai_irrigation: shareVal,
              majdoori_labour: shareVal,
              tractor_machinery: shareVal,
              diesel_fuel: shareVal,
              transport: shareVal,
              mandi_charges: shareVal,
              packaging: shareVal,
              other: shareVal
            },
            partnerResponsibilities: ['labour', 'irrigation', 'sowing', 'weeding', 'harvesting'],
            customNotes: ''
          };

          const formattedPhone = p.phone.startsWith('+91') ? p.phone : `+91${p.phone}`;

          const newPartnerId = await createPartner({
            farmId: newFarmId,
            ownerId: profile.uid,
            name: p.name,
            phone: formattedPhone,
            season: cropSeason,
            startDate: new Date(),
            status: 'active',
            totalOwed: 0,
            totalPaid: 0,
            terms
          });

          finalPartners.push({
            partnerId: newPartnerId,
            name: p.name,
            phone: formattedPhone,
            sharePercent: shareVal,
            totalOwed: 0,
            totalPaid: 0
          });
        }

        // Update the farm with partner IDs
        await editFarm(newFarmId, { partners: finalPartners });
      }

      navigation.goBack();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create farm');
    }
  };

  const availablePartners = existingPartners.filter(
    ep => !partners.some(p => p.phone.replace(/\D/g, '') === ep.phone.replace(/\D/g, ''))
  );

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
          <Text style={styles.headerTitle}>{t('navigation.addFarm') || 'Add Farm'}</Text>
          <Text style={styles.headerSubtitle}>Create a new farm or plot record</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Farm Name */}
        <TextInput
          label="Farm Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          left={<TextInput.Icon icon="sprout" />}
          theme={{ roundness: 10 }}
        />

        {/* Location */}
        <TextInput
          label="Location / Village"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" />}
          theme={{ roundness: 10 }}
        />

        {/* Size & Unit Row */}
        <View style={styles.row}>
          <TextInput
            label="Plot Size *"
            value={size}
            onChangeText={setSize}
            keyboardType="numeric"
            mode="outlined"
            activeOutlineColor={COLORS.primary}
            style={[styles.input, { flex: 2, marginRight: 8 }]}
            theme={{ roundness: 10 }}
          />
          <TouchableOpacity 
            style={[styles.selectorTrigger, { flex: 1, height: 50, marginTop: 6 }]}
            onPress={() => setUnitDialogVisible(true)}
          >
            <Text style={{ fontSize: 13, color: COLORS.textPrimary }}>{t(`unit.${unit}`)}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Ownership Toggle */}
        <Text style={styles.label}>Ownership Type</Text>
        <SegmentedButtons
          value={ownershipType}
          onValueChange={setOwnershipType}
          buttons={[
            { value: 'own', label: 'My Farm', checkedColor: COLORS.ownExpense },
            { value: 'partner', label: 'Partnership', checkedColor: COLORS.partnerExpense }
          ]}
          style={styles.segmented}
          theme={{ colors: { primary: COLORS.primary } }}
        />

        {/* Season Selector */}
        <TouchableOpacity 
          style={styles.selectorTrigger}
          onPress={() => setSeasonDialogVisible(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <Text style={{ color: COLORS.textPrimary }}>Season: {cropSeason.toUpperCase()}</Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Current Crop */}
        <TextInput
          label="Current Crop"
          value={currentCrop}
          onChangeText={setCurrentCrop}
          placeholder="e.g. Cotton, Sugarcane"
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          theme={{ roundness: 10 }}
        />

        {/* Notes */}
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          mode="outlined"
          activeOutlineColor={COLORS.primary}
          style={styles.input}
          theme={{ roundness: 10 }}
        />

        {/* Partnership Form Details */}
        {ownershipType === 'partner' && (
          <View style={styles.partnerSection}>
            <View style={styles.partnerHeader}>
              <Text style={styles.partnerTitle}>Partner Details</Text>
              <Button
                mode="text"
                icon="plus"
                onPress={handleAddPartnerClick}
                textColor={COLORS.primary}
                labelStyle={{ fontWeight: 'bold' }}
              >
                Add Partner
              </Button>
            </View>

            {partners.map((partner, index) => (
              <Card key={index} style={styles.partnerCard}>
                <Card.Content>
                  <View style={styles.partnerCardHeader}>
                    <Text style={styles.partnerIndex}>Partner #{index + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemovePartner(index)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    label="Partner Name"
                    value={partner.name}
                    onChangeText={(val) => handlePartnerChange(index, 'name', val)}
                    mode="outlined"
                    dense
                    activeOutlineColor={COLORS.primary}
                    style={styles.denseInput}
                    theme={{ roundness: 10 }}
                  />

                  <TextInput
                    label="Phone Number"
                    value={partner.phone}
                    onChangeText={(val) => handlePartnerChange(index, 'phone', val)}
                    keyboardType="phone-pad"
                    mode="outlined"
                    dense
                    activeOutlineColor={COLORS.primary}
                    style={styles.denseInput}
                    theme={{ roundness: 10 }}
                  />

                  <TextInput
                    label="Share Percentage"
                    value={partner.sharePercent}
                    onChangeText={(val) => handlePartnerChange(index, 'sharePercent', val)}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    activeOutlineColor={COLORS.primary}
                    style={styles.denseInput}
                    right={<TextInput.Affix text="%" />}
                    theme={{ roundness: 10 }}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
          buttonColor={COLORS.primary}
        >
          Create Farm
        </Button>

      </ScrollView>

      {/* Picker Dialogs */}
      <Portal>
        {/* Partner Selection Dialog */}
        <Dialog visible={partnerSelectVisible} onDismiss={() => setPartnerSelectVisible(false)}>
          <Dialog.Title>Select Partner</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
            <ScrollView>
              {/* Option to add a new manual partner */}
              <TouchableOpacity
                style={styles.dialogItem}
                onPress={() => {
                  setPartners([...partners, { name: '', phone: '', sharePercent: '' }]);
                  setPartnerSelectVisible(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingHorizontal: 20 }}>
                  <Ionicons name="person-add-outline" size={20} color={COLORS.primary} style={{ marginRight: 12 }} />
                  <Text style={[styles.dialogText, { color: COLORS.primary, fontWeight: '700' }]}>
                    + Add New Partner
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color={COLORS.primary} style={{ marginRight: 20 }} />
              </TouchableOpacity>

              {/* List of existing partners */}
              {availablePartners.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.dialogItem}
                  onPress={() => {
                    setPartners([...partners, { name: p.name, phone: p.phone, sharePercent: '' }]);
                    setPartnerSelectVisible(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingHorizontal: 20 }}>
                    <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                    <View>
                      <Text style={styles.dialogText}>{p.name}</Text>
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>{p.phone}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={16} color={COLORS.textTertiary} style={{ marginRight: 20 }} />
                </TouchableOpacity>
              ))}

              {availablePartners.length === 0 && existingPartners.length > 0 && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' }}>
                    All existing partners have already been added to this farm.
                  </Text>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPartnerSelectVisible(false)} textColor={COLORS.textSecondary}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Unit Selection */}
        <Dialog visible={unitDialogVisible} onDismiss={() => setUnitDialogVisible(false)}>
          <Dialog.Title>Select Unit</Dialog.Title>
          <Dialog.Content>
            {SIZE_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={styles.dialogItem}
                onPress={() => {
                  setUnit(u.value);
                  setUnitDialogVisible(false);
                }}
              >
                <Text style={styles.dialogText}>{t(u.labelKey)}</Text>
                {unit === u.value && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>

        {/* Season Selection */}
        <Dialog visible={seasonDialogVisible} onDismiss={() => setSeasonDialogVisible(false)}>
          <Dialog.Title>Select Season</Dialog.Title>
          <Dialog.Content>
            {getSeasonOptions().map((s) => (
              <TouchableOpacity
                key={s.value}
                style={styles.dialogItem}
                onPress={() => {
                  setCropSeason(s.value);
                  setSeasonDialogVisible(false);
                }}
              >
                <Text style={styles.dialogText}>{s.label}</Text>
                {cropSeason === s.value && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
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
  input: {
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f5',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  segmented: {
    marginBottom: 16,
  },
  partnerSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 16,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  partnerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  partnerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partnerIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  denseInput: {
    marginBottom: 8,
    backgroundColor: '#f8f8f5',
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 32,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  dialogText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
