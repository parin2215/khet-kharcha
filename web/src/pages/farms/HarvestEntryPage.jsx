import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { usePartnerLoanStore } from '../../store/usePartnerLoanStore.js';
import { 
  ArrowLeft, Scale, Calendar, IndianRupee, Save, 
  Share2, Award, ClipboardCheck, Info, Wheat, Scissors
} from 'lucide-react';
import { formatINR, toLocalDateString, parseLocalDateString } from '../../../../shared/utils/helpers.js';
import { FinancialEngine } from '../../../../shared/financial/FinancialEngine.js';
import Toast from '../../components/Toast.jsx';

export default function HarvestEntryPage() {
  const { t } = useTranslation();
  const { farmId } = useParams();
  const navigate = useNavigate();

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm } = useFarmStore();
  const { partners, fetchPartnersByFarm, createSettlement } = usePartnerStore();
  const { transactions, fetchTransactions, createTransaction } = useTransactionStore();

  // Harvest form states
  const [totalYield, setTotalYield] = useState('');
  const [yieldUnit, setYieldUnit] = useState('quintal'); // 'quintal' | 'kg' | 'ton'
  const [mandiRate, setMandiRate] = useState('');
  const [totalSaleAmount, setTotalSaleAmount] = useState('');
  const [harvestDeductions, setHarvestDeductions] = useState('');
  const [saleDate, setSaleDate] = useState(toLocalDateString());
  
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Load farm, expenses, and partners
  const { loans, fetchLoansByPartner, clearPendingLoans } = usePartnerLoanStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!selectedFarm) {
          const db = await import('../../../../shared/services/farmService.js');
          const farm = await db.getFarmById(farmId);
          if (farm) setSelectedFarm(farm);
        }
        await fetchPartnersByFarm(farmId);
        await fetchTransactions(profile.uid, { farmId });
      } catch (err) {
        console.error(err);
      }
    };
    if (farmId && profile?.uid) loadData();
  }, [farmId, selectedFarm, setSelectedFarm, fetchPartnersByFarm, fetchTransactions, profile]);

  // Get active partner
  const activePartner = partners.find(p => p.status === 'active') || partners[0];

  useEffect(() => {
    if (activePartner) {
      fetchLoansByPartner(activePartner.id);
    }
  }, [activePartner, fetchLoansByPartner]);

  // Auto-calculate sale amount from yield & rate
  useEffect(() => {
    const qty = parseFloat(totalYield) || 0;
    const rate = parseFloat(mandiRate) || 0;
    if (qty && rate) {
      setTotalSaleAmount((qty * rate).toString());
    }
  }, [totalYield, mandiRate]);

  const handleSaveHarvest = async (e) => {
    e.preventDefault();
    if (!totalYield || parseFloat(totalYield) <= 0) return;
    setLoading(true);

    try {
      const db = await import('../../../../shared/services/farmService.js');
      const harvestData = {
        totalYield: parseFloat(totalYield),
        yieldUnit,
        mandiRate: mandiRate ? parseFloat(mandiRate) : 0,
        totalSaleAmount: parseFloat(totalSaleAmount) || 0,
        harvestDeductions: parseFloat(harvestDeductions) || 0,
        saleDate: new Date(saleDate),
        recordedAt: new Date()
      };

      // Save harvest on farm object (legacy fallback)
      const currentHarvests = selectedFarm.harvests || [];
      currentHarvests.push(harvestData);
      
      await db.updateFarm(farmId, { 
        harvests: currentHarvests,
        currentCrop: '' // Reset crop since it has been harvested
      });

      // ALSO save as a crop_sale transaction for the Financial Engine
      await createTransaction({
        farmId,
        ownerId: profile.uid,
        type: 'crop_sale',
        category: 'crop_sale',
        amount: parseFloat(totalSaleAmount) || 0,
        totalYield: parseFloat(totalYield) || 0,
        yieldUnit,
        mandiRate: mandiRate ? parseFloat(mandiRate) : 0,
        date: parseLocalDateString(saleDate) || new Date(),
        notes: `Harvest of ${selectedFarm?.currentCrop || 'Crop'}`
      });

      // Update state in store
      setSelectedFarm({
        ...selectedFarm,
        harvests: currentHarvests,
        currentCrop: ''
      });

      setToastMsg('Harvest details saved successfully!');
      setToastType('success');
      
      // Navigate back
      setTimeout(() => {
        navigate(`/farms/${farmId}`);
      }, 1500);

    } catch (err) {
      setToastMsg(err.message || 'Failed to save harvest');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSettled = async () => {
    if (!activePartner) return;
    setLoading(true);

    try {
      // Create a virtual array of transactions including the current harvest to preview settlement
      const currentHarvestTx = {
        type: 'crop_sale',
        amount: parseFloat(totalSaleAmount) || 0,
        totalYield: parseFloat(totalYield) || 0
      };
      
      const combinedTxs = [...transactions, currentHarvestTx];
      const financials = FinancialEngine.calculate(combinedTxs, { partnerProfitSharePercent: activePartner.partnerSharePercent || 50 });

      // Log a settlement document
      // The settlement amount is the net settlement (partnerSettlement)
      await createSettlement({
        farmId,
        partnerId: activePartner.id,
        amount: Math.abs(financials.partnerSettlement),
        settledBy: profile.uid,
        note: `Harvest Final Settlement: ${totalYield} ${yieldUnit} of crop`,
        season: selectedFarm?.cropSeason || 'year-round'
      });

      // Clear any pending loans since they are settled now
      await clearPendingLoans(activePartner.id);

      // Update partner status to settled
      const pDb = await import('../../../../shared/services/partnerService.js');
      await pDb.updatePartner(activePartner.id, { status: 'settled' });

      setToastMsg('Account marked as settled!');
      setToastType('success');
      
      setTimeout(() => {
        navigate(`/farms/${farmId}`);
      }, 1500);

    } catch (err) {
      setToastMsg(err.message || 'Failed to settle accounts');
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!activePartner) return;
    const currentHarvestTx = {
      type: 'crop_sale',
      amount: parseFloat(totalSaleAmount) || 0,
      totalYield: parseFloat(totalYield) || 0
    };
    const combinedTxs = [...transactions, currentHarvestTx];
    const financials = FinancialEngine.calculate(combinedTxs, { partnerProfitSharePercent: activePartner.partnerSharePercent || 50 });

    const netText = financials.partnerSettlement > 0 
      ? `Owner owes Partner: ₹${financials.partnerSettlement.toLocaleString('en-IN')}`
      : `Partner owes Owner: ₹${Math.abs(financials.partnerSettlement).toLocaleString('en-IN')}`;

    const text = `🌾 *KHET KHARCHA - HARVEST REPORT* 🌾
-----------------------------------
*Farm Plot:* ${selectedFarm?.name}
*Partner:* ${activePartner.name}
*Crop Season:* ${selectedFarm?.cropSeason?.toUpperCase()}
-----------------------------------
*Net Crop Valuation:* ₹${financials.cropIncome.toLocaleString('en-IN')}
*Shared Farm Expenses:* ₹${financials.sharedExpenses.toLocaleString('en-IN')}
*Remaining Profit:* ₹${financials.netProfit.toLocaleString('en-IN')}
-----------------------------------
*Partner's Profit Share:* ₹${financials.partnerIncomeShare.toLocaleString('en-IN')}
*Partner's Net Loan Liability:* ₹${financials.lentMoney.netPartnerLiability.toLocaleString('en-IN')}
-----------------------------------
*NET FINAL ACCOUNT:*
${netText}
-----------------------------------
_Generated via Khet Kharcha App_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const season = selectedFarm?.cropSeason || 'year-round';

  const currentHarvestTx = {
    type: 'crop_sale',
    amount: parseFloat(totalSaleAmount) || 0,
    totalYield: parseFloat(totalYield) || 0
  };
  const settlement = activePartner 
    ? FinancialEngine.calculate([...transactions, currentHarvestTx], { partnerProfitSharePercent: activePartner.partnerSharePercent || 50 })
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/farms/${farmId}`)}
          className="p-2 bg-white hover:bg-stone-50 border border-stone-200/50 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900">Fasal Aai (Record Harvest)</h1>
          <p className="text-xs text-stone-400 font-medium">Record the total harvest yields and mandi sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Form Card */}
        <form onSubmit={handleSaveHarvest} className="bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-stone-950 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-primary" />
            Harvest Entry Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Total Yield *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-stone-400">
                  <Scale className="w-4.5 h-4.5" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={totalYield}
                  onChange={(e) => setTotalYield(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm"
                />
              </div>

              <select
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                className="w-28 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none bg-white cursor-pointer"
              >
                <option value="quintal">Quintal</option>
                <option value="kg">KG</option>
                <option value="ton">Ton</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Mandi Rate (₹ per {yieldUnit} — optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400 text-sm font-bold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={mandiRate}
                onChange={(e) => setMandiRate(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full pl-8 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Total Sale Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <IndianRupee className="w-4.5 h-4.5" />
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalSaleAmount}
                onChange={(e) => setTotalSaleAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm font-extrabold text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Any Cuts / Deductions (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <Scissors className="w-4.5 h-4.5" />
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={harvestDeductions}
                onChange={(e) => setHarvestDeductions(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm font-extrabold text-stone-900"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5 ml-1">
              Labor charges, transport, or any expenses subtracted from the total sale amount before splitting.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Sale Date
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-stone-400">
                <Calendar className="w-4.5 h-4.5" />
              </span>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-stone-100 pt-5">
            <button
              type="button"
              onClick={() => navigate(`/farms/${farmId}`)}
              className="w-1/2 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !totalYield}
              className="w-1/2 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition cursor-pointer text-xs flex justify-center items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Harvest'}
            </button>
          </div>
        </form>

        {/* Computations Settlement Card */}
        {activePartner && settlement && (
          <div className="bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-stone-950 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              SEASON FINAL ACCOUNT
            </h3>

            <div className="border border-stone-300 rounded-xl bg-stone-50 overflow-hidden font-mono text-xs shadow-inner">
              <div className="bg-stone-800 text-white p-3 text-center">
                <h4 className="font-extrabold text-[11px] uppercase tracking-wider">{activePartner.name}</h4>
                <p className="text-[9px] text-stone-400 font-semibold mt-0.5">{selectedFarm?.name} · {season.toUpperCase()}</p>
              </div>

              <div className="p-4 space-y-4">
                {/* SETTLEMENT CALCULATION (PROFIT BASED) */}
                <div>
                  <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2 border-b border-stone-200 pb-1">Settlement Calculation</h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-stone-500">
                      <span>Net Crop Sale Amount :</span>
                      <span className="font-bold text-stone-700">₹{settlement.cropIncome.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Total Shared Expenses :</span>
                      <span className="font-bold text-red-650">-₹{settlement.sharedExpenses.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-stone-700 font-bold border-t border-stone-200 border-dashed pt-1 mt-1">
                      <span>Remaining Profit :</span>
                      <span className="text-emerald-600">₹{settlement.netProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* FINAL SHARE */}
                <div className="mt-4">
                  <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2 border-b border-stone-200 pb-1">Partner's Final Share</h5>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-stone-500">
                      <span>Partner's Profit Share :</span>
                      <span className="font-bold text-stone-700">₹{settlement.partnerIncomeShare.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {settlement.lentMoney.netPartnerLiability !== 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>Net Partner Loan Liability :</span>
                        <span className="font-bold text-red-650">
                          {settlement.lentMoney.netPartnerLiability > 0 ? '-' : '+'}₹{Math.abs(settlement.lentMoney.netPartnerLiability).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col items-center justify-center p-3 bg-white border border-stone-200 rounded-lg text-center shadow-sm">
                  {settlement.partnerSettlement > 0 ? (
                    <>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Partner Receives</span>
                      <span className="text-xl font-black text-emerald-600 mt-1 block">
                        ₹{settlement.partnerSettlement.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-500 font-bold block mt-1 leading-snug">
                        OR {Math.round((parseFloat(totalYield) || 0) * (activePartner.partnerSharePercent || 50) / 100)} {yieldUnit} crop
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Partner Owes Owner</span>
                      <span className="text-xl font-black text-red-500 mt-1 block">
                        ₹{Math.abs(settlement.partnerSettlement).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-500 font-bold block mt-1 leading-snug">
                        Outstanding expense share due
                      </span>
                    </>
                  )}
                </div>

                {/* ITEMISED EXPENSES */}
                <div className="mt-4 border-t border-stone-200 pt-3">
                  <h5 className="text-[10px] font-bold text-stone-400 uppercase mb-2">Itemized Expenses</h5>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                    {transactions.filter(t => t.type === 'expense').length > 0 ? transactions.filter(t => t.type === 'expense').map(exp => (
                      <div key={exp.id} className="flex justify-between text-[10px] border-b border-stone-200/50 pb-1.5">
                        <span className="text-stone-500 capitalize">
                          {new Date(exp.date?.seconds ? exp.date.seconds * 1000 : exp.date).toLocaleDateString('en-IN')} - {exp.category}
                        </span>
                        <span className="font-bold text-stone-700">₹{exp.amount}</span>
                      </div>
                    )) : (
                      <span className="text-[10px] text-stone-400">No expenses recorded.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition duration-200 cursor-pointer shadow"
              >
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </button>

              <button
                type="button"
                onClick={handleMarkSettled}
                disabled={loading || !totalYield}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-extrabold rounded-xl text-xs transition duration-200 cursor-pointer shadow"
              >
                <Award className="w-4 h-4" />
                {loading ? 'Settle in progress...' : 'Mark as settled'}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
