// src/store/authStore.js
import { create } from 'zustand';
import { onAuthChange } from '@services/authService';
import { userService } from '@services/userService';

export const useAuthStore = create((set, get) => ({
  user:        null,
  userData:    null,   // Firestore user doc (includes lukeId, settings)
  loading:     true,
  initialized: false,
  error:       null,

  // ─── Initialize auth state listener ──────────────────────────────────
  init() {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await userService.getUserDocument(firebaseUser.uid);
          set({ user: firebaseUser, userData, loading: false, initialized: true, error: null });
        } catch {
          set({ user: firebaseUser, userData: null, loading: false, initialized: true });
        }
      } else {
        set({ user: null, userData: null, loading: false, initialized: true, error: null });
      }
    });
    return unsub;
  },

  setUser(user, userData) {
    set({ user, userData, error: null });
  },

  setError(error) {
    set({ error });
  },

  clearError() {
    set({ error: null });
  },

  // ─── Update local copy of userData after settings change ─────────────
  updateUserData(fields) {
    set((s) => ({ userData: { ...s.userData, ...fields } }));
  },

  updateSettings(settings) {
    set((s) => ({
      userData: {
        ...s.userData,
        settings: { ...s.userData?.settings, ...settings },
      },
    }));
  },

  reset() {
    set({ user: null, userData: null, error: null });
  },
}));
