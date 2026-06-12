// src/utils/cryptoUtils.js
// WebAuthn binary helpers + simple API-key encryption for local storage

// ─── Base64url encode/decode (WebAuthn standard) ──────────────────────────────
export function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// ─── Random challenge for WebAuthn ────────────────────────────────────────────
export function generateChallenge(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// ─── Lightweight AES-GCM encryption for storing API keys client-side ─────────
// Key is derived from the user's UID so only they can decrypt on this device
export async function encryptApiKey(plaintext, uid) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(uid.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt']
  );
  const iv         = crypto.getRandomValues(new Uint8Array(12));
  const encoded    = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyMaterial, encoded);
  const result     = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(ciphertext), iv.byteLength);
  return bufferToBase64url(result.buffer);
}

export async function decryptApiKey(ciphertextB64, uid) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(uid.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['decrypt']
  );
  const data       = new Uint8Array(base64urlToBuffer(ciphertextB64));
  const iv         = data.slice(0, 12);
  const ciphertext = data.slice(12);
  const decrypted  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyMaterial, ciphertext);
  return new TextDecoder().decode(decrypted);
}
