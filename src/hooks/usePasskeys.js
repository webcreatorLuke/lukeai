// src/hooks/usePasskeys.js
import { useState, useEffect, useCallback } from 'react';
import {
  registerPasskey,
  authenticateWithPasskey,
  getUserPasskeys,
  deletePasskey,
  isPasskeySupported,
} from '@services/passkeyService';
import { useAuthStore } from '@store/authStore';

export function usePasskeys() {
  const { user }      = useAuthStore();
  const [passkeys,    setPasskeys]    = useState([]);
  const [supported,   setSupported]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    isPasskeySupported().then(setSupported);
  }, []);

  useEffect(() => {
    if (user?.uid) loadPasskeys();
  }, [user?.uid]);

  const loadPasskeys = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const list = await getUserPasskeys(user.uid);
      setPasskeys(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const addPasskey = useCallback(async (deviceName) => {
    if (!user) throw new Error('Must be signed in');
    setLoading(true);
    setError(null);
    try {
      const pk = await registerPasskey(user, deviceName);
      setPasskeys((p) => [...p, pk]);
      return pk;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removePasskey = useCallback(async (credentialId) => {
    setLoading(true);
    try {
      await deletePasskey(credentialId);
      setPasskeys((p) => p.filter((k) => k.id !== credentialId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    passkeys,
    supported,
    loading,
    error,
    addPasskey,
    removePasskey,
    refresh: loadPasskeys,
  };
}
