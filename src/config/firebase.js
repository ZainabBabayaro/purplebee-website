import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {

// Admin emails — add your owner email here.
// This is a client-side convenience check only.
// Real admin access is enforced by Firestore security rules (admins/{uid}).
=======
  apiKey: "AIzaSyDbKz_wX4OWf-MpL6wqFJF6BeQeWBVlwvM",
  authDomain: "purplebeecakes01.firebaseapp.com",
  projectId: "purplebeecakes01",
  storageBucket: "purplebeecakes01.firebasestorage.app",
  messagingSenderId: "754389835205",
  appId: "1:754389835205:web:4b7747d2f98094df55bfac",
  measurementId: "G-1B80EYYGTP"
};

// Dev/UX admin allowlist (used by the local fallback and as a convenience in
// the client). It does NOT grant any access on its own — Firestore rules are
// the real gatekeeper. Replace with your owner email.
export const ADMIN_EMAILS = ['purplebeecakess@gmail.com']

export const isFirebaseConfigured = true

let app = null
let auth = null
let db = null

// Only initialise Firebase on the client (never during SSR/prerender).
if (isFirebaseConfigured && typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Analytics only loads in browsers that support it (blocks SSR + some privacy modes).
  isSupported().then((supported) => {
    if (supported) getAnalytics(app)
  })
}

export { app, auth, db }
export { firebaseConfig }
export { app, auth, db }
