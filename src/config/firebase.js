// src/config/firebase.js
// Firebase initialization — reads credentials from .env
// Copy .env.example → .env and fill in your Firebase project values

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// ─── Firebase configuration ──────────────────────────────────────────────────
// All values come from your .env file (never hard-code secrets in source)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ─── Initialise app (guard against hot-reload double-init) ───────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Core services ────────────────────────────────────────────────────────────
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// ─── Analytics (browser-only, graceful degradation) ──────────────────────────
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// ─── Local emulators (only in development) ───────────────────────────────────
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.info('[Firebase] ✅ Connected to local emulators');
}

// ─── Offline persistence (best-effort) ───────────────────────────────────────
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('[Firestore] Multiple tabs open — persistence disabled in this tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('[Firestore] Browser does not support persistence.');
  }
});

export default app;
