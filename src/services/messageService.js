// src/services/messageService.js
import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { COLLECTIONS } from '@config/constants';

export const messageService = {

  async add(convId, { role, content, meta = null }) {
    const ref = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      convId,
      role,
      content,
      meta,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async list(convId) {
    const q    = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('convId', '==', convId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  subscribe(convId, onChange) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('convId', '==', convId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },

  async delete(messageId) {
    await deleteDoc(doc(db, COLLECTIONS.MESSAGES, messageId));
  },
};
