import { create } from 'zustand';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogleMobile, 
  sendOTPMobile, 
  verifyOTPMobile, 
  signOut, 
  getUserProfile, 
  updateUserProfile,
  onAuthStateChange
} from '../../../shared/services/auth.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initializeAuth: () => {
    return onAuthStateChange(async (user) => {
      if (user) {
        set({ user, loading: true });
        try {
          const profile = await getUserProfile(user.uid);
          set({ profile, loading: false, initialized: true });
        } catch (error) {
          console.error('Failed to load user profile', error);
          set({ loading: false, initialized: true });
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
  },

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithEmail(email, password);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
      return { user, profile };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  registerWithEmail: async (email, password, profileData) => {
    set({ loading: true, error: null });
    try {
      const user = await signUpWithEmail(email, password, profileData);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
      return { user, profile };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ loading: true, error: null });
    try {
      const { user, isNewUser } = await signInWithGoogleMobile(idToken);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
      return { user, profile, isNewUser };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  sendPhoneOTP: async (phoneNumber, recaptchaVerifier) => {
    set({ loading: true, error: null });
    try {
      const verificationId = await sendOTPMobile(phoneNumber, recaptchaVerifier);
      set({ loading: false });
      return verificationId;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  verifyPhoneOTP: async (verificationId, code) => {
    set({ loading: true, error: null });
    try {
      const { user, isNewUser } = await verifyOTPMobile(verificationId, code);
      const profile = await getUserProfile(user.uid);
      set({ user, profile, loading: false });
      return { user, profile, isNewUser };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateProfile: async (data) => {
    const { user, profile } = get();
    if (!user) return;
    set({ loading: true });
    try {
      await updateUserProfile(user.uid, data);
      set({ profile: { ...profile, ...data }, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  }
}));
