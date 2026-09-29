import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useAdvanceStore } from '../../store/useAdvanceStore.js';
import { Plus, Banknote, Calendar, Trash2 } from 'lucide-react';
import { formatINR, formatDate, toLocalDateString, parseLocalDateString } from '../../../../shared/utils/helpers.js';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';

export default function AdvancesPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { advances, fetchAdvances, createAdvance, removeAdvance, loading } = useAdvanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form states
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalDateString());
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchAdvances(profile.uid);
    }
  }, [profile, fetchAdvances]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || !date) return;
    setFormLoading(true);

    try {
      await createAdvance({
        ownerId: profile.uid,
        amount: parseFloat(amount),
        date: parseLocalDateString(date) || new Date(),
        description,
        type: 'received',
      });

      fetchAdvances(profile.uid);
      setToastMsg('Advance payment recorded successfully!');
      setToastType('success');
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
    } catch (err) {
      setToastMsg(err.message || 'Failed to save advance');
      setToastType('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (advanceId) => {
    if (window.confirm('Delete this advance record?')) {
      try {
        await removeAdvance(advanceId);
        fetchAdvances(profile.uid);
        setToastMsg('Record deleted successfully');
        setToastType('success');
      } catch (err) {
        setToastMsg('Failed to delete');
        setToastType('error');
      }
    }
  };

  const totalAdvances = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Owner Advances</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Track money given by the farm owner (advances / payments received).
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record Advance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Stats) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-stone-200/50 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Advances Received
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <AmountDisplay amount={totalAdvances} className="text-3xl font-extrabold text-stone-900" />
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Total amount of money received from the farm owner across all time.
            </p>
          </div>
        </div>

        {/* Right Column (List) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <Banknote className="w-4.5 h-4.5 text-primary" />
            Recent Advances
          </h3>

          {advances.length > 0 ? (
            <div className="space-y-3">
              {advances.map((adv) => (
                <div 
                  key={adv.id}
                  className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-stone-50 rounded-xl shrink-0">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {adv.description || 'Advance Payment'}
                      </h4>
                      <p className="text-xs text-stone-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(adv.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <AmountDisplay amount={adv.amount} className="text-sm font-extrabold text-stone-900" />
                    
                    <button
                      onClick={() => handleDelete(adv.id)}
                      className="p-1.5 border border-stone-100 hover:border-red-200 hover:text-red-650 rounded-lg text-stone-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/50 rounded-2xl p-8 text-center text-stone-400 text-xs font-semibold">
              No advance records found.
            </div>
          )}
        </div>
      </div>

      {/* Add Advance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Owner Advance"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Amount Received *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Initial setup advance"
              className="w-full px-4 py-2 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading || !amount}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
          >
            {formLoading ? 'Recording...' : 'Record Advance'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
