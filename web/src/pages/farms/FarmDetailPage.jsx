import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useTransactionStore } from '../../store/useTransactionStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { 
  Sprout, 
  MapPin, 
  Scale, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit,
  ChevronRight, 
  Users,
  Settings,
  DollarSign,
  FileText,
  Clock,
  ArrowLeft,
  UserCheck,
  Wheat,
  Coins
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { formatINR, formatDate, toLocalDateString } from '../../../../shared/utils/helpers.js';
import { FinancialEngine } from '../../../../shared/financial/FinancialEngine.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';
import SeasonBadge from '../../components/SeasonBadge.jsx';
import OwnershipBadge from '../../components/OwnershipBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';
import { getCategoryById } from '../../../../shared/constants/categories.js';

export default function FarmDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { profile } = useAuthStore();
  const { selectedFarm, setSelectedFarm, removeFarm, editFarm } = useFarmStore();
  const { transactions, fetchTransactions, removeTransaction, createTransaction, loading: expLoading } = useTransactionStore();
  const { partners, settlements, fetchPartnersByFarm, fetchSettlements, createSettlement } = usePartnerStore();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'partners' | 'settings' | 'lease_details' | 'lease_payments'
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  
  // Settlement form states
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);

  // Lend Money form states
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [lendAmount, setLendAmount] = useState('');
  const [lendNote, setLendNote] = useState('');
  const [lendLoading, setLendLoading] = useState(false);

  // Add partner to own farm states
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerShare, setPartnerShare] = useState('');
  const [addPartnerLoading, setAddPartnerLoading] = useState(false);

  // Load Farm details
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await import('../../../../shared/services/farmService.js');
        const farm = await db.getFarmById(id);
        if (farm) {
          setSelectedFarm(farm);
          fetchTransactions(profile.uid, { farmId: id });
          if (farm.ownershipType === 'partner' || farm.ownershipType === 'leased') {
            fetchPartnersByFarm(id);
            fetchSettlements(id);
          }
        } else {
          setToastMsg('Farm not found');
          setToastType('error');
          navigate('/farms');
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (profile?.uid && id) {
      loadData();
    }
  }, [id, profile, setSelectedFarm, fetchTransactions, fetchPartnersByFarm, fetchSettlements, navigate]);

  // Set default tab for leased farm
  useEffect(() => {
    if (selectedFarm?.ownershipType === 'leased' && activeTab === 'expenses') {
      setActiveTab('lease_details');
    }
  }, [selectedFarm?.ownershipType]);

  const handleDeleteFarm = async () => {
    if (window.confirm('Are you sure you want to delete this farm plot? All records will be removed.')) {
      try {
        await removeFarm(id);
        navigate('/farms');
      } catch (err) {
        setToastMsg('Failed to delete farm');
        setToastType('error');
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await removeTransaction(expenseId);
        setToastMsg('Expense deleted successfully');
        setToastType('success');
      } catch (err) {
        setToastMsg('Failed to delete expense');
        setToastType('error');
      }
    }
  };

  const handleAddPartnerToOwnFarm = async (e) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerPhone.trim() || !partnerShare) return;
    
    setAddPartnerLoading(true);
    try {
      const shareVal = parseFloat(partnerShare) || 50;
      const formattedPhone = partnerPhone.startsWith('+91') ? partnerPhone : `+91${partnerPhone}`;
      
      const pObj = {
        name: partnerName,
        phone: formattedPhone,
        sharePercent: shareVal,
        totalOwed: 0,
        totalPaid: 0
      };
      
      const pDb = await import('../../../../shared/services/partnerService.js');
      
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

      const newPartnerId = await pDb.addPartner({
        farmId: id,
        ownerId: profile.uid,
        name: partnerName,
        phone: formattedPhone,
        season: selectedFarm.cropSeason || 'kharif',
        startDate: new Date(),
        status: 'active',
        totalOwed: 0,
        totalPaid: 0,
        terms
      });

      pObj.partnerId = newPartnerId;
      await editFarm(id, {
        ownershipType: 'partner',
        partners: [pObj]
      });

      const updatedFarm = { ...selectedFarm, ownershipType: 'partner', partners: [pObj] };
      setSelectedFarm(updatedFarm);
      fetchPartnersByFarm(id);
      fetchSettlements(id);
      
      setToastMsg('Partner added & farm plot converted to Partnership!');
      setToastType('success');
      
      setPartnerName('');
      setPartnerPhone('');
      setPartnerShare('');
      
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to add partner: ' + err.message);
      setToastType('error');
    } finally {
      setAddPartnerLoading(false);
    }
  };

  const handleOpenSettlement = (partner) => {
    setSelectedPartner(partner);
    
    // Auto-calculate the remaining balance due using FinancialEngine
    const financials = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: partner.terms?.cropSharePercent || partner.sharePercent || 50 });
    const balanceDue = financials.partnerSettlement; // negative means partner owes owner, positive means owner owes partner
    // For payment recording, if balanceDue > 0, owner is paying partner.
    setSettleAmount(Math.abs(balanceDue) > 0 ? Math.abs(balanceDue) : '');
    setIsSettlementModalOpen(true);
  };

  const handleSaveSettlement = async (e) => {
    e.preventDefault();
    if (!settleAmount || parseFloat(settleAmount) <= 0) return;
    setSettleLoading(true);

    try {
      await createSettlement({
        farmId: id,
        partnerId: selectedPartner.id,
        amount: parseFloat(settleAmount),
        settledBy: profile.uid,
        note: settleNote,
        season: selectedFarm?.cropSeason || 'year-round'
      });
      
      setToastMsg('Settlement recorded successfully!');
      setToastType('success');
      setIsSettlementModalOpen(false);
      setSettleAmount('');
      setSettleNote('');
    } catch (err) {
      setToastMsg(err.message || 'Failed to save settlement');
      setToastType('error');
    } finally {
      setSettleLoading(false);
    }
  };

  const handleOpenLend = (partner) => {
    setSelectedPartner(partner);
    setLendAmount('');
    setLendNote('');
    setIsLendModalOpen(true);
  };

  const handleSaveLend = async (e) => {
    e.preventDefault();
    if (!selectedPartner || !lendAmount) return;
    const amountVal = parseFloat(lendAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setToastMsg('Please enter a valid lending amount');
      setToastType('error');
      return;
    }

    setLendLoading(true);
    try {
      await createTransaction({
        farmId: id,
        ownerId: profile.uid,
        type: 'loan',
        loanDirection: 'owner_to_partner',
        amount: amountVal,
        category: 'loan_interest',
        expenseType: 'partner',
        ownerShare: 0,
        partnerShare: amountVal,
        partnerId: selectedPartner.id,
        partnerName: selectedPartner.name,
        notes: lendNote || `Lended money to ${selectedPartner.name}`,
        date: toLocalDateString(),
        season: selectedFarm?.cropSeason || 'year-round'
      });

      // Refresh transactions and partners
      fetchTransactions(profile.uid, { farmId: id });
      fetchPartnersByFarm(id);
      fetchSettlements(id);

      setToastMsg('Loan recorded successfully! Opening SMS...');
      setToastType('success');
      setIsLendModalOpen(false);
      setLendAmount('');
      setLendNote('');

      // Open SMS link
      const message = `Khet Kharcha: Lent money ₹${amountVal} to you for farm ${selectedFarm.name}. This will be payback in farming partnership profit.`;
      const smsUrl = `sms:${selectedPartner.phone}?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
    } catch (err) {
      setToastMsg(err.message || 'Failed to save loan');
      setToastType('error');
    } finally {
      setLendLoading(false);
    }
  };


  if (!selectedFarm) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-20" />
        <LoadingSkeleton height="h-44" />
      </div>
    );
  }

  const financials = FinancialEngine.calculate(transactions);

  // Chart Data: Own vs Partner expenses
  const shareChartData = [
    { name: 'My Share', value: financials.ownerShareExpense, color: '#16a34a' },
    { name: 'Partners Share', value: financials.partnerShareExpense, color: '#d97706' }
  ].filter(c => c.value > 0);

  // Expenses columns config
  const expenseColumns = [
    { 
      key: 'date', 
      label: 'Date', 
      sortable: true,
      render: (row) => formatDate(row.date)
    },
    { 
      key: 'category', 
      label: 'Category', 
      sortable: true,
      render: (row) => {
        const cat = getCategoryById(row.category);
        return cat?.nameKey ? t(cat.nameKey) : row.category;
      }
    },
    { 
      key: 'expenseType', 
      label: 'Split Type',
      render: (row) => <OwnershipBadge type={row.expenseType} />
    },
    {
      key: 'notes',
      label: 'Notes'
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (row) => <AmountDisplay amount={row.amount} className="font-bold text-stone-900" />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => navigate(`/expenses/${row.id}/edit`)}
            className="p-1 border border-stone-200 hover:border-primary hover:text-primary rounded text-stone-500 transition cursor-pointer"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteExpense(row.id)}
            className="p-1 border border-stone-200 hover:border-red-500 hover:text-red-500 rounded text-stone-500 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notifications */}
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header Info Banner */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">{selectedFarm.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5 text-xs text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedFarm.location || 'India'}
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                {selectedFarm.size} {t(`unit.${selectedFarm.sizeUnit || 'bigha'}`)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Crop: {selectedFarm.currentCrop || 'None'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {selectedFarm.ownershipType === 'partner' && (
            <button
              onClick={() => navigate(`/farms/${id}/harvest`)}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition cursor-pointer"
            >
              <Wheat className="w-4 h-4" />
              Record Harvest
            </button>
          )}
          <SeasonBadge seasonId={selectedFarm.cropSeason} />
          <OwnershipBadge type={selectedFarm.ownershipType} />
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-stone-200/50">
        {selectedFarm.ownershipType === 'leased' ? (
          <>
            <button
              onClick={() => setActiveTab('lease_details')}
              className={`py-3 px-6 font-bold text-sm transition ${
                activeTab === 'lease_details' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Lease Details
            </button>
            <button
              onClick={() => setActiveTab('lease_payments')}
              className={`py-3 px-6 font-bold text-sm transition ${
                activeTab === 'lease_payments' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-6 font-bold text-sm transition ${
                activeTab === 'expenses' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Expenses ({transactions.filter(t => t.type === 'expense').length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-6 font-bold text-sm transition ${
                activeTab === 'expenses' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Expenses ({transactions.filter(t => t.type === 'expense').length})
            </button>
            <button
              onClick={() => setActiveTab('harvests')}
              className={`py-3 px-6 font-bold text-sm transition ${
                activeTab === 'harvests' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              Harvests ({selectedFarm.harvests?.length || 0})
            </button>
          </>
        )}
        
        {selectedFarm.ownershipType === 'partner' && (
          <button
            onClick={() => setActiveTab('partners')}
            className={`py-3 px-6 font-bold text-sm transition ${
              activeTab === 'partners' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Partner Share Split
          </button>
        )}
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-6 font-bold text-sm transition ${
            activeTab === 'settings' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Plot Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'lease_details' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">Lease Agreement</h3>
            {(() => {
              const lessee = partners.find(p => p.terms?.systemType === 'lease');
              if (!lessee) return <EmptyState message="No lease agreement found." />;
              return (
                <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Lessee</span>
                      <span className="font-bold text-stone-900">{lessee.name}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Phone</span>
                      <span className="font-bold text-stone-900">{lessee.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Lease Amount</span>
                      <span className="font-extrabold text-purple-600">₹{lessee.terms.leaseAmount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Start Date</span>
                      <span className="font-bold text-stone-900">{formatDate(lessee.terms.startDate)}</span>
                    </div>
                    {lessee.terms.endDate && (
                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase">End Date</span>
                        <span className="font-bold text-stone-900">{formatDate(lessee.terms.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'lease_payments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Lease Payments</h3>
              {(() => {
                const lessee = partners.find(p => p.terms?.systemType === 'lease');
                if (!lessee) return null;
                return (
                  <button
                    onClick={() => handleOpenSettlement(lessee)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Payment
                  </button>
                );
              })()}
            </div>
            
            {(() => {
              const lessee = partners.find(p => p.terms?.systemType === 'lease');
              if (!lessee) return <EmptyState message="No lease agreement found." />;
              
              const totalAmount = lessee.terms.leaseAmount || 0;
              const paidAmount = lessee.totalPaid || 0;
              const balance = totalAmount - paidAmount;
              
              return (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-stone-200/50 rounded-xl p-4 shadow-sm">
                      <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Total Lease</span>
                      <span className="font-extrabold text-stone-900 text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white border border-stone-200/50 rounded-xl p-4 shadow-sm">
                      <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Received</span>
                      <span className="font-extrabold text-emerald-600 text-lg">₹{paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white border border-stone-200/50 rounded-xl p-4 shadow-sm">
                      <span className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Pending</span>
                      <span className={`font-extrabold text-lg ${balance > 0 ? 'text-red-500' : 'text-stone-400'}`}>₹{balance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">Payment History</h4>
                  {settlements.filter(s => s.partnerId === lessee.id).length === 0 ? (
                     <div className="text-center py-4 text-xs text-stone-500">No payments recorded yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {settlements.filter(s => s.partnerId === lessee.id).map(s => (
                        <div key={s.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-stone-100 rounded-xl p-3.5 shadow-sm gap-2">
                          <div>
                            <span className="font-extrabold text-stone-900 block text-base">₹{s.amount?.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-bold text-stone-400">{formatDate(s.settledAt)}</span>
                          </div>
                          {s.note && <span className="text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">{s.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Table */}
            <div className="lg:col-span-2">
              <DataTable
                columns={expenseColumns}
                data={transactions.filter(t => t.type === 'expense')}
                emptyMessage="No expenses recorded for this farm yet."
              />
            </div>

            {/* Split statistics */}
            <div className="space-y-6">
              
              {/* Summary card */}
              <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">
                  Farm Totals
                </h3>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400 font-medium">Total Cost</span>
                  <AmountDisplay amount={financials.totalExpenses} className="font-extrabold text-stone-900" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400 font-medium">My Share Cost</span>
                  <AmountDisplay amount={financials.ownerShareExpense} className="font-bold text-ownExpense" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400 font-medium">Partner Cost</span>
                  <AmountDisplay amount={financials.partnerShareExpense} className="font-bold text-partnerExpense" />
                </div>
              </div>

              {/* Pie Chart */}
              {shareChartData.length > 0 && (
                <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex flex-col items-center">
                  <h3 className="text-sm font-bold text-stone-900 mb-4 self-start">Cost Split Ratio</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={shareChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {shareChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            </div>

          </div>
        )}

        {activeTab === 'harvests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Recorded Harvests</h3>
              <button
                onClick={() => navigate(`/farms/${id}/harvest`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition duration-200 cursor-pointer shadow-sm"
              >
                <Wheat className="w-3.5 h-3.5" />
                Record Harvest
              </button>
            </div>
            
            {(!selectedFarm.harvests || selectedFarm.harvests.length === 0) ? (
              <EmptyState
                icon="Wheat"
                message="No harvests recorded for this farm yet."
                btnLabel="Record Harvest"
                onBtnPress={() => navigate(`/farms/${id}/harvest`)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFarm.harvests.map((harvest, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-stone-400 uppercase">{harvest.season}</span>
                        <span className="text-xs text-stone-500 font-medium">
                          {new Date(harvest.date?.seconds ? harvest.date.seconds * 1000 : harvest.date).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-stone-900 text-lg mb-1">{harvest.totalYield} {harvest.yieldUnit || 'quintal'}</h4>
                      <div className="space-y-1 mt-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Mandi Rate:</span>
                          <span className="font-bold text-stone-800">₹{harvest.mandiRate || 0}/{harvest.yieldUnit || 'quintal'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Deductions:</span>
                          <span className="font-bold text-red-500">-₹{harvest.harvestDeductions || 0}</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-stone-200 pt-1 mt-1">
                          <span className="text-stone-600 font-medium">Total Sale Value:</span>
                          <span className="font-extrabold text-emerald-600">₹{harvest.totalSaleAmount?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Partners List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-stone-900">Partner Settlements</h3>
                <button
                  onClick={() => navigate(`/farms/${id}/partners/new`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-xs transition duration-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Partner
                </button>
              </div>
              
              {partners.length === 0 ? (
                <EmptyState
                  message="No partners added to this Bataidari plot."
                  btnLabel="Add Partner"
                  onBtnPress={() => navigate(`/farms/${id}/partners/new`)}
                />
              ) : (
                partners.map((partner) => {
                  const financials = FinancialEngine.calculate(transactions, { partnerProfitSharePercent: partner.terms?.cropSharePercent || partner.sharePercent || 50 });
                  
                  // Compute balance to mirror old structure for the UI
                  // balance > 0 means partner owes owner, balance < 0 means owner owes partner
                  // Wait, financials.partnerSettlement is positive if partner gets money (owner owes partner), negative if partner owes owner.
                  // Old `balance > 0` meant 'owed' (partner owes owner)
                  const uiBalance = -(financials.partnerSettlement);
                  
                  const settlement = {
                    due: financials.partnerShareExpense,
                    paid: financials.lentMoney.netPartnerLiability < 0 ? Math.abs(financials.lentMoney.netPartnerLiability) : 0, // Roughly maps to paid
                    balance: uiBalance,
                    status: uiBalance > 0 ? 'owed' : (uiBalance < 0 ? 'overpaid' : 'settled')
                  };
                  
                  return (
                    <div 
                      key={partner.id}
                      className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-stone-900 flex items-center gap-2">
                            {partner.name}
                            {partner.terms && (
                              <span className="text-[9px] bg-primary-light text-primary font-bold px-1.5 py-0.5 rounded uppercase">
                                {partner.terms.systemType}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-stone-400 font-medium mt-0.5">{partner.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-primary-light text-primary font-extrabold text-xs px-2.5 py-1 rounded-lg">
                            Share: {partner.terms?.cropSharePercent !== undefined ? partner.terms.cropSharePercent : partner.sharePercent}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-b border-stone-100 py-3 text-xs">
                        <div>
                          <p className="text-stone-400 font-medium mb-1">Calculated Share</p>
                          <AmountDisplay amount={settlement.due} className="font-bold text-stone-800" />
                        </div>
                        <div>
                          <p className="text-stone-400 font-medium mb-1">Paid Already</p>
                          <AmountDisplay amount={settlement.paid} className="font-bold text-stone-800" />
                        </div>
                        <div>
                          <p className="text-stone-400 font-medium mb-1">Outstanding Balance</p>
                          <AmountDisplay 
                            amount={Math.abs(settlement.balance)} 
                            className={`font-extrabold ${settlement.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className={`text-xs font-bold uppercase ${
                          settlement.status === 'owed' 
                            ? 'text-red-500' 
                            : settlement.status === 'overpaid' 
                              ? 'text-emerald-600' 
                              : 'text-stone-400'
                        }`}>
                          {settlement.status === 'owed' 
                            ? 'Owes You Money' 
                            : settlement.status === 'overpaid' 
                              ? 'Overpaid / Owed by You' 
                              : 'All Settled'}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsTermsModalOpen(true);
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-stone-800 transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            View Terms
                          </button>
                          
                          <button
                            onClick={() => handleOpenLend(partner)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-650 hover:text-amber-750 transition cursor-pointer"
                          >
                            <Coins className="w-4 h-4" />
                            Lend Money
                          </button>

                          {settlement.balance !== 0 && (
                            <button
                              onClick={() => handleOpenSettlement(partner)}
                              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                              Record Payment
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Settlements History */}
            <div className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2.5">
                Settlement Log
              </h3>

              {settlements.length > 0 ? (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
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
                  No settlements recorded.
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md bg-white border border-stone-200/50 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-base font-bold text-stone-900">Manage Farm Plot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Update Crop Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedFarm.currentCrop}
                  placeholder="e.g. Cotton"
                  onBlur={(e) => editFarm(id, { currentCrop: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Crop Season
                </label>
                <select
                  defaultValue={selectedFarm.cropSeason}
                  onChange={(e) => editFarm(id, { cropSeason: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none transition shadow-sm bg-white cursor-pointer"
                >
                  <option value="kharif">Kharif</option>
                  <option value="rabi">Rabi</option>
                  <option value="zaid">Zaid</option>
                  <option value="year-round">Year Round</option>
                </select>
              </div>

              {selectedFarm.ownershipType === 'own' && (
                <div className="border-t border-stone-100 pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-stone-900">Take a Partner / Add Partnership</h4>
                  <p className="text-[11px] text-stone-400 font-medium">
                    Convert this self-owned plot into a partnership plot. You can add a partner and start splitting costs.
                  </p>
                  <form onSubmit={handleAddPartnerToOwnFarm} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Partner Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:border-primary focus:outline-none transition shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={partnerPhone}
                          onChange={(e) => setPartnerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:border-primary focus:outline-none transition shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Crop/Cost Share % *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="1"
                            max="99"
                            value={partnerShare}
                            onChange={(e) => setPartnerShare(e.target.value)}
                            placeholder="50"
                            className="w-full pl-3 pr-6 py-2 text-xs border border-stone-200 rounded-lg focus:border-primary focus:outline-none transition shadow-sm"
                          />
                          <span className="absolute right-2.5 top-2 text-stone-400 text-xs font-bold">%</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={addPartnerLoading}
                      className="w-full py-2 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer"
                    >
                      {addPartnerLoading ? 'Adding...' : 'Add Partner & Enable splits'}
                    </button>
                  </form>
                </div>
              )}

              <div className="border-t border-stone-100 pt-6">
                <h4 className="text-sm font-bold text-red-600 mb-1.5">Danger Zone</h4>
                <p className="text-[11px] text-stone-400 font-medium mb-4">
                  Deleting a farm will remove all associated logs and invoices permanently.
                </p>
                <button
                  onClick={handleDeleteFarm}
                  className="flex items-center gap-1.5 w-full justify-center bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-650 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-200 cursor-pointer"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Delete Farm Plot
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Lend Money Modal */}
      {selectedPartner && (
        <Modal
          isOpen={isLendModalOpen}
          onClose={() => setIsLendModalOpen(false)}
          title={`Lend Money to ${selectedPartner.name}`}
        >
          <form onSubmit={handleSaveLend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Lending Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
              <p className="text-[10px] text-stone-400 font-medium mt-1 leading-relaxed">
                This amount will be added 100% to the partner's share of expense balance, and will be automatically deducted from their crop harvest profits during settlement.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Note / Description
              </label>
              <input
                type="text"
                value={lendNote}
                onChange={(e) => setLendNote(e.target.value)}
                placeholder="e.g. Advance cash for household expenses"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={lendLoading || !lendAmount}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
            >
              {lendLoading ? 'Recording Loan...' : 'Confirm Loan & Prepare SMS'}
            </button>
          </form>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {selectedPartner && (
        <Modal
          isOpen={isSettlementModalOpen}
          onClose={() => setIsSettlementModalOpen(false)}
          title={`Settle Share with ${selectedPartner.name}`}
        >
          <form onSubmit={handleSaveSettlement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Settlement Amount *
              </label>
              <input
                type="number"
                required
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
                placeholder="e.g. Cash payment for kharif crop"
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={settleLoading || !settleAmount}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
            >
              {settleLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </Modal>
      )}

      {/* View Terms Modal */}
      {selectedPartner && (
        <Modal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          title={`Partnership Terms: ${selectedPartner.name}`}
        >
          {selectedPartner.terms ? (
            <div className="space-y-4">
              <div className="border border-stone-200 rounded-xl bg-stone-50 p-4 font-mono text-xs space-y-3">
                <p><strong>System Type  :</strong> {selectedPartner.terms.systemType?.toUpperCase()}</p>
                <p><strong>Crop Share   :</strong> {selectedPartner.terms.cropSharePercent}% ({selectedPartner.terms.cropShareBasis?.replace('_', ' ')})</p>
                <p><strong>Payment Time :</strong> {selectedPartner.terms.paymentTiming?.replace('_', ' ')}</p>
                
                {selectedPartner.terms.expenseSharing && (
                  <div className="border-t border-dashed border-stone-300 pt-2.5 space-y-1">
                    <p className="font-bold text-primary text-[10px] uppercase">Expense Sharing Splits</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {Object.entries(selectedPartner.terms.expenseSharing).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.split('_')[1] || key}:</span>
                          <span>{val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPartner.terms.partnerResponsibilities?.length > 0 && (
                  <div className="border-t border-dashed border-stone-300 pt-2.5">
                    <p className="font-bold text-emerald-700 text-[10px] uppercase">Partner's Work Duties</p>
                    <p className="mt-1 font-sans text-stone-700">
                      {selectedPartner.terms.partnerResponsibilities.join(', ')}
                    </p>
                  </div>
                )}

                {selectedPartner.terms.customNotes && (
                  <div className="border-t border-dashed border-stone-300 pt-2.5">
                    <p className="font-bold text-stone-400 text-[9px] uppercase">Notes</p>
                    <p className="italic mt-1">"{selectedPartner.terms.customNotes}"</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsTermsModalOpen(false);
                    navigate(`/farms/${id}/partners/${selectedPartner.id}/edit`);
                  }}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-center transition cursor-pointer text-xs"
                >
                  Edit Terms
                </button>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="w-full py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold text-center transition cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-stone-400 font-semibold space-y-4">
              <p>No custom partnership terms built for this partner yet.</p>
              <button
                onClick={() => {
                  setIsTermsModalOpen(false);
                  navigate(`/farms/${id}/partners/${selectedPartner.id}/edit`);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Create Terms Agreement
              </button>
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}
