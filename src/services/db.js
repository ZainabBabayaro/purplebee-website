// ============================================================================
// db — unified data service (Firebase in production, local fallback in dev)
// ----------------------------------------------------------------------------
// All pages call this module, never Firebase directly, so the backend can be
// swapped via configuration with no component changes.
// ============================================================================

import {
  isFirebaseConfigured,
  initFirebase,
} from '../config/firebase.js'
import { localdb } from './localdb.js'
import { collections as staticCollections } from '../data/collections.js'
import { normalizeCollection } from '../data/collections.js'
import {
  normalizeProduct,
  isProductAvailable,
} from '../data/cakes.js'

// Re-export for convenience.
export { isFirebaseConfigured }

// Helper: ensures Firebase is ready before any Firestore/Auth call.
// Returns { db, auth, app } from the lazily-initialised firebase module.
async function getFirebase() {
  await initFirebase()
  // Re-import after init so we get the populated values, not the initial nulls.
  const firebase = await import('../config/firebase.js')
  if (!firebase.db) throw new Error('Firebase db not initialised — check your firebase config.')
  return { db: firebase.db, auth: firebase.auth, app: firebase.app }
}

// Re-export auth as a getter so components can await it.
export async function getAuth() {
  const { auth } = await getFirebase()
  return auth
}

// ── Order status vocabulary ──────────────────────────────────────────────────
// Payment and fulfilment are deliberately separate. The legacy `status` field
// is still written for backward compatibility with older order records.
export const STATUS = {
  PENDING: 'pending_payment',
  NEW: 'new',
  CONFIRMED: 'confirmed',
  BAKING: 'baking',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}
export const STATUS_FLOW = [
  STATUS.PENDING,
  STATUS.NEW,
  STATUS.CONFIRMED,
  STATUS.BAKING,
  STATUS.READY,
  STATUS.COMPLETED,
  STATUS.CANCELLED,
]
export const STATUS_LABEL = {
  pending_payment: 'Awaiting payment',
  new: 'New',
  confirmed: 'Confirmed',
  baking: 'In production',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}
export const PAYMENT_STATUS_LABEL = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const FULFILMENT_STATUS = {
  AWAITING_PAYMENT: 'awaiting_payment',
  CONFIRMED: 'confirmed',
  IN_PRODUCTION: 'in_production',
  READY_FOR_COLLECTION: 'ready_for_collection',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}
export const FULFILMENT_FLOW = [
  FULFILMENT_STATUS.AWAITING_PAYMENT,
  FULFILMENT_STATUS.CONFIRMED,
  FULFILMENT_STATUS.IN_PRODUCTION,
  FULFILMENT_STATUS.READY_FOR_COLLECTION,
  FULFILMENT_STATUS.OUT_FOR_DELIVERY,
  FULFILMENT_STATUS.COMPLETED,
  FULFILMENT_STATUS.CANCELLED,
]
export const FULFILMENT_LABEL = {
  awaiting_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  in_production: 'In production',
  ready_for_collection: 'Ready for collection',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const LEGACY_TO_FULFILMENT = {
  pending_payment: FULFILMENT_STATUS.AWAITING_PAYMENT,
  new: FULFILMENT_STATUS.CONFIRMED,
  confirmed: FULFILMENT_STATUS.CONFIRMED,
  baking: FULFILMENT_STATUS.IN_PRODUCTION,
  ready: FULFILMENT_STATUS.READY_FOR_COLLECTION,
  completed: FULFILMENT_STATUS.COMPLETED,
  cancelled: FULFILMENT_STATUS.CANCELLED,
}

const PAID_LEGACY_STATUSES = new Set(['confirmed', 'baking', 'ready', 'completed'])

export function normalizeOrder(order) {
  if (!order) return order
  const o = { ...order }
  o.paymentStatus = o.paymentStatus || (PAID_LEGACY_STATUSES.has(o.status) ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING)
  o.fulfilmentStatus = o.fulfilmentStatus || LEGACY_TO_FULFILMENT[o.status] || FULFILMENT_STATUS.AWAITING_PAYMENT
  o.items = (o.items || []).map((item) => {
    const unitPrice = Number(item.unitPrice ?? item.price) || 0
    const qty = Number(item.qty) || 1
    return {
      ...item,
      unitPrice,
      price: Number(item.price ?? unitPrice) || 0,
      qty,
      subtotal: Number(item.subtotal ?? unitPrice * qty) || 0,
    }
  })
  o.subtotal = Number(o.subtotal ?? o.total) || 0
  o.deliveryFee = Number(o.deliveryFee) || 0
  o.total = Number(o.total) || 0
  return o
}

// ---- Local fallback --------------------------------------------------------
const local = localdb

// ---- Firestore REST helpers ------------------------------------------------
// Public inventory/collection reads use the Firestore REST API so guests can
// browse without signing in. Writes still go through the Firebase SDK + rules.
const FIRESTORE_PROJECT = 'purplebeecakes01'

function parseFirestoreValue(v) {
  if (!v || typeof v !== 'object') return null
  if (v.stringValue !== undefined) return v.stringValue
  if (v.integerValue !== undefined) return Number(v.integerValue)
  if (v.doubleValue !== undefined) return Number(v.doubleValue)
  if (v.booleanValue !== undefined) return v.booleanValue
  if (v.nullValue !== undefined) return null
  if (v.timestampValue !== undefined) return v.timestampValue
  if (v.arrayValue) return (v.arrayValue.values || []).map(parseFirestoreValue)
  if (v.mapValue) {
    const obj = {}
    Object.entries(v.mapValue.fields || {}).forEach(([k, val]) => {
      obj[k] = parseFirestoreValue(val)
    })
    return obj
  }
  return null
}

async function restList(collectionName) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/${collectionName}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Firestore REST error: ${res.status}`)
  const json = await res.json()
  if (!json.documents) return []
  return json.documents.map((doc) => {
    const id = doc.name.split('/').pop()
    const fields = doc.fields || {}
    const record = { id }
    Object.entries(fields).forEach(([k, v]) => { record[k] = parseFirestoreValue(v) })
    return record
  })
}

async function sdkList(collectionName) {
  const { db } = await getFirebase()
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, collectionName))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function listCollection(collectionName) {
  try {
    return await restList(collectionName)
  } catch (err) {
    console.error(`[${collectionName}] REST fetch failed, trying SDK:`, err.message)
    try {
      return await sdkList(collectionName)
    } catch (sdkErr) {
      console.error(`[${collectionName}] SDK fallback also failed:`, sdkErr.message)
      return []
    }
  }
}

// ---- Firebase implementation ----------------------------------------------
async function fbGetInventory() {
  const rows = await listCollection('inventory')
  return rows
    .map(normalizeProduct)
    .filter(Boolean)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || '').localeCompare(b.name || ''))
}

async function fbAddProduct(product) {
  const { db } = await getFirebase()
  const { collection, doc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  const id = product.id || product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  await setDoc(doc(collection(db, 'inventory'), id), {
    ...product,
    id,
    slug: product.slug || id,
    stock: product.stock ?? 0,
    active: product.active !== false,
    available: product.available !== false,
    trackStock: product.trackStock !== false,
    createdAt: product.createdAt || now,
    updatedAt: now,
  })
  return { id }
}

async function fbUpdateProduct(id, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'inventory', id), { ...patch, updatedAt: new Date().toISOString() })
}

async function fbDeleteProduct(id) {
  const { db } = await getFirebase()
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'inventory', id))
}

async function fbArchiveProduct(id) {
  return fbUpdateProduct(id, { active: false, archived: true })
}

// Upload an image — prefers Cloudflare R2 (/api/upload), with fallback to Firebase Storage.
// Accepts a base64 data-URL (from the image picker) or a File/Blob.
async function fbUploadProductImage(productId, file) {
  const errors = []

  // 1. Try Cloudflare Pages R2 endpoint (/api/upload)
  try {
    const { auth } = await getFirebase()
    let token = null
    if (auth?.currentUser) {
      token = await auth.currentUser.getIdToken()
    }
    const blob = await toBlob(file)
    const ext = (file.name || 'image').split('.').pop() || (blob.type.split('/')[1] || 'jpg')
    const formData = new FormData()
    formData.append('file', blob, `${productId}.${ext}`)
    formData.append('productId', productId)

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const contentType = res.headers.get('content-type') || ''
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json()
      if (data?.url) return data.url
    } else {
      const errJson = contentType.includes('application/json')
        ? await res.json().catch(() => ({}))
        : {}
      errors.push(`R2: ${errJson.error || `HTTP ${res.status}`}`)
    }
  } catch (err) {
    errors.push(`R2: ${err.message}`)
  }

  // 2. Fallback to Firebase Storage if R2 is not reachable or not yet configured
  try {
    const { app } = await getFirebase()
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const storage = getStorage(app)
    const blob = await toBlob(file)
    const ext = (file.name || 'image').split('.').pop() || 'jpg'
    const storageRef = ref(storage, `products/${productId}/${Date.now()}.${ext}`)
    const snap = await uploadBytes(storageRef, blob)
    return getDownloadURL(snap.ref)
  } catch (fbErr) {
    errors.push(`Firebase Storage: ${fbErr.message}`)
  }

  throw new Error(
    `Image upload failed. ${errors.join(' · ')}. ` +
    'Check the R2 bucket binding or Firebase Storage rules in the deployment settings.',
  )
}

// Convert a base64 data-URL, File, or Blob into a Blob.
async function toBlob(file) {
  if (file instanceof Blob) return file
  if (typeof file === 'string' && file.startsWith('data:')) {
    const [header, base64] = file.split(',', 2)
    const mime = (header.match(/:(.*?);/) || [])[1] || 'application/octet-stream'
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return new Blob([bytes], { type: mime })
  }
  throw new Error('Unsupported image format')
}

async function fbSeedInventory(items) {
  const { db } = await getFirebase()
  const { collection, doc, getDoc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  let added = 0
  let skipped = 0
  for (const it of items) {
    const ref = doc(collection(db, 'inventory'), it.id)
    const existing = await getDoc(ref)
    if (existing.exists()) { skipped++; continue }
    await setDoc(ref, {
      ...it,
      createdAt: now,
      updatedAt: now,
    })
    added++
  }
  return { added, skipped }
}

// ---- Collections -----------------------------------------------------------
async function fbGetCollections() {
  const rows = await listCollection('collections')
  return rows
    .map(normalizeCollection)
    .filter(Boolean)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name))
}

async function fbAddCollection(collection) {
  const { db } = await getFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  const id = collection.id || collection.slug || collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  await setDoc(doc(db, 'collections', id), {
    ...collection,
    id,
    slug: collection.slug || id,
    visible: collection.visible !== false,
    published: collection.published !== false,
    productIds: Array.isArray(collection.productIds) ? collection.productIds : [],
    displayOrder: Number(collection.displayOrder) || 0,
    createdAt: collection.createdAt || now,
    updatedAt: now,
  })
  return { id }
}

async function fbUpdateCollection(id, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'collections', id), { ...patch, updatedAt: new Date().toISOString() })
}

async function fbDeleteCollection(id) {
  const { db } = await getFirebase()
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'collections', id))
}

async function fbSeedCollections() {
  const { db } = await getFirebase()
  const { doc, getDoc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  let added = 0
  let skipped = 0
  for (const c of staticCollections) {
    const ref = doc(db, 'collections', c.slug)
    const existing = await getDoc(ref)
    if (existing.exists()) { skipped++; continue }
    await setDoc(ref, { ...c, id: c.slug, createdAt: now, updatedAt: now })
    added++
  }
  return { added, skipped }
}

// ---- Enquiries -------------------------------------------------------------
async function fbAddEnquiry(enquiry) {
  const { db } = await getFirebase()
  const { collection, addDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  const ref = await addDoc(collection(db, 'enquiries'), {
    ...enquiry,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  })
  return { id: ref.id }
}

async function fbAddMail(mail) {
  const { db } = await getFirebase()
  const { collection, addDoc } = await import('firebase/firestore')
  const ref = await addDoc(collection(db, 'mail'), {
    ...mail,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id }
}

async function fbGetEnquiries() {
  const rows = await listCollection('enquiries')
  return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

async function fbUpdateEnquiry(id, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'enquiries', id), { ...patch, updatedAt: new Date().toISOString() })
}

// ---- Orders ----------------------------------------------------------------
async function fbCreateOrder(order) {
  const { db } = await getFirebase()
  const { collection, doc, runTransaction, increment } = await import('firebase/firestore')
  const orderRef = doc(collection(db, 'orders'))
  const orderId = orderRef.id

  const stockLines = (order.items || []).filter((i) => i.trackStock !== false && i.custom !== true && i.id)

  await runTransaction(db, async (tx) => {
    const refs = stockLines.map((i) => doc(db, 'inventory', i.id))
    const snaps = await Promise.all(refs.map((r) => tx.get(r)))
    for (let i = 0; i < stockLines.length; i++) {
      const item = stockLines[i]
      const data = snaps[i].data()
      if (!data) throw new Error(`"${item.name}" is no longer available.`)
      if (data.active === false || data.available === false) {
        throw new Error(`"${item.name}" is not currently available.`)
      }
      const tracked = data.trackStock !== false
      if (tracked && (data.stock ?? 0) < item.qty) {
        throw new Error(`Only ${data.stock ?? 0} × "${item.name}" left in stock.`)
      }
      if (tracked) tx.update(refs[i], { stock: increment(-item.qty) })
    }
    tx.set(orderRef, {
      ...order,
      id: orderId,
      status: order.status || 'pending_payment',
      paymentStatus: order.paymentStatus || PAYMENT_STATUS.PENDING,
      fulfilmentStatus: order.fulfilmentStatus || FULFILMENT_STATUS.AWAITING_PAYMENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })
  return { id: orderId }
}

async function fbGetOrder(id) {
  const { db } = await getFirebase()
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'orders', id))
  return snap.exists() ? normalizeOrder({ id: snap.id, ...snap.data() }) : null
}

async function fbUpdateOrder(id, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'orders', id), { ...patch, updatedAt: new Date().toISOString() })
}

async function fbGetMyOrders(uid) {
  const { db } = await getFirebase()
  const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => normalizeOrder({ id: d.id, ...d.data() }))
}

async function fbGetAllOrders() {
  const { db } = await getFirebase()
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
  try {
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
    return snap.docs.map((d) => normalizeOrder({ id: d.id, ...d.data() }))
  } catch {
    // Fallback if index not ready — fetch all and sort client-side
    const { getDocs: gd, collection: col } = await import('firebase/firestore')
    const snap = await getDocs(col(db, 'orders'))
    return snap.docs
      .map((d) => normalizeOrder({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }
}

async function fbUpdateOrderStatus(id, status) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'orders', id), {
    status,
    fulfilmentStatus: LEGACY_TO_FULFILMENT[status] || status,
    updatedAt: new Date().toISOString(),
  })
}

// ---- Payment requests (admin-initiated Paystack link) ----------------------
async function fbRequestPayment(orderId) {
  const { auth } = await getFirebase()
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null
  const res = await fetch('/api/paystack-initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ orderId }),
  })
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Payment requests are not available in this environment.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not create a payment request.')
  return data
}

// ---- Checkout (server-authoritative, with local fallback) ------------------
async function clientCheckout(payload) {
  const inventory = await fbGetInventory()
  const lines = Array.isArray(payload.items) ? payload.items : []
  if (!lines.length) throw new Error('Your basket is empty.')

  const items = []
  for (const line of lines) {
    const productId = line.productId || line.id
    const product = inventory.find((p) => p.id === productId || p.slug === productId)
    if (!product) throw new Error(`"${line.name || 'An item'}" is no longer available.`)
    const p = normalizeProduct(product)
    if (!isProductAvailable(p)) throw new Error(`"${p.name}" is not currently available.`)
    const qty = Math.max(1, parseInt(line.qty, 10) || 1)
    if (p.trackStock && p.stock < qty) {
      throw new Error(`Only ${p.stock} × "${p.name}" left in stock.`)
    }
    const variantId = line.variantId || line.customisation?.variantId
    const variant = variantId ? (p.variants || []).find((v) => v.id === variantId) : null
    const unitPrice = variant ? Number(variant.price) : Number(p.price)
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`"${p.name}" has no valid price.`)
    }
    items.push({
      id: p.id,
      productId: p.id,
      lineId: line.lineId || line.id || `${p.id}-${variantId || 'standard'}`,
      slug: p.slug,
      name: p.name,
      productType: p.productType,
      purchaseType: p.purchaseType,
      imageUrl: p.image || '',
      qty,
      unitPrice,
      price: unitPrice,
      subtotal: unitPrice * qty,
      customisation: line.customisation || null,
      description: line.description || '',
    })
  }

  const subtotal = items.reduce((n, i) => n + i.subtotal, 0)
  const deliveryFee = Number(payload.deliveryFee) || 0
  const total = subtotal + deliveryFee
  const order = {
    ...payload,
    items,
    subtotal,
    deliveryFee,
    total,
    status: 'pending_payment',
    paymentStatus: PAYMENT_STATUS.PENDING,
    fulfilmentStatus: FULFILMENT_STATUS.AWAITING_PAYMENT,
  }
  const { id } = await fbCreateOrder(order)
  return { id, total, subtotal, deliveryFee, items }
}

async function fbCheckout(payload) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const contentType = res.headers.get('content-type') || ''
    if (res.ok && contentType.includes('application/json')) {
      return await res.json()
    }
    // No Pages Function in local dev — fall back to the client implementation,
    // which still re-reads inventory and recomputes every price.
    if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
      return clientCheckout(payload)
    }
    const errJson = await res.json().catch(() => ({}))
    throw new Error(errJson.error || 'Checkout could not be completed.')
  } catch (err) {
    if (err instanceof TypeError) return clientCheckout(payload)
    throw err
  }
}

// ---- Admin / auth ----------------------------------------------------------
async function fbIsAdmin(uid) {
  const { db } = await getFirebase()
  const { doc, getDoc } = await import('firebase/firestore')
  if (!uid) return false
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists() && snap.data()?.isAdmin === true
}

// ---- Blog ------------------------------------------------------------------
async function fbGetPosts(adminMode = false) {
  const { db } = await getFirebase()
  const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
  const col = collection(db, 'posts')
  try {
    const q = adminMode
      ? query(col, orderBy('createdAt', 'desc'))
      : query(col, where('published', '==', true), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ ...d.data(), slug: d.id }))
  } catch {
    const snap = await getDocs(col)
    const all = snap.docs.map((d) => ({ ...d.data(), slug: d.id }))
    return adminMode
      ? all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      : all.filter((p) => p.published === true).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }
}

async function fbGetPost(slug) {
  const { db } = await getFirebase()
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'posts', slug))
  return snap.exists() ? { ...snap.data(), slug: snap.id } : null
}

async function fbAddPost(post) {
  const { db } = await getFirebase()
  const { doc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  await setDoc(doc(db, 'posts', post.slug), { ...post, createdAt: now, updatedAt: now })
  return { slug: post.slug }
}

async function fbUpdatePost(slug, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'posts', slug), { ...patch, updatedAt: new Date().toISOString() })
}

async function fbDeletePost(slug) {
  const { db } = await getFirebase()
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'posts', slug))
}

async function fbGetComments(postSlug, adminMode = false) {
  const { db } = await getFirebase()
  const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
  const col = collection(db, 'comments')
  try {
    const q = adminMode
      ? query(col, where('postSlug', '==', postSlug), orderBy('createdAt', 'asc'))
      : query(col, where('postSlug', '==', postSlug), where('approved', '==', true), orderBy('createdAt', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    const snap = await getDocs(query(col, where('postSlug', '==', postSlug)))
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return adminMode
      ? all.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
      : all.filter((c) => c.approved).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  }
}

async function fbAddComment(comment) {
  const { db } = await getFirebase()
  const { collection, addDoc } = await import('firebase/firestore')
  const ref = await addDoc(collection(db, 'comments'), { ...comment, approved: false, createdAt: new Date().toISOString() })
  return { id: ref.id }
}

async function fbApproveComment(id, approved) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'comments', id), { approved })
}

async function fbDeleteComment(id) {
  const { db } = await getFirebase()
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'comments', id))
}

async function fbGetAllComments() {
  const { db } = await getFirebase()
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, 'comments'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Local fallback: convert the file to a base64 data URL stored in localStorage.
async function localUploadProductImage(productId, file) {
  if (typeof file === 'string') {
    await local.updateProduct(productId, { image: file, imageUrl: file })
    return file
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const url = reader.result // data:image/...;base64,...
      await local.updateProduct(productId, { image: url, imageUrl: url })
      resolve(url)
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsDataURL(file)
  })
}

// ---- Public API (picks implementation) -------------------------------------
export const dataApi = isFirebaseConfigured
  ? {
      isLocal: false,
      getInventory: fbGetInventory,
      getProduct: (id) => fbGetInventory().then((l) => l.find((p) => p.id === id || p.slug === id) || null),
      addProduct: fbAddProduct,
      updateProduct: fbUpdateProduct,
      deleteProduct: fbDeleteProduct,
      archiveProduct: fbArchiveProduct,
      uploadProductImage: fbUploadProductImage,
      seedInventory: fbSeedInventory,
      getCollections: fbGetCollections,
      addCollection: fbAddCollection,
      updateCollection: fbUpdateCollection,
      deleteCollection: fbDeleteCollection,
      seedCollections: fbSeedCollections,
      addEnquiry: fbAddEnquiry,
      addMail: fbAddMail,
      getEnquiries: fbGetEnquiries,
      updateEnquiry: fbUpdateEnquiry,
      checkout: fbCheckout,
      requestPayment: fbRequestPayment,
      createOrder: fbCreateOrder,
      getOrder: fbGetOrder,
      getMyOrders: fbGetMyOrders,
      getAllOrders: fbGetAllOrders,
      updateOrder: fbUpdateOrder,
      updateOrderStatus: fbUpdateOrderStatus,
      isAdmin: fbIsAdmin,
      getPosts: (adminMode) => fbGetPosts(adminMode),
      getPost: fbGetPost,
      addPost: fbAddPost,
      updatePost: fbUpdatePost,
      deletePost: fbDeletePost,
      getComments: fbGetComments,
      addComment: fbAddComment,
      approveComment: fbApproveComment,
      deleteComment: fbDeleteComment,
      getAllComments: fbGetAllComments,
      subscribe: () => () => {},
    }
  : {
      isLocal: true,
      getInventory: local.getInventory,
      getProduct: local.getProduct,
      addProduct: local.addProduct,
      updateProduct: local.updateProduct,
      deleteProduct: local.deleteProduct,
      archiveProduct: local.archiveProduct,
      uploadProductImage: localUploadProductImage,
      seedInventory: local.seedInventory,
      getCollections: local.getCollections,
      addCollection: local.addCollection,
      updateCollection: local.updateCollection,
      deleteCollection: local.deleteCollection,
      seedCollections: local.seedCollections,
      addEnquiry: local.addEnquiry,
      addMail: local.addMail,
      getEnquiries: local.getEnquiries,
      updateEnquiry: local.updateEnquiry,
      checkout: local.checkout,
      requestPayment: local.requestPayment,
      createOrder: local.createOrder,
      getOrder: local.getOrder,
      getMyOrders: local.getMyOrders,
      getAllOrders: local.getAllOrders,
      updateOrder: local.updateOrder,
      updateOrderStatus: local.updateOrderStatus,
      isAdmin: async () => false,
      getPosts: () => local.getPosts(),
      getPost: local.getPost,
      addPost: local.addPost,
      updatePost: local.updatePost,
      deletePost: local.deletePost,
      getComments: local.getComments,
      addComment: local.addComment,
      approveComment: local.approveComment,
      deleteComment: local.deleteComment,
      getAllComments: local.getAllComments,
      subscribe: local.subscribe,
    }
