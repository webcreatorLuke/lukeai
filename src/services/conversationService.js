// src/services/conversationService.js
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  deleteDoc, query, where, orderBy, limit, serverTimestamp,
  onSnapshot, writeBatch, increment,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { COLLECTIONS, MAX_CONVERSATIONS } from '@config/constants';
import { generateConvTitle } from '@utils/helpers';

export const conversationService = {

  // ─── Create new conversation ────────────────────────────────────────────
  async create(userId, firstMessage = '') {
    const ref = await addDoc(collection(db, COLLECTIONS.CONVERSATIONS), {
      userId,
      title:        generateConvTitle(firstMessage) || 'New conversation',
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
      messageCount: 0,
      pinned:       false,
      tags:         [],
      lastMessage:  null,
    });
    return ref.id;
  },

  // ─── Fetch single conversation ──────────────────────────────────────────
  async get(convId) {
    const snap = await getDoc(doc(db, COLLECTIONS.CONVERSATIONS, convId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  // ─── List all conversations for a user ─────────────────────────────────
  async list(userId) {
    const q    = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(MAX_CONVERSATIONS)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // ─── Real-time listener ─────────────────────────────────────────────────
  subscribe(userId, onChange) {
    const q = query(
      collection(db, COLLECTIONS.CONVERSATIONS),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(MAX_CONVERSATIONS)
    );
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  // ─── Update title / metadata ────────────────────────────────────────────
  async update(convId, fields) {
    await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, convId), {
      ...fields,
      updatedAt: serverTimestamp(),
    });
  },

  // ─── Bump updatedAt + lastMessage preview + messageCount ────────────────
  async touch(convId, lastMessage) {
    await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, convId), {
      updatedAt:   serverTimestamp(),
      lastMessage: {
        role:      lastMessage.role,
        content:   lastMessage.content.slice(0, 120),
        createdAt: serverTimestamp(),
      },
      messageCount: increment(1),
    });
  },

  // ─── Pin / unpin ────────────────────────────────────────────────────────
  async togglePin(convId, pinned) {
    await updateDoc(doc(db, COLLECTIONS.CONVERSATIONS, convId), { pinned });
  },

  // ─── Delete conversation + all its messages ─────────────────────────────
  async delete(convId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, COLLECTIONS.CONVERSATIONS, convId));
    // Delete child messages
    const msgQ  = query(collection(db, COLLECTIONS.MESSAGES), where('convId', '==', convId));
    const msgs  = await getDocs(msgQ);
    msgs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },

  // ─── Delete all conversations for a user ───────────────────────────────
  async deleteAll(userId) {
    const convs = await this.list(userId);
    await Promise.all(convs.map((c) => this.delete(c.id)));
  },
};
