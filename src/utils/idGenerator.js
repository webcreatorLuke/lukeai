// src/utils/idGenerator.js
import { USER_ID_PREFIX, USER_ID_LENGTH } from '@config/constants';

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateLukeId() {
  let id = USER_ID_PREFIX;
  const arr = new Uint8Array(USER_ID_LENGTH);
  crypto.getRandomValues(arr);
  arr.forEach((b) => (id += CHARS[b % CHARS.length]));
  return id;
}

export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateConvId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
