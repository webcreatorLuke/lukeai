// src/services/messageService.js
import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { COLLECTIONS } from '@config/constants';

export const messageService = {

  async add(convId, { role, content, meta = null, images = [] }) {
    const ref = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      convId,
      role,
      content,
      meta,
      images,      // [{ mediaType, data }] — base64, no dataUrl (redundant)
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
    return snap.docs.map((d) => {
      const data = d.data();
      // Rebuild dataUrl locally for display — not stored, to save space
      const images = (data.images || []).map((img) => ({
        ...img,
        dataUrl: `data:${img.mediaType};base64,${img.data}`,
      }));
      return { id: d.id, ...data, images };
    });
  },

  subscribe(convId, onChange) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('convId', '==', convId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      onChange(snap.docs.map((d) => {
        const data = d.data();
        const images = (data.images || []).map((img) => ({
          ...img,
          dataUrl: `data:${img.mediaType};base64,${img.data}`,
        }));
        return { id: d.id, ...data, images };
      }));
    });
  },

  async delete(messageId) {
    await deleteDoc(doc(db, COLLECTIONS.MESSAGES, messageId));
  },
};
