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

// Re-export for convenience.
export { isFirebaseConfigured }

// Helper: ensures Firebase is ready before any Firestore/Auth call.
// Returns { db, auth, app } from the lazily-initialised firebase module.
async function getFirebase() {
  await initFirebase()
  const { db, auth, app } = await import('../config/firebase.js')
  return { db, auth, app }
}

// Re-export auth as a getter so components can await it.
export async function getAuth() {
  const { auth } = await getFirebase()
  return auth
}
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

// ---- Local fallback --------------------------------------------------------
const local = localdb

// ---- Firebase implementation ----------------------------------------------
async function fbGetInventory() {
  const { db } = await getFirebase()
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, 'inventory'))
  if (snap.empty) return []
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbAddProduct(product) {
  const { db } = await getFirebase()
  const { collection, doc, setDoc } = await import('firebase/firestore')
  const id = product.slug || product.name.toLowerCase().replace(/\s+/g, '-')
  await setDoc(doc(collection(db, 'inventory'), id), {
    ...product, id, stock: product.stock ?? 0, active: product.active !== false,
  })
  return { id }
}

async function fbUpdateProduct(id, patch) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  // patch may include price, stock, active, imageUrl, etc. Firestore merges top-level keys.
  await updateDoc(doc(db, 'inventory', id), patch)
}

// Upload an image — prefers Cloudflare R2 (/api/upload), with fallback to Firebase Storage.
// Accepts a base64 data-URL (from the image picker) or a File/Blob.
async function fbUploadProductImage(productId, file) {
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

    if (res.ok) {
      const data = await res.json()
      if (data?.url) return data.url
    } else {
      const errJson = await res.json().catch(() => ({}))
      console.warn('Cloudflare R2 upload returned status ' + res.status + ':', errJson.error || res.statusText)
    }
  } catch (err) {
    console.warn('Cloudflare R2 endpoint unavailable, attempting Firebase Storage fallback:', err)
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
    console.error('All storage upload attempts failed:', fbErr)
    throw new Error('Failed to upload product image to both Cloudflare R2 and Firebase Storage: ' + fbErr.message)
  }
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
  const { collection, doc, setDoc } = await import('firebase/firestore')
  await Promise.all(items.map((it) => setDoc(doc(collection(db, 'inventory'), it.id), it)))
}

async function fbCreateOrder(order) {
  const { db } = await getFirebase()
  const { collection, doc, runTransaction, increment } = await import('firebase/firestore')
  const orderRef = doc(collection(db, 'orders'))
  await runTransaction(db, async (tx) => {
    const refs = order.items.map((i) => doc(db, 'inventory', i.id))
    const snaps = await Promise.all(refs.map((r) => tx.get(r)))
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i]
      const data = snaps[i].data()
      if (!data || (data.stock ?? 0) < item.qty) {
        throw new Error(`"${item.name}" is no longer available in that quantity.`)
      }
      tx.update(refs[i], { stock: increment(-item.qty) })
    }
    tx.set(orderRef, { ...order, id: orderRef.id, status: order.status || 'new', createdAt: new Date().toISOString() })
  })
  return { id: orderRef.id }
}

async function fbGetMyOrders(uid) {
  const { db } = await getFirebase()
  const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbGetAllOrders() {
  const { db } = await getFirebase()
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbUpdateOrderStatus(id, status) {
  const { db } = await getFirebase()
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'orders', id), { status })
}

async function fbIsAdmin(uid) {
  const { db } = await getFirebase()
  const { doc, getDoc } = await import('firebase/firestore')
  if (!uid) return false
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists() && snap.data()?.isAdmin === true
}

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
      getInventory: fbGetInventory,
      getProduct: (id) => fbGetInventory().then((l) => l.find((p) => p.id === id) || null),
      addProduct: fbAddProduct,
      updateProduct: fbUpdateProduct,
      uploadProductImage: fbUploadProductImage,
      seedInventory: fbSeedInventory,
      createOrder: fbCreateOrder,
      getMyOrders: fbGetMyOrders,
      getAllOrders: fbGetAllOrders,
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
      getInventory: local.getInventory,
      getProduct: local.getProduct,
      addProduct: local.addProduct,
      updateProduct: local.updateProduct,
      uploadProductImage: localUploadProductImage,
      seedInventory: async () => {},
      createOrder: local.createOrder,
      getMyOrders: local.getMyOrders,
      getAllOrders: local.getAllOrders,
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
