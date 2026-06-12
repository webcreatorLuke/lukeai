// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useAuthStore } from '@store/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    const unsub = store.init();
    return () => unsub?.();
  }, []);

  return {
    user:        store.user,
    userData:    store.userData,
    loading:     store.loading,
    initialized: store.initialized,
    error:       store.error,
    isLoggedIn:  !!store.user,
    lukeId:      store.userData?.lukeId,
    settings:    store.userData?.settings,
    clearError:  store.clearError,
    updateSettings: store.updateSettings,
  };
}
