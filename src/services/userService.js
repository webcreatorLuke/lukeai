// src/services/userService.js
// Firestore operations for user documents, settings, and profile data

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { COLLECTIONS } from '@config/constants';

export const userService = {

  // ─── Create user document on first login ────────────────────────────────
  async createUserDocument(firebaseUser, { lukeId, provider }) {
    const ref  = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const data = {
      uid:         firebaseUser.uid,
      lukeId,
      email:       firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      photoURL:    firebaseUser.photoURL    || null,
      provider,
      createdAt:   serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        theme:          'dark',
        fontSize:       'md',
        sendOnEnter:    true,
        streamResponse: true,
        systemPrompt:   '',
        apiKey:         '',   // User-provided Anthropic key (stored encrypted)
      },
    };
    await setDoc(ref, data);
    return data;
  },

  // ─── Fetch user document ──────────────────────────────────────────────────
  async getUserDocument(uid) {
    const ref  = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // ─── Update top-level fields ──────────────────────────────────────────────
  async updateUserDocument(uid, fields) {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(ref, { ...fields, updatedAt: serverTimestamp() });
  },

  // ─── Update last login timestamp ─────────────────────────────────────────
  async updateLastLogin(uid) {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
  },

  // ─── Update nested settings ──────────────────────────────────────────────
  async updateSettings(uid, settings) {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    // Use dot-notation to merge only changed settings fields
    const merged = {};
    Object.entries(settings).forEach(([k, v]) => {
      merged[`settings.${k}`] = v;
    });
    await updateDoc(ref, { ...merged, updatedAt: serverTimestamp() });
  },

  // ─── Save encrypted API key ───────────────────────────────────────────────
  async saveApiKey(uid, encryptedKey) {
    await this.updateSettings(uid, { apiKey: encryptedKey });
  },

  // ─── Look up user by lukeId ───────────────────────────────────────────────
  async getUserByLukeId(lukeId) {
    const q    = query(
      collection(db, COLLECTIONS.USERS),
      where('lukeId', '==', lukeId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  // ─── Delete all user data (GDPR / account deletion) ─────────────────────
  async deleteUserData(uid) {
    const batch = writeBatch(db);

    // Delete user document
    batch.delete(doc(db, COLLECTIONS.USERS, uid));

    // Delete all conversations
    const convQ    = query(collection(db, COLLECTIONS.CONVERSATIONS), where('userId', '==', uid));
    const convSnap = await getDocs(convQ);
    convSnap.forEach((d) => batch.delete(d.ref));

    // Delete all passkeys
    const pkQ    = query(collection(db, COLLECTIONS.PASSKEYS), where('userId', '==', uid));
    const pkSnap = await getDocs(pkQ);
    pkSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  },
};
