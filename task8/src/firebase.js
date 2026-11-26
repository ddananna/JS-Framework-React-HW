import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Values come from .env.local locally, and from GitHub Actions secrets in the deployed build.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

// Initialize only when configured, so a missing .env.local shows a readable error
// instead of crashing the whole app.
const app = isFirebaseConfigured ? initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
