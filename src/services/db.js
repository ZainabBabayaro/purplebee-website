// ============================================================================
// db — unified data service (Firebase in production, local fallback in dev)
// ----------------------------------------------------------------------------
// All pages call this module, never Firebase directly, so the backend can be
// swapped via configuration with no component changes.
// ============================================================================

import {
  isFirebaseConfigured,
  db,
  auth,
} from '../config/firebase.js'
import { localdb } from './localdb.js'

// Re-export auth for convenience.
export { auth, isFirebaseConfigured }
export const STATUS = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  BAKING: 'baking',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}
export const STATUS_FLOW = [
  STATUS.NEW,
  STATUS.CONFIRMED,
  STATUS.BAKING,
  STATUS.READY,
  STATUS.COMPLETED,
  STATUS.CANCELLED,
]
export const STATUS_LABEL = {
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
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, 'inventory'))
  if (snap.empty) return []
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbAddProduct(product) {
  const { collection, doc, setDoc } = await import('firebase/firestore')
  const id = product.slug || product.name.toLowerCase().replace(/\s+/g, '-')
  await setDoc(doc(collection(db, 'inventory'), id), {
    ...product,
    id,
    stock: product.stock ?? 0,
    active: product.active !== false,
  })
  return { id }
}

async function fbUpdateProduct(id, patch) {
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'inventory', id), patch)
}

async function fbSeedInventory(items) {
  const { collection, doc, setDoc } = await import('firebase/firestore')
  await Promise.all(items.map((it) => setDoc(doc(collection(db, 'inventory'), it.id), it)))
}

async function fbCreateOrder(order) {
  const {
    collection,
    doc,
    runTransaction,
    increment,
  } = await import('firebase/firestore')
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
    tx.set(orderRef, { ...order, id: orderRef.id, status: 'new', createdAt: new Date().toISOString() })
  })
  return { id: orderRef.id }
}

async function fbGetMyOrders(uid) {
  const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(
    query(collection(db, 'orders'), where('uid', '==', uid), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbGetAllOrders() {
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function fbUpdateOrderStatus(id, status) {
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'orders', id), { status })
}

async function fbIsAdmin(uid) {
  const { doc, getDoc } = await import('firebase/firestore')
  if (!uid) return false
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists() && snap.data()?.isAdmin === true
}

// ---- Blog posts --------------------------------------------------------
async function fbGetPosts(adminMode = false) {
  const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
  const col = collection(db, 'posts')
  const q = adminMode
    ? query(col, orderBy('createdAt', 'desc'))
    : query(col, where('published', '==', true), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...d.data(), slug: d.id }))
}

async function fbGetPost(slug) {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'posts', slug))
  return snap.exists() ? { ...snap.data(), slug: snap.id } : null
}

async function fbAddPost(post) {
  const { doc, setDoc } = await import('firebase/firestore')
  const now = new Date().toISOString()
  await setDoc(doc(db, 'posts', post.slug), { ...post, createdAt: now, updatedAt: now })
  return { slug: post.slug }
}

async function fbUpdatePost(slug, patch) {
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'posts', slug), { ...patch, updatedAt: new Date().toISOString() })
}

async function fbDeletePost(slug) {
  const { doc, deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'posts', slug))
}

// Upload an image file to Firebase Storage and return the public download URL.
// The image is stored at products/{productId}/{filename}.
async function fbUploadProductImage(productId, file) {
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const { app } = await import('../config/firebase.js')
  const storage = getStorage(app)
  const ext = file.name.split('.').pop()
  const storageRef = ref(storage, `products/${productId}/${Date.now()}.${ext}`)
  const snap = await uploadBytes(storageRef, file)
  const url = await getDownloadURL(snap.ref)
  // Save the URL back to the product document.
  await fbUpdateProduct(productId, { imageUrl: url })
  return url
}

// Local fallback: convert the file to a base64 data URL stored in localStorage.
async function localUploadProductImage(productId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const url = reader.result // data:image/...;base64,...
      await local.updateProduct(productId, { imageUrl: url })
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
      subscribe: local.subscribe,
    }
