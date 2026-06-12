// src/services/authService.js
// All Firebase Auth operations — sign up, sign in, Google OAuth, passkeys, sign out

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@config/firebase';
import { userService } from './userService';
import { generateLukeId } from '@utils/idGenerator';
import { ERRORS } from '@config/constants';

// ─── Google provider ──────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Sign up with email / password ────────────────────────────────────────────
export async function signUpWithEmail({ email, password, displayName }) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user }   = credential;

    // Set display name in Firebase Auth profile
    await updateProfile(user, { displayName });

    // Generate unique LukeAI ID and create Firestore user document
    const lukeId = generateLukeId();
    await userService.createUserDocument(user, { lukeId, provider: 'password' });

    return { user, lukeId };
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Sign in with email / password ────────────────────────────────────────────
export async function signInWithEmail({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await userService.updateLastLogin(credential.user.uid);
    return credential.user;
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Sign in with Google OAuth ────────────────────────────────────────────────
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;

    // Check if this is a first-time Google login
    const existingUser = await userService.getUserDocument(user.uid);
    if (!existingUser) {
      const lukeId = generateLukeId();
      await userService.createUserDocument(user, {
        lukeId,
        provider: 'google.com',
      });
      return { user, lukeId, isNew: true };
    }

    await userService.updateLastLogin(user.uid);
    return { user, lukeId: existingUser.lukeId, isNew: false };
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Password reset ────────────────────────────────────────────────────────────
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Update profile ───────────────────────────────────────────────────────────
export async function updateUserProfile({ displayName, photoURL }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  try {
    await updateProfile(user, { displayName, photoURL });
    await userService.updateUserDocument(user.uid, { displayName, photoURL });
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Update email (requires re-auth) ─────────────────────────────────────────
export async function updateUserEmail({ newEmail, currentPassword }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  try {
    // Re-authenticate first
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updateEmail(user, newEmail);
    await userService.updateUserDocument(user.uid, { email: newEmail });
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Delete account (requires re-auth) ───────────────────────────────────────
export async function deleteAccount(currentPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  try {
    if (user.providerData[0]?.providerId === 'password') {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
    }
    // Delete Firestore data first
    await userService.deleteUserData(user.uid);
    await deleteUser(user);
  } catch (err) {
    throw mapAuthError(err);
  }
}

// ─── Auth state observer ─────────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Get current user ─────────────────────────────────────────────────────────
export function getCurrentUser() {
  return auth.currentUser;
}

// ─── Map Firebase error codes → friendly messages ────────────────────────────
function mapAuthError(err) {
  const map = {
    'auth/email-already-in-use':    ERRORS.AUTH.EMAIL_IN_USE,
    'auth/invalid-email':           'Invalid email address.',
    'auth/weak-password':           ERRORS.AUTH.WEAK_PASSWORD,
    'auth/user-not-found':          ERRORS.AUTH.USER_NOT_FOUND,
    'auth/wrong-password':          ERRORS.AUTH.INVALID_CREDENTIALS,
    'auth/invalid-credential':      ERRORS.AUTH.INVALID_CREDENTIALS,
    'auth/too-many-requests':       ERRORS.AUTH.TOO_MANY_REQUESTS,
    'auth/popup-closed-by-user':    ERRORS.AUTH.POPUP_CLOSED,
    'auth/network-request-failed':  ERRORS.AUTH.NETWORK,
  };
  const message = map[err.code] || ERRORS.AUTH.GENERIC;
  const mapped  = new Error(message);
  mapped.code   = err.code;
  return mapped;
}
