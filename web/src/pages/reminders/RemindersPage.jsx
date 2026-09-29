import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useReminderStore } from '../../store/useReminderStore.js';
import { Bell, Calendar, Plus, Clock, CheckCircle2, Trash2, Sprout, SprayCan, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../../shared/utils/helpers.js';
import Modal from '../../components/Modal.jsx';
import Toast from '../../components/Toast.jsx';

export default function RemindersPage() {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { reminders, fetchReminders, createReminder, editReminder, toggleReminder, removeReminder, loading } = useReminderStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('spray'); // bill | spray | fertilizer | harvest | loan | other
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchReminders(profile.uid);
    }
  }, [profile, fetchReminders]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setFormLoading(true);

    try {
      await createReminder({
        ownerId: profile.uid,
        title,
        description,
        dueDate: new Date(dueDate),
        type
      });

      // Refresh list
      fetchReminders(profile.uid);

      setToastMsg('Reminder saved successfully!');
      setToastType('success');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      setToastMsg(err.message || 'Error saving reminder');
      setToastType('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (reminderId, done) => {
    try {
      await toggleReminder(reminderId, done);
      setToastMsg(done ? 'Task marked as DONE!' : 'Task active');
      setToastType('success');
    } catch (err) {
      setToastMsg(err.message || 'Failed to update reminder');
      setToastType('error');
    }
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        await removeReminder(reminderId);
        setToastMsg('Reminder removed');
        setToastType('success');
      } catch (err) {
        setToastMsg('Error deleting');
        setToastType('error');
      }
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'spray': return <span className="text-emerald-600">🚿</span>;
      case 'fertilizer': return <span className="text-green-600">🌱</span>;
      case 'harvest': return <span className="text-yellow-600">🌾</span>;
      case 'bill': return <span className="text-orange-500">📄</span>;
      case 'loan': return <span className="text-red-500">💰</span>;
      default: return <span className="text-stone-500">🔔</span>;
    }
  };

  const getDueStatus = (reminder) => {
    if (reminder.done) return { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    
    const due = reminder.dueDate?.toDate ? reminder.dueDate.toDate() : new Date(reminder.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', class: 'bg-red-50 text-red-650 border-red-200 animate-pulse' };
    }
    if (diffDays === 0) {
      return { label: 'Today', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (diffDays <= 3) {
      return { label: `Due in ${diffDays} days`, class: 'bg-stone-50 text-stone-650 border-stone-200' };
    }
    return { label: `Due ${formatDate(reminder.dueDate)}`, class: 'bg-stone-50 text-stone-500 border-stone-200' };
  };

  const activeReminders = reminders.filter(r => !r.done);
  const completedReminders = reminders.filter(r => r.done);

  return (
    <div className="space-y-6">
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Header bar */}
      <div className="flex justify-between items-center bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t('navigation.reminders')}</h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Schedule farm sprays, fertilizer schedules, or crop harvesting deadlines.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow transition duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Reminders */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <Clock className="w-4.5 h-4.5 text-amber-500" />
            Active Tasks ({activeReminders.length})
          </h3>

          {activeReminders.length > 0 ? (
            <div className="space-y-3">
              {activeReminders.map((rem) => {
                const status = getDueStatus(rem);
                return (
                  <div 
                    key={rem.id}
                    className="bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => handleToggle(rem.id, true)}
                        className="p-1 border border-stone-200 hover:border-primary text-transparent hover:text-primary rounded-lg transition shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 text-stone-300" />
                      </button>
                      
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 truncate flex items-center gap-2">
                          <span>{getReminderIcon(rem.type)}</span>
                          {rem.title}
                        </h4>
                        {rem.description && (
                          <p className="text-xs text-stone-400 font-medium mt-0.5 truncate">
                            {rem.description}
                          </p>
                        )}
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="p-1.5 border border-stone-100 hover:border-red-200 hover:text-red-650 rounded-lg text-stone-400 transition shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/50 rounded-2xl p-8 text-center text-stone-400 text-xs font-semibold">
              No active tasks found. Set a reminder! 🔔
            </div>
          )}
        </div>

        {/* Completed Reminders */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
            Completed History
          </h3>

          {completedReminders.length > 0 ? (
            <div className="space-y-3">
              {completedReminders.map((rem) => (
                <div 
                  key={rem.id}
                  className="bg-white/80 border border-stone-200/30 rounded-2xl p-4.5 shadow-sm flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggle(rem.id, false)}
                      className="p-1 text-emerald-500 rounded-lg shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-stone-600 line-through truncate flex items-center gap-2">
                        <span>{getReminderIcon(rem.type)}</span>
                        {rem.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1 border border-stone-100 hover:border-red-200 hover:text-red-650 rounded-lg text-stone-400 transition shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200/50 rounded-2xl p-8 text-center text-stone-400 text-xs font-semibold">
              No tasks completed yet.
            </div>
          )}
        </div>

      </div>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Reminder Task"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spray pesticide on sugacane plot"
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Task Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none bg-white cursor-pointer shadow-sm"
              >
                <option value="spray">Pesticide Spray</option>
                <option value="fertilizer">Fertilizer Feeding</option>
                <option value="harvest">Harvesting Crop</option>
                <option value="bill">Utility Bill Due</option>
                <option value="loan">Loan Installment</option>
                <option value="other">Other Activity</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Note / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details e.g. fertilizer quantity, diesel vendor, etc."
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:border-primary focus:outline-none shadow-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={formLoading || !title}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-stone-300 text-white font-bold rounded-xl shadow transition duration-200 mt-2 cursor-pointer text-sm"
          >
            {formLoading ? 'Saving...' : 'Add Reminder'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
