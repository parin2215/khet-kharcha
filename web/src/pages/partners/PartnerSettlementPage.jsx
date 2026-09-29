import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { usePartnerLoanStore } from '../../store/usePartnerLoanStore.js';
import { Users, ArrowLeft, Plus, DollarSign, FileText, CheckCircle2, History, Banknote } from 'lucide-react';
import { formatINR, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import { FinancialEngine } from '../../../../shared/financial/FinancialEngine.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';

export default function PartnerSettlementPage() {
  const { t } = useTranslation();
  const { farmId } = useParams();
  const navigate = useNavigate();

  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm } = useFarmStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { partners, settlements, fetchPartnersByFarm, fetchSettlements, createSettlement } = usePartnerStore();
  const { createTransaction } = useTransactionStore();
  const { loans, fetchLoansByPartner } = usePartnerLoanStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Settle form states
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  
  // Loan form states
  const [loanType, setLoanType] = useState('owner_to_partner');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanNote, setLoanNote] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const db = await import('../../../../shared/services/farmService.js');
        const farm = await db.getFarmById(farmId);
        if (farm) {
          setSelectedFarm(farm);
          fetchTransactions(profile.uid, { farmId });
          fetchPartnersByFarm(farmId);
          fetchSettlements(farmId);
        } else {
          navigate('/farms');
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (profile?.uid && farmId) {
      loadFarm();
    }
  }, [farmId, profile, setSelectedFarm, fetchTransactions, fetchPartnersByFarm, fetchSettlements, navigate]);

  // Set default partner & fetch their loans
  useEffect(() => {
    if (partners.length > 0 && !selectedPartner) {
      setSelectedPartner(partners[0]);
    }
  }, [partners, selectedPartner]);

  useEffect(() => {
    if (selectedPartner) {
      fetchLoansByPartner(selectedPartner.id);
    }
  }, [selectedPartner, fetchLoansByPartner]);

  const handleOpenSettle = (partner) => {
    setSelectedPartner(partner);
    const financials = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: partner.terms?.cropSharePercent || partner.sharePercent || 50 });
    const balanceDue = financials.partnerSettlement; // negative means partner owes owner, positive means owner owes partner
    setSettleAmount(Math.abs(balanceDue) > 0 ? Math.abs(balanceDue) : '');
    setIsModalOpen(true);
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!selectedPartner || !settleAmount) return;
    setFormLoading(true);

    try {
      await createSettlement({
        farmId,
        partnerId: selectedPartner.id,
        amount: parseFloat(settleAmount),
        settledBy: profile.uid,
        note: settleNote,
        season: selectedFarm?.cropSeason || 'year-round'
      });


      setToastMsg('Settlement logged successfully!');
      setToastType('success');
      setIsModalOpen(false);
      setSettleAmount('');
      setSettleNote('');
    } catch (err) {
      setToastMsg(err.message || 'Error saving payment');
      setToastType('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRecordLoan = async (e) => {
    e.preventDefault();
    if (!selectedPartner || !loanAmount) return;
    setFormLoading(true);

    try {
      await createTransaction({
        farmId,
        ownerId: profile.uid,
        type: 'loan',
        loanDirection: loanType, // 'owner_to_partner' or 'partner_to_owner'
        amount: parseFloat(loanAmount),
        category: 'loan_interest',
        expenseType: 'partner',
        ownerShare: loanType === 'partner_to_owner' ? parseFloat(loanAmount) : 0,
        partnerShare: loanType === 'owner_to_partner' ? parseFloat(loanAmount) : 0,
        partnerId: selectedPartner.id,
        partnerName: selectedPartner.name,
        notes: loanNote,
        date: toLocalDateString(),
        season: selectedFarm?.cropSeason || 'year-round'
      });

      fetchTransactions(profile.uid, { farmId });
      setToastMsg('Loan/Advance recorded successfully!');
      setToastType('success');
      setIsLoanModalOpen(false);
      setLoanAmount('');
      setLoanNote('');
    } catch (err) {
      setToastMsg(err.message || 'Error saving loan');
      setToastType('error');
    } finally {
      setFormLoading(false);
    }
  };

  if (!selectedFarm) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-xl font-bold text-stone-900">Partner Settlement Ledger</h1>
          <p className="text-xs text-stone-400 font-medium">Plot: {selectedFarm.name} ({selectedFarm.cropSeason})</p>
        </div>
      </div>

      {/* Partners List grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Partners balance list */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <Users className="w-4.5 h-4.5 text-primary" />
            Partner Shares & Balance due
          </h3>

          {partners.map((partner) => {
            const financials = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: partner.terms?.cropSharePercent || partner.sharePercent || 50 });
            
            // To match the UI: balance > 0 means owed to owner, balance < 0 means owner owes partner
            const uiBalance = -(financials.partnerSettlement);
            
            const split = {
              due: financials.partnerShareExpense,
              paid: financials.lentMoney.netPartnerLiability < 0 ? Math.abs(financials.lentMoney.netPartnerLiability) : 0,
              balance: uiBalance
            };

            return (
              <div 
                key={partner.id}
                className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-stone-900">{partner.name}</h4>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">{partner.phone}</p>
                  </div>
                  <span className="bg-primary-light text-primary font-bold text-xs px-2 py-0.5 rounded-lg">
                    Share: {partner.terms?.cropSharePercent !== undefined ? partner.terms.cropSharePercent : partner.sharePercent}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-stone-100 py-3 text-xs">
                  <div>
                    <p className="text-stone-400 font-medium mb-1">Total Due</p>
                    <AmountDisplay amount={split.due} className="font-bold text-stone-700" />
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-1">Paid</p>
                    <AmountDisplay amount={split.paid} className="font-bold text-stone-700" />
                  </div>
                  <div>
                    <p className="text-stone-400 font-medium mb-1">Outstanding</p>
                    <AmountDisplay amount={Math.abs(split.balance)} className={`font-extrabold ${split.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                </div>

                {split.balance !== 0 && (
                  <button
                    onClick={() => handleOpenSettle(partner)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-primary text-primary hover:bg-primary-light/35 rounded-xl text-xs font-bold transition cursor-pointer mb-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Record Settlement Payment
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedPartner(partner);
                    setIsLoanModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Banknote className="w-4 h-4" />
                  Record Loan / Advance
                </button>
              </div>
            );
          })}
        </div>

        {/* Pending Loans Section */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-stone-400" />
            Pending Loans & Advances
          </h3>

          {transactions.filter(t => t.type === 'loan' && t.partnerId === selectedPartner?.id).length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {transactions.filter(t => t.type === 'loan' && t.partnerId === selectedPartner?.id).map((loan) => (
                <div key={loan.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {loan.loanDirection === 'owner_to_partner' ? 'Owner lent to Partner' : 'Partner lent to Owner'}
                    </p>
                    <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                      {formatDate(loan.date || loan.createdAt)}
                    </p>
                    {loan.notes && (
                      <p className="text-[10px] text-stone-500 italic mt-1 truncate">
                        "{loan.notes}"
                      </p>
                    )}
                  </div>
                  <AmountDisplay amount={loan.amount} className={`text-xs font-extrabold shrink-0 ${loan.loanDirection === 'owner_to_partner' ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-stone-400 font-semibold">
              No pending loans for this partner.
            </div>
          )}
        </div>

        {/* History log */}
        <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2.5 flex items-center gap-1.5">
            <History className="w-4 h-4 text-stone-400" />
            Settlement Log History
          </h3>

          {settlements.length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {settlements.map((log) => {
                const partner = partners.find(p => p.id === log.partnerId);
                return (
                  <div key={log.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {partner?.name || 'Partner'}
                      </p>
                      <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                        {formatDate(log.settledAt)}
                      </p>
                      {log.note && (
                        <p className="text-[10px] text-stone-500 italic mt-1 truncate">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                    <AmountDisplay amount={log.amount} className="text-xs font-extrabold text-emerald-600 shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-stone-400 font-semibold">
              No settlements logged.
            </div>
          )}
        </div>

      </div>

      {/* Record Payment Modal */}
      {selectedPartner && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Settle Share with ${selectedPartner.name}`}
        >
          <form onSubmit={handleRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Settlement Amount *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Note / Description
              </label>
              <input
                type="text"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
                placeholder="e.g. Cash payment received"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading || !settleAmount}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
            >
              {formLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </Modal>
      )}

      {/* Record Loan Modal */}
      {selectedPartner && (
        <Modal
          isOpen={isLoanModalOpen}
          onClose={() => setIsLoanModalOpen(false)}
          title={`Record Loan for ${selectedPartner.name}`}
        >
          <form onSubmit={handleRecordLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Type of Loan *
              </label>
              <select
                required
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="owner_to_partner">Owner lent money to Partner</option>
                <option value="partner_to_owner">Partner lent money to Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm font-extrabold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Note / Description
              </label>
              <input
                type="text"
                value={loanNote}
                onChange={(e) => setLoanNote(e.target.value)}
                placeholder="e.g. For personal expense"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading || !loanAmount}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
            >
              {formLoading ? 'Recording...' : 'Record Loan'}
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}
