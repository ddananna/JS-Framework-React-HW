// Authentication logic. Components and the AuthContext use this module.
// Nothing outside this file calls Firebase Auth directly.
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

// Firebase error codes -> messages a user can act on.
const MESSAGES = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-password': 'Enter your password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'This email is already registered with a different sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in the Firebase console.',
  'auth/unauthorized-domain':
    'This domain is not authorized. Add it in Firebase: Authentication → Settings → Authorized domains.',
};

function toUserError(error) {
  return new Error(MESSAGES[error?.code] ?? 'Something went wrong. Please try again.');
}

function ensureConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  }
}

// Calls back on every sign-in change. Firebase restores the saved session on load,
// so the session survives a page refresh.
export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signup(email, password) {
  ensureConfigured();
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw toUserError(error);
  }
}

export async function login(email, password) {
  ensureConfigured();
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw toUserError(error);
  }
}

export async function loginWithGoogle() {
  ensureConfigured();
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  } catch (error) {
    throw toUserError(error);
  }
}

export async function logout() {
  ensureConfigured();
  try {
    await signOut(auth);
  } catch (error) {
    throw toUserError(error);
  }
}
