// ============================================================================
// Firebase configuration
// ----------------------------------------------------------------------------
// Firebase is initialised lazily on the client only — it must NOT run during
// SSR/prerender (no window), and deferring it keeps it out of the initial
// JS bundle so the homepage loads fast.
// ============================================================================

const firebaseConfig = {
  apiKey: 'AIzaSyDbKz_wX4OWf-MpL6wqFJF6BeQeWBVlwvM',
  authDomain: 'purplebeecakes01.firebaseapp.com',
  projectId: 'purplebeecakes01',
  storageBucket: 'purplebeecakes01.firebasestorage.app',
  messagingSenderId: '754389835205',
  appId: '1:754389835205:web:4b7747d2f98094df55bfac',
  measurementId: 'G-1B80EYYGTP',
}

export const ADMIN_EMAILS = ['purplebeecakess@gmail.com']
export const isFirebaseConfigured = true

// These are populated by initFirebase() below — null until called client-side.
export let app = null
export let auth = null
export let db = null

let initialised = false

export async function initFirebase() {
  if (initialised || typeof window === 'undefined') return
  initialised = true

  const [
    { initializeApp },
    { getAuth },
    { getFirestore },
    { getAnalytics, isSupported },
  ] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
    import('firebase/analytics'),
  ])

  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  isSupported().then((ok) => { if (ok) getAnalytics(app) })
}
