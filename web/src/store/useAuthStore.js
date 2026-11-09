import { create } from 'zustand';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogleWeb, 
  signOut, 
  getUserProfile, 
  updateUserProfile,
  onAuthStateChange
} from '../../../shared/services/auth.js';

const ensureProfile = (user, rawProfile) => {
  if (rawProfile && rawProfile.name && rawProfile.state) {
    return rawProfile;
  }
  const emailName = user?.email ? user.email.split('@')[0] : 'Farmer';
  return {
    uid: user?.uid,
    name: rawProfile?.name || user?.displayName || emailName,
    email: user?.email || '',
    phone: rawProfile?.phone || user?.phoneNumber || '',
    state: rawProfile?.state || 'GJ',
    language: rawProfile?.language || 'gu',
    unitPreference: rawProfile?.unitPreference || 'bigha',
    ...rawProfile
  };
};

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initializeAuth: () => {
    // Check if demo session is stored
    const storedDemo = localStorage.getItem('khet_kharcha_demo_user');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        set({
          user: { uid: parsed.uid, email: parsed.email },
          profile: parsed,
          loading: false,
          initialized: true
        });
        return () => {};
      } catch (e) {
        console.error(e);
      }
    }

    return onAuthStateChange(async (user) => {
      if (user) {
        set({ user, loading: true });
        try {
          const rawProfile = await getUserProfile(user.uid);
          const profile = ensureProfile(user, rawProfile);
          set({ profile, loading: false, initialized: true });
        } catch (error) {
          console.warn('Failed to load user profile, using safe fallback:', error);
          const profile = ensureProfile(user, null);
          set({ profile, loading: false, initialized: true });
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
  },

  loginAsDemo: () => {
    const demoProfile = {
      uid: 'demo_farmer_101',
      name: 'Ramji Patel',
      email: 'ramji.patel@khetkharcha.com',
      phone: '+91 98765 43210',
      state: 'GJ',
      language: 'en',
      unitPreference: 'bigha'
    };
    localStorage.setItem('khet_kharcha_demo_user', JSON.stringify(demoProfile));
    set({
      user: { uid: demoProfile.uid, email: demoProfile.email },
      profile: demoProfile,
      loading: false,
      initialized: true
    });
    return demoProfile;
  },

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithEmail(email, password);
      let rawProfile = null;
      try {
        rawProfile = await getUserProfile(user.uid);
      } catch (e) {
        console.warn('Profile read error during email login:', e);
      }
      const profile = ensureProfile(user, rawProfile);
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
      let rawProfile = null;
      try {
        rawProfile = await getUserProfile(user.uid);
      } catch (e) {
        console.warn('Profile read error during email register:', e);
      }
      const profile = ensureProfile(user, rawProfile || {
        name: profileData.name,
        state: profileData.state,
        language: profileData.language,
        unitPreference: profileData.unitPreference
      });
      set({ user, profile, loading: false });
      return { user, profile };
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { user, isNewUser } = await signInWithGoogleWeb();
      let rawProfile = null;
      try {
        rawProfile = await getUserProfile(user.uid);
      } catch (e) {
        console.warn('Profile read error during google login:', e);
      }
      const profile = ensureProfile(user, rawProfile);
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
      localStorage.removeItem('khet_kharcha_demo_user');
      await signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      localStorage.removeItem('khet_kharcha_demo_user');
      set({ user: null, profile: null, loading: false });
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
