// ============================================================================
// Firebase configuration
// ----------------------------------------------------------------------------
// Firebase is initialised lazily on the client only — it must NOT run during
// SSR/prerender (no window), and deferring it keeps it out of the initial
// JS bundle so the homepage loads fast.
// ============================================================================

// Reads environment variables from Vite (import.meta.env) during build/client
// and from process.env when this module is loaded directly by Node (prerender).
function env(key, fallback) {
  try {
    const vite = typeof import.meta !== 'undefined' ? import.meta.env : undefined
    if (vite && vite[key] !== undefined) return vite[key]
  } catch {}
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key]
  }
  return fallback
}

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID'),
}

const requiredFirebaseKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const missingFirebaseKeys = requiredFirebaseKeys.filter((k) => !firebaseConfig[k])
if (missingFirebaseKeys.length) {
  throw new Error(
    `Missing Firebase configuration keys: ${missingFirebaseKeys.join(', ')}. ` +
    `Ensure VITE_FIREBASE_* environment variables are set in .env (local) or in Cloudflare Pages (production).`
  )
}

// Dev/UX admin allowlist (used by the local fallback and as a convenience in
// the client). It does NOT grant any access on its own — Firestore rules are
// the real gatekeeper. Replace with your owner email.
export const ADMIN_EMAILS = ['purplebeecakess@gmail.com']
export const isFirebaseConfigured = true

// These are populated by initFirebase() below — null until called client-side.
export let app = null
export let auth = null
export let db = null

let initialised = false
let initPromise = null

export function initFirebase() {
  if (typeof window === 'undefined') return Promise.resolve()
  if (initialised) return Promise.resolve()
  if (initPromise) return initPromise

  initPromise = (async () => {
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
    initialised = true

    isSupported().then((ok) => { if (ok) getAnalytics(app) })
  })()

  return initPromise
}

// Build-time initialisation for Node SSR/prerender. Does not set up auth or
// analytics because they are not needed (and not supported) in a Node context.
let buildInitialised = false
let buildInitPromise = null

export function initFirebaseForBuild() {
  if (buildInitialised) return Promise.resolve()
  if (buildInitPromise) return buildInitPromise

  buildInitPromise = (async () => {
    const [{ initializeApp }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
    ])

    app = initializeApp(firebaseConfig, 'build')
    db = getFirestore(app)
    buildInitialised = true
  })()

  return buildInitPromise
}

export { firebaseConfig }
