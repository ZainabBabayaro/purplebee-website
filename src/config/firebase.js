// ============================================================================
// Firebase configuration
// ----------------------------------------------------------------------------
// To go live, create a Firebase project (Authentication + Firestore) in the
// Firebase console and paste your config below. While the values remain the
// "YOUR_*" placeholders, the app automatically uses a local localStorage-based
// fallback (see services/localdb.js) so the store and admin are fully usable
// for development without a project.
//
// SECURITY: client-side config is public by design. Real security is enforced
// by Firestore Security Rules — deploy firestore.rules (in the project root).
// ============================================================================

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ⚠️ Replace these placeholder values with your Firebase project config.
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'purplebeecakes.firebaseapp.com',
  projectId: 'purplebeecakes',
  storageBucket: 'purplebeecakes.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// Dev/UX admin allowlist (used by the local fallback and as a convenience in
// the client). It does NOT grant any access on its own — Firestore rules are
// the real gatekeeper. Replace with your owner email.
export const ADMIN_EMAILS = ['owner@purplebeecakes.co.uk']

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_')

let auth = null
let db = null

// Only initialise Firebase on the client (never during SSR/prerender).
if (isFirebaseConfigured && typeof window !== 'undefined') {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }
export { firebaseConfig }
