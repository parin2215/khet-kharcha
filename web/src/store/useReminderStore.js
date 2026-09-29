import { create } from 'zustand';
import { 
  addReminder, 
  updateReminder, 
  deleteReminder, 
  toggleReminderDone, 
  getRemindersByOwner, 
  getUpcomingReminders 
} from '../../../shared/services/reminderService.js';

export const useReminderStore = create((set, get) => ({
  reminders: [],
  upcoming: [],
  loading: false,
  error: null,

  fetchReminders: async (ownerId) => {
    if (!ownerId) return;
    set({ loading: true, error: null });
    try {
      const reminders = await getRemindersByOwner(ownerId);
      set({ reminders, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  fetchUpcoming: async (ownerId, count = 3) => {
    if (!ownerId) return;
    try {
      const upcoming = await getUpcomingReminders(ownerId, count);
      set({ upcoming });
    } catch (error) {
      console.error('Error fetching upcoming reminders', error);
    }
  },

  createReminder: async (reminderData) => {
    set({ loading: true, error: null });
    try {
      const id = await addReminder(reminderData);
      set({ loading: false });
      return id;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  editReminder: async (reminderId, data) => {
    set({ loading: true, error: null });
    try {
      await updateReminder(reminderId, data);
      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  toggleReminder: async (reminderId, done) => {
    try {
      await toggleReminderDone(reminderId, done);
      set((state) => ({
        reminders: state.reminders.map((r) => r.id === reminderId ? { ...r, done } : r),
        upcoming: state.upcoming.map((r) => r.id === reminderId ? { ...r, done } : r).filter((r) => !r.done),
      }));
    } catch (error) {
      console.error('Error toggling reminder status', error);
      throw error;
    }
  },

  removeReminder: async (reminderId) => {
    set({ loading: true, error: null });
    try {
      await deleteReminder(reminderId);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== reminderId),
        upcoming: state.upcoming.filter((r) => r.id !== reminderId),
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  }
}));
