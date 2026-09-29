import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { Sprout, IndianRupee, Calendar, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../../../shared/constants/categories.js';
import { uploadFile } from '../../../../shared/services/storageService.js';
import { STORAGE_PATHS } from '../../../../shared/firebase.config.js';
import * as Icons from 'lucide-react';
import { toLocalDateString, parseLocalDateString } from '../../../../shared/utils/helpers.js';
import { parseReceiptText } from '../../../../shared/utils/receiptParser.js';

export default function AddExpensePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { createTransaction, editTransaction } = useTransactionStore();

  const [farmId, setFarmId] = useState('');
  const [expenseType, setExpenseType] = useState('own'); // 'own' | 'partner'
  const [partnerId, setPartnerId] = useState('');
  const [category, setCategory] = useState('seeds');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalDateString());
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptText, setReceiptText] = useState('');
  const [receiptPrefill, setReceiptPrefill] = useState(null);
  
  const { partners, fetchPartnersByFarm } = usePartnerStore();
  const [ownerShare, setOwnerShare] = useState('');
  const [partnerShare, setPartnerShare] = useState('');
  const [isManualOverride, setIsManualOverride] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activePartner = partners.find(p => p.status === 'active') || partners[0];
  const selectedFarm = farms.find((f) => f.id === farmId);

  useEffect(() => {
    if (farmId) {
      fetchPartnersByFarm(farmId);
    }
  }, [farmId, fetchPartnersByFarm]);

  useEffect(() => {
    if (selectedFarm?.ownershipType === 'partner' && activePartner && !isManualOverride) {
      const CATEGORY_TO_TERM_KEY = {
        fertilizer: 'khad_fertilizer',
        pesticide: 'keetnashak_pesticide',
        seeds: 'beej_seeds',
        electricity: 'bijli_electricity',
        irrigation: 'sinchai_irrigation',
        labour: 'majdoori_labour',
        machinery: 'tractor_machinery',
        diesel: 'diesel_fuel',
        transport: 'transport',
        market: 'mandi_charges',
        packaging: 'packaging',
        other: 'other',
        loan_interest: 'other',
        equipment_repair: 'other',
        crop_insurance: 'other'
      };

      let partnerPct = 0;
      if (activePartner.terms && activePartner.terms.expenseSharing) {
        const storeKey = CATEGORY_TO_TERM_KEY[category] || 'other';
        partnerPct = activePartner.terms.expenseSharing[storeKey] !== undefined 
          ? activePartner.terms.expenseSharing[storeKey] 
          : 0;
      } else {
        partnerPct = activePartner.sharePercent || 0;
      }

      const totalAmt = parseFloat(amount) || 0;
      const pShare = (totalAmt * partnerPct) / 100;
      const oShare = totalAmt - pShare;
      
      setPartnerShare(pShare ? pShare.toFixed(2) : '0.00');
      setOwnerShare(oShare ? oShare.toFixed(2) : '0.00');
    } else if (selectedFarm?.ownershipType !== 'partner') {
      setPartnerShare('0.00');
      setOwnerShare((parseFloat(amount) || 0).toFixed(2));
    }
  }, [amount, category, activePartner, selectedFarm, isManualOverride]);

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);

  // Load expense details if editing
  useEffect(() => {
    const loadExpense = async () => {
      if (!expenseId) return;
      try {
        const { getTransactionById } = await import('../../../../shared/services/transactionService.js');
        const expData = await getTransactionById(expenseId);
        if (expData) {
          setFarmId(expData.farmId || '');
          setCategory(expData.category || 'seeds');
          setAmount(expData.amount ? expData.amount.toString() : '');
          
          let expDate = expData.date;
          if (expDate?.toDate) {
            expDate = expDate.toDate();
          } else if (expDate?.seconds) {
            expDate = new Date(expDate.seconds * 1000);
          } else {
            expDate = new Date(expDate);
          }
          setDate(toLocalDateString(expDate));
          
          setNotes(expData.notes || '');
          setExpenseType(expData.expenseType || 'own');
          setPartnerId(expData.partnerId || '');
          
          if (expData.ownerShare !== undefined) setOwnerShare(expData.ownerShare.toString());
          if (expData.partnerShare !== undefined) setPartnerShare(expData.partnerShare.toString());
          
          if (expData.receiptURL) {
            setReceiptPreview(expData.receiptURL);
          }
          
          setIsManualOverride(true);
        }
      } catch (err) {
        console.error('Failed to load expense:', err);
        setError('Failed to load expense details');
      }
    };
    loadExpense();
  }, [expenseId]);

  // Set default farm
  useEffect(() => {
    if (farms.length > 0 && !farmId) {
      setFarmId(farms[0].id);
    }
  }, [farms, farmId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  // Prefill the form from the text of a receipt/bill. Works with pasted text and
  // with text produced by any future OCR step, so the form is filled either way.
  const handleReceiptPrefill = (e) => {
    e.preventDefault();
    const parsed = parseReceiptText(receiptText);
    if (!parsed.isValid) {
      setError(t('expense.receiptNoAmount') || 'Could not find an amount in that receipt text.');
      return;
    }
    setError('');
    setReceiptPrefill(parsed);
    if (parsed.amount) setAmount(String(parsed.amount));
    if (parsed.date) setDate(parsed.date);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.merchant) setNotes((prev) => (prev ? prev : parsed.merchant));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!farmId) {
      setError('Please select a farm');
      setLoading(false);
      return;
    }

    const expAmount = parseFloat(amount);
    if (isNaN(expAmount) || expAmount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (expenseType === 'partner' && selectedFarm?.ownershipType === 'partner' && !partnerId) {
      setError('Please select a partner');
      setLoading(false);
      return;
    }

    if (selectedFarm?.ownershipType === 'partner') {
      const oShare = parseFloat(ownerShare) || 0;
      const pShare = parseFloat(partnerShare) || 0;
      if (Math.abs((oShare + pShare) - expAmount) > 0.01) {
        setError(`Owner and Partner shares must equal the total amount (₹${expAmount})`);
        setLoading(false);
        return;
      }
    }

    try {
      let receiptURL = receiptPreview && receiptPreview.startsWith('http') ? receiptPreview : '';
      const expId = expenseId || Math.random().toString(36).substring(7); // temporary ID for path matching

      if (receiptFile) {
        const path = STORAGE_PATHS.receipts(profile.uid, farmId, expId);
        receiptURL = await uploadFile(receiptFile, path, (progress) => {
          setUploadProgress(progress);
        });
      }

      let txType = 'expense';
      let loanDirection = null;
      if (category === 'loan_interest') {
        txType = 'loan';
        loanDirection = 'owner_to_partner';
      }

      const txData = {
        farmId,
        ownerId: profile.uid,
        type: txType,
        loanDirection,
        category,
        amount: expAmount,
        expenseType: selectedFarm?.ownershipType === 'partner' ? 'partner' : 'own',
        partnerId: activePartner ? activePartner.id : '',
        ownerShare: selectedFarm?.ownershipType === 'partner' ? parseFloat(ownerShare) || 0 : expAmount,
        partnerShare: selectedFarm?.ownershipType === 'partner' ? parseFloat(partnerShare) || 0 : 0,
        date: parseLocalDateString(date) || new Date(),
        notes,
        receiptURL,
        season: selectedFarm?.cropSeason || 'year-round'
      };

      if (expenseId) {
        await editTransaction(expenseId, txData);
      } else {
        await createTransaction(txData);
      }
      navigate(`/farms/${farmId}`);
    } catch (err) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white hover:bg-stone-50 border border-stone-200/50 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('navigation.addExpense')}</h1>
          <p className="text-xs text-stone-400 font-medium">Record a new operational expense for your crop cycles.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Farm Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Select Farm *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <Sprout className="w-4.5 h-4.5" />
              </span>
              <select
                required
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  setPartnerId(''); // reset partner selection
                }}
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm bg-white cursor-pointer"
              >
                <option value="">-- Choose Farm --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.ownershipType === 'own' ? 'My Farm' : 'Partnership'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Date *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <Calendar className="w-4.5 h-4.5" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Expense Type Toggle */}
          {selectedFarm?.ownershipType === 'partner' && activePartner && (
            <div className="md:col-span-2 bg-stone-50 border border-stone-200/50 p-5 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-stone-900">Partnership Auto-Split (Batai)</h4>
                  <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                    Partner: <span className="text-primary font-bold">{activePartner.name}</span>
                    {activePartner.terms && ` (${activePartner.terms.templateName})`}
                  </p>
                </div>
                {isManualOverride && (
                  <button
                    type="button"
                    onClick={() => setIsManualOverride(false)}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Reset to template split
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Owner's share (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ownerShare}
                    onChange={(e) => {
                      setIsManualOverride(true);
                      const val = parseFloat(e.target.value) || 0;
                      setOwnerShare(e.target.value);
                      setPartnerShare((Math.max(0, (parseFloat(amount) || 0) - val)).toFixed(2));
                    }}
                    className="w-full px-3 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:outline-none font-bold text-ownExpense"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Partner's share (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={partnerShare}
                    onChange={(e) => {
                      setIsManualOverride(true);
                      const val = parseFloat(e.target.value) || 0;
                      setPartnerShare(e.target.value);
                      setOwnerShare((Math.max(0, (parseFloat(amount) || 0) - val)).toFixed(2));
                    }}
                    className="w-full px-3 py-2 text-xs border border-stone-200 bg-white rounded-lg focus:outline-none font-bold text-partnerExpense"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Expense Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-stone-500 font-extrabold text-lg">
                <IndianRupee className="w-5 h-5 mt-0.5" />
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 text-lg font-extrabold border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm text-stone-900"
              />
            </div>
          </div>

          {/* Categories select grid */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              Select Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const LucideIcon = Icons[cat.lucide] || Icons.HelpCircle;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary-light/30 text-primary-dark shadow-sm' 
                        : 'border-stone-200/50 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div 
                      className="p-2 rounded-xl mb-1.5"
                      style={{ 
                        backgroundColor: isSelected ? cat.color + '20' : '#f5f5f4',
                        color: isSelected ? cat.color : '#6B7280'
                      }}
                    >
                      <LucideIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight">
                      {t(cat.nameKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Note (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-stone-400">
                <FileText className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify seed type, machinery model, etc."
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          {/* Upload receipt */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Attach Receipt Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-50/50 border border-stone-200/50 p-4 rounded-2xl">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-file-input"
                />
                <label 
                  htmlFor="receipt-file-input"
                  className="flex items-center justify-center gap-2 border border-dashed border-stone-300 hover:border-primary bg-white py-3.5 px-4 rounded-xl text-xs font-bold text-stone-600 hover:text-primary transition cursor-pointer shadow-sm w-full text-center"
                >
                  <ImageIcon className="w-4 h-4" />
                  Choose Image
                </label>
              </div>

              {receiptPreview && (
                <div className="relative w-20 h-20 rounded-xl border border-stone-200 overflow-hidden shrink-0 shadow-sm animate-in zoom-in-95 duration-200">
                  <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white hover:bg-black rounded-md transition cursor-pointer"
                  >
                    <Icons.X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="mt-3 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Receipt prefill - paste the bill text to auto-fill amount, date and category */}
            <div className="mt-4 bg-stone-50/50 border border-stone-200/50 p-4 rounded-2xl">
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Auto-fill from Receipt Text
              </label>
              <textarea
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                rows={3}
                placeholder="Paste the text from your receipt / bill, e.g.&#10;Bijli Bill&#10;Amount Rs. 2450.00&#10;Date 04-11-2025"
                className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition shadow-sm font-mono"
              ></textarea>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleReceiptPrefill}
                  disabled={!receiptText.trim()}
                  className="px-4 py-2 text-xs font-bold border border-primary text-primary hover:bg-primary/5 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Auto-fill Details
                </button>
                {receiptPrefill?.isValid && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
                    {receiptPrefill.merchant ? `${receiptPrefill.merchant} - ` : ''}
                    {t('expense.receiptFilled') || 'Details filled in'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-1/2 py-3.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition cursor-pointer text-sm"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 py-3.5 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer text-sm"
          >
            {loading ? `Saving (${uploadProgress}%)` : 'Save Expense'}
          </button>
        </div>

      </form>

    </div>
  );
}
