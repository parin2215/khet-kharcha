import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { Sprout, MapPin, Scale, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { SIZE_UNITS, COLORS } from '../../../../shared/constants/index.js';
import { getSeasonOptions } from '../../../../shared/constants/seasons.js';
import { getPartnersByOwner, addPartner } from '../../../../shared/services/partnerService.js';
import { updateFarm } from '../../../../shared/services/farmService.js';
import { toLocalDateString } from '../../../../shared/utils/helpers.js';

export default function AddFarmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { createFarm } = useFarmStore();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState('bigha');
  const [ownershipType, setOwnershipType] = useState('own'); // 'own' | 'partner'
  const [cropSeason, setCropSeason] = useState('kharif');
  const [currentCrop, setCurrentCrop] = useState('');
  const [notes, setNotes] = useState('');
  const [addPartnerEnabled, setAddPartnerEnabled] = useState(false);

  // Lease state
  const [leaseLesseeName, setLeaseLesseeName] = useState('');
  const [leaseLesseePhone, setLeaseLesseePhone] = useState('');
  const [leaseAmount, setLeaseAmount] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState(toLocalDateString());
  const [leaseEndDate, setLeaseEndDate] = useState('');

  // Partners array for partnership type
  // Elements structure: { mode: 'new' | 'existing', id: '', name: '', phone: '', terms: null, changeAgreement: 'yes' | 'no' }
  const [partners, setPartners] = useState([]);
  const [existingPartners, setExistingPartners] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPartners = async () => {
      if (profile?.uid) {
        try {
          const list = await getPartnersByOwner(profile.uid);
          // De-duplicate by phone or name
          const uniqueMap = {};
          list.forEach(p => {
            const key = p.phone ? p.phone.replace(/\D/g, '') : p.name;
            if (!uniqueMap[key]) {
              uniqueMap[key] = { id: p.id, name: p.name, phone: p.phone, terms: p.terms };
            }
          });
          setExistingPartners(Object.values(uniqueMap));
        } catch (err) {
          console.error('Failed to load existing partners', err);
        }
      }
    };
    loadPartners();
  }, [profile]);

  const handleAddPartner = () => {
    setPartners([...partners, { mode: 'new', id: '', name: '', phone: '', terms: null, changeAgreement: 'yes' }]);
  };

  const handleRemovePartner = (index) => {
    setPartners(partners.filter((_, i) => i !== index));
  };

  const handlePartnerChange = (index, updatedObjectOrField, value) => {
    const updated = [...partners];
    if (typeof updatedObjectOrField === 'object') {
      updated[index] = updatedObjectOrField;
    } else {
      updated[index][updatedObjectOrField] = value;
    }
    setPartners(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter a farm name');
      setLoading(false);
      return;
    }

    const farmSize = parseFloat(size);
    if (isNaN(farmSize) || farmSize <= 0) {
      setError('Please enter a valid size');
      setLoading(false);
      return;
    }

    // Partnership validation
    let formattedPartners = [];
    if (ownershipType === 'leased') {
      if (!leaseLesseeName.trim()) {
        setError('Please enter lessee name');
        setLoading(false);
        return;
      }
      if (!leaseAmount || parseFloat(leaseAmount) <= 0) {
        setError('Please enter a valid lease amount');
        setLoading(false);
        return;
      }
    } else if (ownershipType === 'partner' || (ownershipType === 'own' && addPartnerEnabled)) {
      if (partners.length === 0) {
        setError('Please add at least one partner for partnership land');
        setLoading(false);
        return;
      }

      for (const p of partners) {
        if (p.mode === 'new' && !p.name.trim()) {
          setError('Please enter a name for all new partners');
          setLoading(false);
          return;
        }
        if (p.mode === 'existing' && !p.id) {
          setError('Please select a valid existing partner');
          setLoading(false);
          return;
        }
        
        formattedPartners.push({
          mode: p.mode,
          id: p.id,
          name: p.name,
          phone: p.phone,
          terms: p.terms,
          changeAgreement: p.changeAgreement
        });
      }
    }

    try {
      const farmData = {
        name,
        location,
        size: farmSize,
        sizeUnit: unit,
        ownershipType: (ownershipType === 'own' && addPartnerEnabled) ? 'partner' : ownershipType,
        cropSeason,
        currentCrop,
        notes,
        ownerId: profile.uid,
        partners: [] // Will update with created partner details below
      };

      const newFarmId = await createFarm(farmData);

      if (ownershipType === 'leased') {
        const amount = parseFloat(leaseAmount) || 0;
        const phoneVal = leaseLesseePhone || '';
        await addPartner({
            farmId: newFarmId,
            ownerId: profile.uid,
            name: leaseLesseeName,
            phone: phoneVal.startsWith('+91') ? phoneVal : (phoneVal ? `+91${phoneVal}` : ''),
            season: cropSeason,
            startDate: new Date(leaseStartDate),
            status: 'active',
            totalOwed: amount, // Lessee owes this amount for the lease
            totalPaid: 0,
            terms: {
                systemType: 'lease',
                leaseAmount: amount,
                startDate: leaseStartDate,
                endDate: leaseEndDate || null
            }
        });
        // Redirect to farm detail page
        navigate(`/farms/${newFarmId}`);
        return;
      }

      // Handle partners creation if anythe partners collection
      let firstRedirectPartnerId = null;
      const finalPartners = [];

      if ((ownershipType === 'partner' || (ownershipType === 'own' && addPartnerEnabled)) && formattedPartners.length > 0) {
        for (const p of formattedPartners) {
          let shareVal = 50;
          let terms = {
            templateName: 'Batai 50-50',
            systemType: 'batai',
            cropSharePercent: 50,
            cropShareBasis: 'yield_kg',
            paymentTiming: 'after_harvest',
            expenseSharing: {
              khad_fertilizer: 50,
              keetnashak_pesticide: 50,
              beej_seeds: 50,
              bijli_electricity: 50,
              sinchai_irrigation: 50,
              majdoori_labour: 50,
              tractor_machinery: 50,
              diesel_fuel: 50,
              transport: 50,
              mandi_charges: 50,
              packaging: 50,
              other: 50
            },
            partnerResponsibilities: ['labour', 'irrigation', 'sowing', 'weeding', 'harvesting'],
            customNotes: ''
          };
          
          let phoneVal = p.phone || '';

          if (p.mode === 'existing') {
            if (p.changeAgreement === 'no' && p.terms) {
              terms = p.terms;
              shareVal = p.terms.cropSharePercent || 50;
            }
          }

          const newPartnerId = await addPartner({
            farmId: newFarmId,
            ownerId: profile.uid,
            name: p.name,
            phone: phoneVal.startsWith('+91') ? phoneVal : (phoneVal ? `+91${phoneVal}` : ''),
            season: cropSeason,
            startDate: new Date(),
            status: 'active',
            totalOwed: 0,
            totalPaid: 0,
            terms
          });

          // If this partner requires agreement editing, redirect them
          if (p.mode === 'new' || p.changeAgreement === 'yes') {
            if (!firstRedirectPartnerId) {
              firstRedirectPartnerId = newPartnerId;
            }
          }

          finalPartners.push({
            partnerId: newPartnerId,
            name: p.name,
            phone: phoneVal.startsWith('+91') ? phoneVal : (phoneVal ? `+91${phoneVal}` : ''),
            sharePercent: shareVal,
            totalOwed: 0,
            totalPaid: 0
          });
        }

        // Update the farm plot's partners array to maintain consistency
        await updateFarm(newFarmId, { partners: finalPartners });
      }

      if (firstRedirectPartnerId) {
        navigate(`/farms/${newFarmId}/partners/${firstRedirectPartnerId}/edit`);
      } else {
        navigate(`/farms/${newFarmId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farms')}
          className="p-2 bg-white hover:bg-stone-50 border border-stone-200/50 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Add New Farm</h1>
          <p className="text-xs text-stone-400 font-medium">Record a new farm plot under your profile.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200/50 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Farm Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Farm Name *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <Sprout className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Narmada Bigha"
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Location / Village
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <MapPin className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bardoli"
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Size & Unit */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Farm Size *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 5"
                className="w-2/3 px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-1/3 px-3 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white cursor-pointer"
              >
                {SIZE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {t(u.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ownership Toggle */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Ownership Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setOwnershipType('own')}
                className={`text-center py-2.5 rounded-lg text-xs font-bold transition duration-200 ${
                  ownershipType === 'own' 
                    ? 'bg-white text-ownExpense shadow' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                My Farm
              </button>
              <button
                type="button"
                onClick={() => setOwnershipType('partner')}
                className={`text-center py-2.5 rounded-lg text-xs font-bold transition duration-200 ${
                  ownershipType === 'partner' 
                    ? 'bg-white text-partnerExpense shadow' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Batai/Partnership
              </button>
              <button
                type="button"
                onClick={() => setOwnershipType('leased')}
                className={`text-center py-2.5 rounded-lg text-xs font-bold transition duration-200 ${
                  ownershipType === 'leased' 
                    ? 'bg-white text-purple-600 shadow' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Leased Out
              </button>
            </div>
          </div>

          {/* Crop Season */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Crop Season
            </label>
            <select
              value={cropSeason}
              onChange={(e) => setCropSeason(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white cursor-pointer"
            >
              {getSeasonOptions().map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Crop */}
          {ownershipType !== 'leased' && (
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Current Crop
              </label>
              <input
                type="text"
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                placeholder="e.g. Cotton, Wheat, Sugarcane"
                className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
            </div>
          )}

          {/* Leased Out Fields */}
          {ownershipType === 'leased' && (
            <div className="md:col-span-2 space-y-6 border-t border-stone-100 pt-6 mt-2">
              <h3 className="text-sm font-bold text-stone-900">Lease Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Lessee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leaseLesseeName}
                    onChange={(e) => setLeaseLesseeName(e.target.value)}
                    placeholder="Who is leasing the farm?"
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Lessee Phone
                  </label>
                  <input
                    type="tel"
                    value={leaseLesseePhone}
                    onChange={(e) => setLeaseLesseePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Total Lease Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={leaseAmount}
                  onChange={(e) => setLeaseAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm font-bold"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Partner Option Switch (Visible only for own farm) */}
          {ownershipType === 'own' ? (
            <div className="flex items-center justify-between px-5 py-3.5 border border-stone-200 rounded-xl bg-stone-50/50 shadow-sm self-end h-[50px] mb-[2px]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Add Partner / Splits?
                </span>
                <span className="text-[10px] text-stone-400 font-medium leading-none mt-1">
                  Enable crop/cost sharing splits
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addPartnerEnabled}
                  onChange={(e) => setAddPartnerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-stone-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ) : (
            <div></div> /* Placeholder to keep layout grid aligned when ownershipType is partner */
          )}

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about land status, irrigation channels, etc."
              className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm resize-none"
            />
          </div>
        </div>

        {/* Partnership Form Section */}
        {(ownershipType === 'partner' || (ownershipType === 'own' && addPartnerEnabled)) && (
          <div className="border-t border-stone-100 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Partner Details</h3>
                <p className="text-[10px] text-stone-400 font-medium">Add shares for your partner(s) in this Bataidari agreement.</p>
              </div>
              
              <button
                type="button"
                onClick={handleAddPartner}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Partner
              </button>
            </div>

            {partners.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl text-stone-400 text-xs font-semibold">
                No partners added. Click "Add Partner" to set up partnership splits.
              </div>
            ) : (
              <div className="space-y-4">
                {partners.map((partner, index) => (
                  <div key={index} className="flex flex-col gap-3 bg-stone-50 border border-stone-100 p-4 rounded-xl relative animate-in fade-in slide-in-from-top-3 duration-200">
                    <button
                      type="button"
                      onClick={() => handleRemovePartner(index)}
                      className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-650 transition cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Partner Choice / Selector */}
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Select Partner *
                        </label>
                        <select
                          value={partner.mode === 'existing' ? partner.id : 'new'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'new') {
                              handlePartnerChange(index, {
                                mode: 'new',
                                id: '',
                                name: '',
                                phone: '',
                                terms: null,
                                changeAgreement: 'yes'
                              });
                            } else {
                              const ep = existingPartners.find(p => p.id === val);
                              if (ep) {
                                handlePartnerChange(index, {
                                  mode: 'existing',
                                  id: ep.id,
                                  name: ep.name,
                                  phone: ep.phone,
                                  terms: ep.terms || null,
                                  changeAgreement: 'no'
                                });
                              }
                            }
                          }}
                          className="w-full px-3 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:border-primary focus:outline-none transition shadow-sm cursor-pointer"
                        >
                          <option value="new">+ Add New Partner</option>
                          {existingPartners.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.phone || 'No Phone'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Conditional input based on partner mode */}
                      {partner.mode === 'new' ? (
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                            Partner Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={partner.name}
                            onChange={(e) => handlePartnerChange(index, { ...partner, name: e.target.value })}
                            placeholder="e.g. Ramesh Patel"
                            className="w-full px-3 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:border-primary focus:outline-none transition shadow-sm"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                            Partnership Agreement
                          </label>
                          <select
                            value={partner.changeAgreement}
                            onChange={(e) => handlePartnerChange(index, { ...partner, changeAgreement: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:border-primary focus:outline-none transition shadow-sm cursor-pointer"
                          >
                            <option value="no">Use same agreement terms as before</option>
                            <option value="yes">Change agreement / Edit terms</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Helper text instructions */}
                    <div className="text-[10px] text-stone-400 font-semibold leading-relaxed">
                      {partner.mode === 'new' ? (
                        <span>Phone number and crop/cost splits will be entered on the next page.</span>
                      ) : partner.changeAgreement === 'yes' ? (
                        <span>You will be redirected to the detailed agreement page after creating the farm.</span>
                      ) : (
                        <span>Will copy the previous agreement terms ({partner.terms?.templateName || 'Batai 50-50'}). No redirect needed.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/farms')}
            className="w-1/2 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition cursor-pointer text-sm"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            {loading ? 'Creating...' : 'Create Farm'}
          </button>
        </div>

      </form>

    </div>
  );
}
