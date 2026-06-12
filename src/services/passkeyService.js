// src/services/passkeyService.js
// WebAuthn / Passkey registration and authentication
// Stores credential metadata in Firestore; uses browser's native WebAuthn API

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@config/firebase';
import { COLLECTIONS } from '@config/constants';
import {
  bufferToBase64url,
  base64urlToBuffer,
  generateChallenge,
} from '@utils/cryptoUtils';

const RP_NAME = 'LukeAI';

// ─── Register a new passkey ────────────────────────────────────────────────────
export async function registerPasskey(user, deviceName = 'My Passkey') {
  if (!window.PublicKeyCredential) {
    throw new Error('Passkeys are not supported in this browser.');
  }

  const challenge = generateChallenge();

  const publicKeyOptions = {
    challenge,
    rp: {
      name: RP_NAME,
      id:   window.location.hostname,
    },
    user: {
      id:          new TextEncoder().encode(user.uid),
      name:        user.email,
      displayName: user.displayName || user.email,
    },
    pubKeyCredParams: [
      { alg: -7,   type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' },   // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',      // Device passkey (Touch ID, Windows Hello, etc.)
      requireResidentKey:      true,
      residentKey:             'required',
      userVerification:        'required',
    },
    attestation: 'none',   // Don't need attestation for consumer app
    timeout:     60_000,
  };

  let credential;
  try {
    credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey creation was cancelled or timed out.');
    }
    throw new Error(`Passkey registration failed: ${err.message}`);
  }

  // Encode binary data for Firestore storage
  const credentialId = bufferToBase64url(credential.rawId);
  const publicKey    = bufferToBase64url(
    credential.response.getPublicKey?.() || new ArrayBuffer(0)
  );

  const passkeyDoc = {
    id:          credentialId,
    userId:      user.uid,
    name:        deviceName,
    credentialId,
    publicKey,
    aaguid:      getAaguid(credential.response),
    signCount:   0,
    createdAt:   serverTimestamp(),
    lastUsedAt:  serverTimestamp(),
    transports:  credential.response.getTransports?.() || [],
  };

  await setDoc(doc(db, COLLECTIONS.PASSKEYS, credentialId), passkeyDoc);
  return passkeyDoc;
}

// ─── Authenticate with passkey ────────────────────────────────────────────────
export async function authenticateWithPasskey(userId) {
  if (!window.PublicKeyCredential) {
    throw new Error('Passkeys are not supported in this browser.');
  }

  // Fetch registered passkeys for this user
  const passkeys = await getUserPasskeys(userId);
  if (passkeys.length === 0) {
    throw new Error('No passkeys registered for this account.');
  }

  const challenge = generateChallenge();

  const publicKeyOptions = {
    challenge,
    rpId:            window.location.hostname,
    allowCredentials: passkeys.map((pk) => ({
      type:       'public-key',
      id:          base64urlToBuffer(pk.credentialId),
      transports:  pk.transports || ['internal'],
    })),
    userVerification: 'required',
    timeout:          60_000,
  };

  let assertion;
  try {
    assertion = await navigator.credentials.get({ publicKey: publicKeyOptions });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey authentication was cancelled or timed out.');
    }
    throw new Error(`Passkey authentication failed: ${err.message}`);
  }

  // Update last-used timestamp
  const credentialId = bufferToBase64url(assertion.rawId);
  await updateDoc(doc(db, COLLECTIONS.PASSKEYS, credentialId), {
    lastUsedAt: serverTimestamp(),
    signCount:  assertion.response.authenticatorData
      ? new DataView(assertion.response.authenticatorData).getUint32(33, false)
      : 0,
  });

  return { credentialId, userId };
}

// ─── List all passkeys for a user ────────────────────────────────────────────
export async function getUserPasskeys(userId) {
  const q    = query(collection(db, COLLECTIONS.PASSKEYS), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Delete a passkey ─────────────────────────────────────────────────────────
export async function deletePasskey(credentialId) {
  await deleteDoc(doc(db, COLLECTIONS.PASSKEYS, credentialId));
}

// ─── Check if browser supports passkeys ──────────────────────────────────────
export async function isPasskeySupported() {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAaguid(response) {
  try {
    const authData = new Uint8Array(response.getAuthenticatorData?.() || []);
    if (authData.length < 53) return '';
    const aaguidBytes = authData.slice(37, 53);
    return Array.from(aaguidBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}
