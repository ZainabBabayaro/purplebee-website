// ============================================================================
// Shared Firebase helpers for Cloudflare Pages Functions
// ----------------------------------------------------------------------------
// Provides:
//   • Service-account OAuth tokens (Firestore + Firebase Storage scopes)
//   • Firestore REST read / list / patch / create helpers
//   • Firestore transactions (used by /api/checkout for stock safety)
//   • Firebase ID-token verification (used by admin-only endpoints)
//
// Environment variables:
//   FIREBASE_PROJECT_ID       — defaults to purplebeecakes01
//   FIREBASE_SERVICE_ACCOUNT  — entire service-account JSON (preferred)
//   FIREBASE_CLIENT_EMAIL     — or client_email
//   FIREBASE_PRIVATE_KEY      — or private_key (with \n escapes)
// ============================================================================

const GOOGLE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

let cachedJwks = null
let cachedJwksExpiry = 0

// Cache access tokens per project/credential so a warm function doesn't mint
// a new OAuth token on every request.
const tokenCache = new Map()

// ── Base64 helpers ──────────────────────────────────────────────────────────
function base64Url(data) {
  let b64 = ''
  if (typeof data === 'string') {
    b64 = btoa(data)
  } else {
    let binary = ''
    const bytes = new Uint8Array(data)
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    b64 = btoa(binary)
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToUint8Array(base64UrlValue) {
  const base64 = base64UrlValue.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const binary = atob(base64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function decodeJwtPart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  return JSON.parse(atob(base64 + pad))
}

function pemToBuffer(pem) {
  const cleanPem = String(pem)
    .replace(/-----BEGIN[A-Z\s]+-----/, '')
    .replace(/-----END[A-Z\s]+-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '')
  const binary = atob(cleanPem)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return buffer.buffer
}

// ── Credentials ─────────────────────────────────────────────────────────────
export function getFirebaseCredentials(env = {}) {
  let clientEmail = env.FIREBASE_CLIENT_EMAIL || ''
  let privateKey = env.FIREBASE_PRIVATE_KEY || ''
  let projectId = env.FIREBASE_PROJECT_ID || 'purplebeecakes01'

  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = typeof env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
        : env.FIREBASE_SERVICE_ACCOUNT
      clientEmail = sa.client_email || clientEmail
      privateKey = sa.private_key || privateKey
      projectId = sa.project_id || projectId
    } catch (err) {
      console.error('[firebase] Could not parse FIREBASE_SERVICE_ACCOUNT:', err.message)
    }
  }

  return { clientEmail, privateKey, projectId }
}

export function hasFirebaseCredentials(env = {}) {
  const { clientEmail, privateKey } = getFirebaseCredentials(env)
  return Boolean(clientEmail && privateKey)
}

export async function getFirebaseAccessToken(env = {}) {
  const { clientEmail, privateKey, projectId } = getFirebaseCredentials(env)
  if (!clientEmail || !privateKey) {
    throw new Error(
      'Firebase service-account credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY).',
    )
  }

  const cacheKey = `${projectId}:${clientEmail}`
  const cached = tokenCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify({
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write',
  }))

  const unsignedJwt = `${header}.${payload}`
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedJwt),
  )

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsignedJwt}.${base64Url(signature)}`,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google OAuth error: ${res.status} - ${text}`)
  }

  const data = await res.json()
  const token = data.access_token
  const expiresIn = Number(data.expires_in) || 3600
  tokenCache.set(cacheKey, { token, expiresAt: Date.now() + expiresIn * 1000 })
  return token
}

// ── Firestore typed values ──────────────────────────────────────────────────
export function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) }
    return { doubleValue: value }
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } }
  }
  if (typeof value === 'object') {
    const fields = {}
    for (const [k, v] of Object.entries(value)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  return { nullValue: null }
}

export function toFirestoreFields(obj = {}) {
  const fields = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    fields[k] = toFirestoreValue(v)
  }
  return fields
}

export function fromFirestoreValue(v) {
  if (!v || typeof v !== 'object') return null
  if (v.stringValue !== undefined) return v.stringValue
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.doubleValue !== undefined) return Number(v.doubleValue)
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.nullValue !== undefined) return null
  if (v.timestampValue !== undefined) return v.timestampValue
  if (v.arrayValue) return (v.arrayValue.values || []).map(fromFirestoreValue)
  if (v.mapValue) {
    const obj = {}
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) obj[k] = fromFirestoreValue(val)
    return obj
  }
  return null
}

export function fromFirestoreDocument(doc) {
  if (!doc) return null
  const id = (doc.name || '').split('/').pop()
  const record = { id }
  for (const [k, v] of Object.entries(doc.fields || {})) record[k] = fromFirestoreValue(v)
  return record
}

function fsBase(projectId) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
}

function docName(projectId, collectionName, id) {
  return `projects/${projectId}/databases/(default)/documents/${collectionName}/${id}`
}

// ── Firestore REST operations ───────────────────────────────────────────────
export async function firestoreGet(env, collectionName, id, { token } = {}) {
  const { projectId } = getFirebaseCredentials(env)
  const accessToken = token || (await getFirebaseAccessToken(env))
  const res = await fetch(`${fsBase(projectId)}/${collectionName}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Firestore GET ${collectionName}/${id} failed (${res.status})`)
  return fromFirestoreDocument(await res.json())
}

export async function firestoreList(env, collectionName, { token, pageSize = 300 } = {}) {
  const { projectId } = getFirebaseCredentials(env)
  const accessToken = token || (await getFirebaseAccessToken(env))
  const out = []
  let pageToken = ''
  do {
    const params = new URLSearchParams({ pageSize: String(pageSize) })
    if (pageToken) params.set('pageToken', pageToken)
    const res = await fetch(`${fsBase(projectId)}/${collectionName}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Firestore LIST ${collectionName} failed (${res.status})`)
    const json = await res.json()
    for (const doc of json.documents || []) out.push(fromFirestoreDocument(doc))
    pageToken = json.nextPageToken || ''
  } while (pageToken)
  return out
}

export async function firestorePatch(env, collectionName, id, patch) {
  const { projectId } = getFirebaseCredentials(env)
  const token = await getFirebaseAccessToken(env)
  const fields = toFirestoreFields(patch)
  const mask = Object.keys(fields).map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&')
  const res = await fetch(`${fsBase(projectId)}/${collectionName}/${encodeURIComponent(id)}?${mask}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Firestore PATCH ${collectionName}/${id} failed (${res.status}): ${text}`)
  }
  return fromFirestoreDocument(await res.json())
}

export async function firestoreCreate(env, collectionName, id, data) {
  const { projectId } = getFirebaseCredentials(env)
  const token = await getFirebaseAccessToken(env)
  const fields = toFirestoreFields(data)
  const res = await fetch(`${fsBase(projectId)}/${collectionName}?documentId=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Firestore CREATE ${collectionName}/${id} failed (${res.status}): ${text}`)
  }
  return fromFirestoreDocument(await res.json())
}

// Run a read/write Firestore transaction.
//   readDocs: [{ collection, id }] documents to read atomically first
//   work(tx): returns the array of writes; tx.get(collection, id) returns the
//             document snapshot (or null) that was read inside the transaction.
export async function firestoreTransaction(env, readDocs, work) {
  const { projectId } = getFirebaseCredentials(env)
  const token = await getFirebaseAccessToken(env)
  const base = fsBase(projectId)

  const beginRes = await fetch(`${base}:beginTransaction`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ options: { readWrite: {} } }),
  })
  if (!beginRes.ok) {
    const text = await beginRes.text()
    throw new Error(`Firestore beginTransaction failed (${beginRes.status}): ${text}`)
  }
  const { transaction } = await beginRes.json()

  const tx = {
    // Build a write that creates/replaces a document.
    set(collectionName, id, data) {
      return {
        update: {
          name: docName(projectId, collectionName, id),
          fields: toFirestoreFields(data),
        },
      }
    },
    // Build a write that updates only the supplied fields.
    update(collectionName, id, patch) {
      const fields = toFirestoreFields(patch)
      return {
        update: {
          name: docName(projectId, collectionName, id),
          fields,
        },
        updateMask: { fieldPaths: Object.keys(fields) },
        currentDocument: { exists: true },
      }
    },
    // Build a numeric increment transform.
    increment(collectionName, id, fieldPath, amount) {
      return {
        transform: {
          document: docName(projectId, collectionName, id),
          fieldTransforms: [{
            fieldPath,
            increment: { integerValue: String(amount) },
          }],
        },
      }
    },
    get(collectionName, id) {
      return docsByName[docName(projectId, collectionName, id)] || null
    },
  }

  // Read all requested documents inside the transaction.
  let docsByName = {}
  const uniqueReads = [...new Map(
    readDocs.map((d) => [`${d.collection}/${d.id}`, d]),
  ).values()]
  if (uniqueReads.length) {
    const res = await fetch(`${base}:batchGet`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: uniqueReads.map((d) => docName(projectId, d.collection, d.id)),
        transaction,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Firestore batchGet failed (${res.status}): ${text}`)
    }
    const json = await res.json()
    for (const entry of json) {
      const doc = entry.found || entry
      if (doc?.name) docsByName[doc.name] = fromFirestoreDocument(doc)
    }
  }

  const writes = await work(tx)

  const commitRes = await fetch(`${base}:commit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction, writes }),
  })
  if (!commitRes.ok) {
    const text = await commitRes.text()
    throw new Error(`Firestore commit failed (${commitRes.status}): ${text}`)
  }
  return true
}

// ── Firebase ID token verification (for admin endpoints) ────────────────────
async function getGoogleJwks() {
  const now = Date.now()
  if (cachedJwks && now < cachedJwksExpiry) return cachedJwks
  const res = await fetch(GOOGLE_JWKS_URL)
  if (!res.ok) throw new Error(`Failed to fetch Google JWKS: ${res.status}`)
  const data = await res.json()
  cachedJwks = data.keys || []
  cachedJwksExpiry = now + 3600 * 1000
  return cachedJwks
}

// Verify a Firebase ID token. Returns { valid, user, error }.
export async function verifyFirebaseIdToken(token, projectId) {
  if (!token) return { valid: false, error: 'Missing Authorization token' }
  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false, error: 'Malformed token' }

  let header
  let payload
  try {
    header = decodeJwtPart(parts[0])
    payload = decodeJwtPart(parts[1])
  } catch {
    return { valid: false, error: 'Could not parse token' }
  }

  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) return { valid: false, error: 'Token expired' }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    return { valid: false, error: 'Invalid token issuer' }
  }
  if (payload.aud !== projectId) return { valid: false, error: 'Invalid token audience' }
  if (!payload.sub) return { valid: false, error: 'Invalid token subject' }

  try {
    const keys = await getGoogleJwks()
    const matchingKey = keys.find((k) => k.kid === header.kid)
    if (!matchingKey) return { valid: false, error: 'Unknown token signing key' }
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      matchingKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      base64UrlToUint8Array(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    )
    if (!verified) return { valid: false, error: 'Token signature verification failed' }
  } catch (err) {
    console.error('[firebase] Token verification error:', err.message)
    return { valid: false, error: 'Token verification failed' }
  }

  return { valid: true, user: payload }
}

// Verify that the caller is a signed-in Firebase user flagged as an admin in
// Firestore (`admins/{uid}.isAdmin == true`). Returns { ok, uid, email, error }.
export async function requireAdmin(request, env) {
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) return { ok: false, status: 401, error: 'Sign in to continue.' }

  const { projectId } = getFirebaseCredentials(env)
  const result = await verifyFirebaseIdToken(token, projectId)
  if (!result.valid) return { ok: false, status: 401, error: result.error }

  const uid = result.user.sub
  const email = (result.user.email || '').toLowerCase()

  // Firebase Auth email allowlist (defence in depth alongside Firestore rules).
  const allowlist = (env.ADMIN_EMAILS || 'purplebeecakess@gmail.com')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (allowlist.length && !allowlist.includes(email)) {
    return { ok: false, status: 403, error: `${email || 'This account'} is not an admin.` }
  }

  try {
    const record = await firestoreGet(env, 'admins', uid)
    if (!record || record.isAdmin !== true) {
      return { ok: false, status: 403, error: 'This account does not have admin access.' }
    }
  } catch (err) {
    console.error('[firebase] Admin lookup failed:', err.message)
    return { ok: false, status: 500, error: 'Could not verify admin access.' }
  }

  return { ok: true, uid, email }
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  })
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
