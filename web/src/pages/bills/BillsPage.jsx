import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { useBillStore } from '../../store/useBillStore.js';
import { Receipt, Calendar, Plus, Zap, Droplets, Fuel, FileText, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { formatINR, formatDate } from '../../../../shared/utils/helpers.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';

export default function BillsPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { farms, fetchFarms } = useFarmStore();
  const { bills, fetchBills, createBill, payBill, removeBill, loading } = useBillStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form states
  const [farmId, setFarmId] = useState('');
  const [billType, setBillType] = useState('electricity');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [billMonth, setBillMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [dueDate, setDueDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores billId currently processing

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
      fetchBills(profile.uid);
    }
  }, [profile, fetchFarms, fetchBills]);

  // Set default farm
  useEffect(() => {
    if (farms.length > 0 && !farmId) {
      setFarmId(farms[0].id);
    }
  }, [farms, farmId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!farmId || !amount || !dueDate) return;
    setFormLoading(true);

    try {
      await createBill({
        farmId,
        ownerId: profile.uid,
        billType,
        providerName,
        amount: parseFloat(amount),
        billMonth,
        dueDate: new Date(dueDate)
      });

      // Refresh list
      fetchBills(profile.uid);

      setToastMsg('Bill recorded successfully!');
      setToastType('success');
      setIsModalOpen(false);
      setProviderName('');
      setAmount('');
      setDueDate('');
    } catch (err) {
      setToastMsg(err.message || 'Failed to save bill');
      setToastType('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePay = async (billId) => {
    setActionLoading(billId);
    try {
      await payBill(billId);
      setToastMsg('Bill marked as PAID!');
      setToastType('success');
    } catch (err) {
      setToastMsg(err.message || 'Failed to update bill');
      setToastType('error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Delete this bill statement record?')) {
      setActionLoading(billId);
      try {
        await removeBill(billId);
        setToastMsg('Bill deleted successfully');
        setToastType('success');
      } catch (err) {
        setToastMsg('Failed to delete');
        setToastType('error');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getBillIcon = (type) => {
    switch (type) {
      case 'electricity': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'water': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'diesel': return <Fuel className="w-5 h-5 text-stone-600" />;
      default: return <Receipt className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getDueStatus = (bill) => {
    if (bill.paid) return { label: 'Paid', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    
    // Parse timestamp
    const due = bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', class: 'bg-red-50 text-red-650 border-red-200 animate-pulse' };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days`, class: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: `Due ${formatDate(bill.dueDate)}`, class: 'bg-stone-50 text-stone-600 border-stone-200' };
  };

  const unpaidBills = bills.filter(b => !b.paid);
  const paidBills = bills.filter(b => b.paid);

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('navigation.bills')}</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Track utility bills (electricity, water, fuel) and due dates.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column (Unpaid Bills) */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <Clock className="w-4.5 h-4.5 text-amber-500" />
            Unpaid Bills ({unpaidBills.length})
          </h3>

          {unpaidBills.length > 0 ? (
            <div className="space-y-3">
              {unpaidBills.map((bill) => {
                const farm = farms.find(f => f.id === bill.farmId);
                const status = getDueStatus(bill);
                return (
                  <div 
                    key={bill.id}
                    className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 bg-stone-50 rounded-xl shrink-0">
                        {getBillIcon(bill.billType)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 capitalize truncate">
                          {bill.billType} — {bill.providerName || 'Utility'}
                        </h4>
                        <p className="text-xs text-stone-400 font-medium mt-0.5">
                          {bill.farmId === 'custom_bill' ? 'Custom Bill (No Plot)' : `Plot: ${farm?.name || 'Unknown'}`} • Cycle: {bill.billMonth}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <AmountDisplay amount={bill.amount} className="text-sm font-extrabold text-stone-900" />
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePay(bill.id)}
                          disabled={actionLoading === bill.id}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 rounded-xl transition cursor-pointer flex items-center justify-center"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bill.id)}
                          disabled={actionLoading === bill.id}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 rounded-xl transition cursor-pointer flex items-center justify-center"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/50 rounded-2xl p-8 text-center text-stone-400 text-xs font-semibold">
              All bills paid. Great job! 🎉
            </div>
          )}
        </div>

        {/* Right Column (Paid Bills) */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            Paid Bills History
          </h3>

          {paidBills.length > 0 ? (
            <div className="space-y-3">
              {paidBills.map((bill) => {
                const farm = farms.find(f => f.id === bill.farmId);
                return (
                  <div 
                    key={bill.id}
                    className="bg-white/80 border border-stone-200/30 rounded-2xl p-4.5 shadow-sm flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-stone-100/60 rounded-xl shrink-0">
                        {getBillIcon(bill.billType)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-stone-700 capitalize truncate">
                          {bill.billType} — {bill.providerName || 'Utility'}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-semibold mt-0.5">
                          {bill.farmId === 'custom_bill' ? 'Custom Bill' : `Plot: ${farm?.name || 'Unknown'}`} • Paid: {formatDate(bill.paidDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AmountDisplay amount={bill.amount} className="text-xs font-bold text-stone-700" />
                      <button 
                        onClick={() => handleDelete(bill.id)}
                        disabled={actionLoading === bill.id}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 rounded-xl transition cursor-pointer flex items-center justify-center"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/50 rounded-2xl p-8 text-center text-stone-400 text-xs font-semibold">
              No bills paid yet.
            </div>
          )}
        </div>

      </div>

      {/* Add Bill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Bill Statement"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          
          {/* Farm */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Select Farm plot *
            </label>
            <select
              required
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
            >
              <option value="">-- Choose Farm --</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
              <option value="custom_bill">Custom Bill (No Farm)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bill Type */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Bill Category
              </label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
              >
                <option value="electricity">Electricity</option>
                <option value="water">Water / Pump</option>
                <option value="diesel">Diesel Fuel</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Provider Name */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Provider/Merchant
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. DGVCL, Pump Owner"
                className="w-full px-4 py-2 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Bill Amount *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>

            {/* Bill Month */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Billing Period Month
              </label>
              <input
                type="month"
                required
                value={billMonth}
                onChange={(e) => setBillMonth(e.target.value)}
                className="w-full px-4 py-1.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Payment Due Date *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading || !farmId}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
          >
            {formLoading ? 'Recording...' : 'Add Bill'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
