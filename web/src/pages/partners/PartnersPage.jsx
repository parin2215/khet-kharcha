import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { usePartnerStore } from '../../store/usePartnerStore.js';
import { useFarmStore } from '../../store/useFarmStore.js';
import { 
  Users, Sprout, Plus, Trash2, Edit, Phone, Calendar, 
  MapPin, Scale, FileText, ChevronRight, AlertTriangle, Coins 
} from 'lucide-react';
import AmountDisplay from '../../components/AmountDisplay.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Toast from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';
import { useExpenseStore } from '../../store/useExpenseStore.js';
import { toLocalDateString } from '../../../../shared/utils/helpers.js';

export default function PartnersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { partners, fetchPartners, removePartner, loading: partnersLoading } = usePartnerStore();
  const { farms, fetchFarms } = useFarmStore();

  const { createExpense } = useExpenseStore();

  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteFarmId, setConfirmDeleteFarmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // For the "Add Partner" Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState('');

  // For Lend Money Modal
  const [selectedPartnerForLend, setSelectedPartnerForLend] = useState(null);
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [lendAmount, setLendAmount] = useState('');
  const [lendNote, setLendNote] = useState('');
  const [lendLoading, setLendLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchPartners(profile.uid);
      fetchFarms(profile.uid);
    }
  }, [profile, fetchPartners, fetchFarms]);

  const handleDeleteClick = (partnerId, farmId) => {
    setConfirmDeleteId(partnerId);
    setConfirmDeleteFarmId(farmId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await removePartner(confirmDeleteId, confirmDeleteFarmId);
      setToastMsg('Partner deleted successfully');
      setToastType('success');
      setConfirmDeleteId(null);
      setConfirmDeleteFarmId(null);
    } catch (err) {
      setToastMsg('Failed to delete partner');
      setToastType('error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddPartnerRedirect = (e) => {
    e.preventDefault();
    if (!selectedFarmId) return;
    setIsAddModalOpen(false);
    navigate(`/farms/${selectedFarmId}/partners/new`);
  };

  const handleSaveLend = async (e) => {
    e.preventDefault();
    if (!selectedPartnerForLend || !lendAmount) return;
    const amountVal = parseFloat(lendAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setToastMsg('Please enter a valid lending amount');
      setToastType('error');
      return;
    }

    setLendLoading(true);
    try {
      const farm = farms.find(f => f.id === selectedPartnerForLend.farmId);
      
      await createExpense({
        farmId: selectedPartnerForLend.farmId,
        ownerId: profile.uid,
        amount: amountVal,
        category: 'loan_interest',
        expenseType: 'partner',
        ownerShare: 0,
        partnerShare: amountVal,
        partnerId: selectedPartnerForLend.id,
        partnerName: selectedPartnerForLend.name,
        note: lendNote || `Lended money to ${selectedPartnerForLend.name}`,
        date: toLocalDateString(),
        season: selectedPartnerForLend.season || 'year-round'
      });

      setToastMsg('Loan recorded successfully! Opening SMS...');
      setToastType('success');
      setIsLendModalOpen(false);
      setLendAmount('');
      setLendNote('');

      // Open SMS link
      const message = `Khet Kharcha: Lent money ₹${amountVal} to you for farm ${farm?.name || 'our farm'}. This will be payback in farming partnership profit.`;
      const smsUrl = `sms:${selectedPartnerForLend.phone}?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
    } catch (err) {
      setToastMsg(err.message || 'Failed to save loan');
      setToastType('error');
    } finally {
      setLendLoading(false);
    }
  };

  const availableFarms = farms || [];

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header Banner */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Partners Management</h1>
            <p className="text-sm text-stone-400 font-medium mt-1.5">
              Manage details, shares, crop agreements, and remove partners for all plots.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (farms.length === 0) {
              setToastMsg('Please add a farm plot first.');
              setToastType('error');
              return;
            }
            setSelectedFarmId(farms[0].id);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Add Partner
        </button>
      </div>

      {/* Partners List */}
      {partnersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-white border border-stone-200/50 rounded-2xl animate-pulse"></div>
          <div className="h-44 bg-white border border-stone-200/50 rounded-2xl animate-pulse"></div>
        </div>
      ) : partners.length === 0 ? (
        <EmptyState
          message="No partners added yet. Start splitting expenses and crop yields by adding a partner."
          btnLabel="Add Partner"
          onBtnPress={() => {
            if (farms.length === 0) {
              setToastMsg('Please add a farm plot first.');
              setToastType('error');
              return;
            }
            setSelectedFarmId(farms[0].id);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => {
            const farm = farms.find((f) => f.id === partner.farmId);
            const cropShare = partner.terms?.cropSharePercent !== undefined ? partner.terms.cropSharePercent : partner.sharePercent;
            
            return (
              <div 
                key={partner.id}
                className="bg-white border border-stone-200/50 hover:border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(partner.id, partner.farmId)}
                  className="absolute top-4 right-4 p-2 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-650 border border-stone-200/50 rounded-xl transition cursor-pointer"
                  title="Delete Partner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Partner Basic Info */}
                <div className="space-y-2.5">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-lg pr-8 truncate">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {partner.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-150 p-2.5 rounded-xl">
                    <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold block truncate">{farm?.name || 'Unknown Farm'}</span>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">{partner.season} crop season</span>
                    </div>
                  </div>
                </div>

                {/* Quick Split Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-xs font-bold">
                  <div>
                    <span className="text-stone-400 block mb-1">Crop Share</span>
                    <span className="text-base text-primary font-black">{cropShare}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block mb-1">Paid Share</span>
                    <AmountDisplay amount={partner.totalPaid || 0} className="text-base text-stone-950 font-black" />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t border-stone-100 pt-4">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => navigate(`/farms/${partner.farmId}`)}
                      className="flex-1 py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-center text-xs font-bold transition cursor-pointer"
                    >
                      View Ledger
                    </button>
                    <button
                      onClick={() => navigate(`/farms/${partner.farmId}/partners/${partner.id}/edit`)}
                      className="flex-1 py-2 px-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-center text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPartnerForLend(partner);
                      setLendAmount('');
                      setLendNote('');
                      setIsLendModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-center text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    Lend Money
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Select Farm plot first Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Select Farm Plot for Partnership"
      >
        <form onSubmit={handleAddPartnerRedirect} className="space-y-5">
          <p className="text-xs text-stone-400 font-medium">
            Partners are tied to a specific farm plot. Select which plot you want to add a partner to.
          </p>
          
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Select Farm Plot
            </label>
            <select
              required
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
            >
              {availableFarms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.ownershipType === 'own' ? 'Self-Owned' : 'Partnership'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="w-1/2 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold transition text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow transition text-xs cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>
      </Modal>

      {/* Lend Money Modal */}
      {selectedPartnerForLend && (
        <Modal
          isOpen={isLendModalOpen}
          onClose={() => setIsLendModalOpen(false)}
          title={`Lend Money to ${selectedPartnerForLend.name}`}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => { setConfirmDeleteId(null); setConfirmDeleteFarmId(null); }}
        title="Delete Partner?"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div className="text-xs font-medium">
              <span className="font-extrabold text-sm block mb-0.5">Warning</span>
              Deleting this partner will remove all their settlements and agreements from this plot. This cannot be undone.
            </div>
          </div>

          <div className="flex gap-3.5 pt-2">
            <button
              type="button"
              disabled={deleteLoading}
              onClick={() => { setConfirmDeleteId(null); setConfirmDeleteFarmId(null); }}
              className="w-1/2 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 font-bold disabled:opacity-50 transition text-xs cursor-pointer"
            >
              No, Cancel
            </button>
            <button
              type="button"
              disabled={deleteLoading}
              onClick={handleConfirmDelete}
              className="w-1/2 py-2.5 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl shadow disabled:bg-stone-300 transition text-xs cursor-pointer"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
