import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// ─────────────────────────────────────────────────────────────
// Lazy, defensive Firebase init.
// If env vars are missing we return `null` and the hooks fall back
// to mock data — so the app boots even before Firebase is wired up.
// ─────────────────────────────────────────────────────────────

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId);
}

export function firebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) app = initializeApp(config);
  return app;
}

export function db(): Firestore | null {
  const a = firebaseApp();
  if (!a) return null;
  if (!_db) _db = getFirestore(a);
  return _db;
}

export function auth(): Auth | null {
  const a = firebaseApp();
  if (!a) return null;
  if (!_auth) _auth = getAuth(a);
  return _auth;
}
