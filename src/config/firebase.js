import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyDbKz_wX4OWf-MpL6wqFJF6BeQeWBVlwvM',
  authDomain: 'purplebeecakes01.firebaseapp.com',
  projectId: 'purplebeecakes01',
  storageBucket: 'purplebeecakes01.firebasestorage.app',
  messagingSenderId: '754389835205',
  appId: '1:754389835205:web:4b7747d2f98094df55bfac',
  measurementId: 'G-1B80EYYGTP',
}

// Admin emails — add your owner email here.
// This is a client-side convenience check only.
// Real admin access is enforced by Firestore security rules (admins/{uid}).
export const ADMIN_EMAILS = ['purplebeecakess@gmail.com']

export const isFirebaseConfigured = true

// Only initialise on the client (not during SSR/prerender).
let app, auth, db

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Analytics only loads in browsers that support it (blocks SSR + some privacy modes).
  isSupported().then((supported) => {
    if (supported) getAnalytics(app)
  })
}

export { app, auth, db }
