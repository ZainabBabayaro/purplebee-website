// ============================================================================
// localdb — localStorage fallback for Firebase (dev only)
// ----------------------------------------------------------------------------
// Used automatically when Firebase isn't configured. This is a development
// mock: it is NOT secure (passwords are trivially encoded, data is local to
// this browser). Real security and persistence come from Firebase + rules.
// Mirrors the public API of services/db.js so swapping to Firebase is seamless.
// ============================================================================

import { cakes } from '../data/cakes.js'
import { normalizeProduct, isProductAvailable } from '../data/cakes.js'
import { collections as staticCollections, normalizeCollection } from '../data/collections.js'
import { ADMIN_EMAILS } from '../config/firebase.js'

const KEYS = {
  inv: 'pb_inventory_v2',
  collections: 'pb_collections_v1',
  enquiries: 'pb_enquiries_v1',
  orders: 'pb_orders',
  users: 'pb_users',
  session: 'pb_session',
  posts: 'pb_posts',
  comments: 'pb_comments',
  mail: 'pb_mail_v1',
}

const listeners = new Set()
const isClient = typeof window !== 'undefined'

function read(key, def) {
  if (!isClient) return def
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : def
  } catch {
    return def
  }
}
function write(key, value) {
  if (!isClient) return
  localStorage.setItem(key, JSON.stringify(value))
  listeners.forEach((l) => {
    try { l() } catch { /* ignore */ }
  })
}

function encode(pw) {
  return btoa(unescape(encodeURIComponent(pw)))
}

function seedInventory() {
  let inv = read(KEYS.inv, null)
  if (!inv) {
    const now = new Date().toISOString()
    inv = cakes.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      productType: c.productType || 'cake',
      purchaseType: c.purchaseType || (c.productType === 'cake' ? 'configurable' : 'simple'),
      paletteKey: c.paletteKey,
      collectionSlug: c.collectionSlug,
      collectionSlugs: c.collectionSlugs || [],
      collectionName: c.collectionName,
      occasion: c.occasion,
      summary: c.summary,
      description: c.description || '',
      price: c.price,
      stock: c.stock,
      active: c.active !== false,
      available: true,
      trackStock: true,
      displayOrder: c.displayOrder || 0,
      image: c.image || '',
      imageUrl: c.image || '',
      images: c.images || [],
      tiered: !!c.tiered,
      variants: c.variants || [],
      createdAt: now,
      updatedAt: now,
    }))
    write(KEYS.inv, inv)
  }
  return inv
}

function seedCollections() {
  let list = read(KEYS.collections, null)
  if (!list) {
    list = staticCollections.map((c) => ({ ...c, id: c.slug }))
    write(KEYS.collections, list)
  }
  return list
}

export const localdb = {
  isLocal: true,

  // ---- Inventory ----
  async addProduct(product) {
    const inv = seedInventory()
    const id = product.id || product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (inv.find((p) => p.id === id)) throw new Error('A product with this name already exists.')
    const now = new Date().toISOString()
    const full = {
      ...product,
      id,
      slug: product.slug || id,
      stock: product.stock ?? 0,
      active: product.active !== false,
      available: product.available !== false,
      trackStock: product.trackStock !== false,
      createdAt: now,
      updatedAt: now,
    }
    inv.push(full)
    write(KEYS.inv, inv)
    return { id }
  },
  async getInventory() {
    return seedInventory()
      .map(normalizeProduct)
      .filter(Boolean)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || '').localeCompare(b.name || ''))
  },
  async getProduct(id) {
    return seedInventory().find((p) => p.id === id || p.slug === id) || null
  },
  async updateProduct(id, patch) {
    const inv = seedInventory()
    const p = inv.find((x) => x.id === id)
    if (p) Object.assign(p, patch, { updatedAt: new Date().toISOString() })
    write(KEYS.inv, inv)
  },
  async deleteProduct(id) {
    write(KEYS.inv, seedInventory().filter((p) => p.id !== id))
  },
  async archiveProduct(id) {
    return this.updateProduct(id, { active: false, archived: true })
  },
  async seedInventory() {
    const before = read(KEYS.inv, []).length
    seedInventory()
    const after = read(KEYS.inv, []).length
    return { added: Math.max(0, after - before), skipped: Math.max(0, cakes.length - after) }
  },
  // Local fallback: images are already base64 data-URLs, so just return them.
  async uploadProductImage(_productId, file) {
    return typeof file === 'string' ? file : URL.createObjectURL(file)
  },

  // ---- Collections ----
  async getCollections() {
    return seedCollections().map(normalizeCollection).filter(Boolean)
  },
  async addCollection(collection) {
    const list = seedCollections()
    const id = collection.id || collection.slug || collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (list.find((c) => c.id === id)) throw new Error('A collection with this name already exists.')
    const now = new Date().toISOString()
    list.push({
      ...collection,
      id,
      slug: collection.slug || id,
      productIds: collection.productIds || [],
      visible: collection.visible !== false,
      published: collection.published !== false,
      createdAt: now,
      updatedAt: now,
    })
    write(KEYS.collections, list)
    return { id }
  },
  async updateCollection(id, patch) {
    const list = seedCollections()
    const c = list.find((x) => x.id === id)
    if (c) Object.assign(c, patch, { updatedAt: new Date().toISOString() })
    write(KEYS.collections, list)
  },
  async deleteCollection(id) {
    write(KEYS.collections, seedCollections().filter((c) => c.id !== id))
  },
  async seedCollections() {
    const before = read(KEYS.collections, []).length
    seedCollections()
    const after = read(KEYS.collections, []).length
    return { added: Math.max(0, after - before), skipped: Math.max(0, staticCollections.length - after) }
  },

  // ---- Enquiries ----
  async addEnquiry(enquiry) {
    const list = read(KEYS.enquiries, [])
    const id = 'enq_' + Math.random().toString(36).slice(2, 10)
    const now = new Date().toISOString()
    list.unshift({
      ...enquiry,
      id,
      status: 'new',
      internalNotes: '',
      quotedPrice: null,
      quoteNotes: '',
      createdAt: now,
      updatedAt: now,
    })
    write(KEYS.enquiries, list)
    return { id }
  },

  async addMail(mail) {
    const list = read(KEYS.mail, [])
    list.unshift({ ...mail, id: 'mail_' + Math.random().toString(36).slice(2, 10), createdAt: new Date().toISOString() })
    write(KEYS.mail, list)
    return { id: list[0].id }
  },
  async getEnquiries() {
    return read(KEYS.enquiries, []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  },
  async updateEnquiry(id, patch) {
    const list = read(KEYS.enquiries, [])
    const e = list.find((x) => x.id === id)
    if (e) Object.assign(e, patch, { updatedAt: new Date().toISOString() })
    write(KEYS.enquiries, list)
  },

  // ---- Comments ----
  async getComments(postSlug, adminMode = false) {
    const all = read(KEYS.comments, []).filter((c) => c.postSlug === postSlug)
    return adminMode ? all : all.filter((c) => c.approved)
  },
  async addComment(comment) {
    const comments = read(KEYS.comments, [])
    const id = 'cmt_' + Math.random().toString(36).slice(2, 10)
    comments.push({ ...comment, id, approved: false, createdAt: new Date().toISOString() })
    write(KEYS.comments, comments)
    return { id }
  },
  async approveComment(id, approved) {
    const comments = read(KEYS.comments, [])
    const c = comments.find((x) => x.id === id)
    if (c) { c.approved = approved; write(KEYS.comments, comments) }
  },
  async deleteComment(id) {
    write(KEYS.comments, read(KEYS.comments, []).filter((c) => c.id !== id))
  },
  async getAllComments() {
    return read(KEYS.comments, []).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  },

  // ---- Blog posts ----
  async getPosts() {
    return read(KEYS.posts, [])
  },
  async getPost(slug) {
    return read(KEYS.posts, []).find((p) => p.slug === slug) || null
  },
  async addPost(post) {
    const posts = read(KEYS.posts, [])
    if (posts.find((p) => p.slug === post.slug)) throw new Error('A post with this slug already exists.')
    const now = new Date().toISOString()
    const full = { ...post, createdAt: now, updatedAt: now }
    posts.unshift(full)
    write(KEYS.posts, posts)
    return { slug: post.slug }
  },
  async updatePost(slug, patch) {
    const posts = read(KEYS.posts, [])
    const i = posts.findIndex((p) => p.slug === slug)
    if (i !== -1) {
      posts[i] = { ...posts[i], ...patch, updatedAt: new Date().toISOString() }
      write(KEYS.posts, posts)
    }
  },
  async deletePost(slug) {
    const posts = read(KEYS.posts, []).filter((p) => p.slug !== slug)
    write(KEYS.posts, posts)
  },

  // ---- Orders ----
  async createOrder(order) {
    const inv = seedInventory()
    for (const item of order.items) {
      if (item.trackStock === false || item.custom === true || !item.id) continue
      const p = inv.find((x) => x.id === item.id)
      if (!p || (p.trackStock !== false && p.stock < item.qty)) {
        throw new Error(`"${item.name}" is no longer available in that quantity.`)
      }
    }
    for (const item of order.items) {
      if (item.trackStock === false || item.custom === true || !item.id) continue
      const p = inv.find((x) => x.id === item.id)
      if (p && p.trackStock !== false) p.stock -= item.qty
    }
    write(KEYS.inv, inv)

    const orders = read(KEYS.orders, [])
    const id = 'ord_' + Math.random().toString(36).slice(2, 10)
    const now = new Date().toISOString()
    const full = {
      ...order,
      id,
      status: order.status || 'pending_payment',
      paymentStatus: order.paymentStatus || 'pending',
      fulfilmentStatus: order.fulfilmentStatus || 'awaiting_payment',
      createdAt: now,
      updatedAt: now,
    }
    orders.unshift(full)
    write(KEYS.orders, orders)
    return { id }
  },
  async requestPayment(_orderId) {
    return {
      simulated: true,
      authorizationUrl: '',
      message: 'Payment requests require the deployed Paystack Pages Function.',
    }
  },
  async checkout(payload) {
    const inventory = await this.getInventory()
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
      if (p.trackStock && p.stock < qty) throw new Error(`Only ${p.stock} × "${p.name}" left in stock.`)
      const variantId = line.variantId || line.customisation?.variantId
      const variant = variantId ? (p.variants || []).find((v) => v.id === variantId) : null
      const unitPrice = variant ? Number(variant.price) : Number(p.price)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error(`"${p.name}" has no valid price.`)
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
    const { id } = await this.createOrder({
      ...payload,
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'pending_payment',
      paymentStatus: 'pending',
      fulfilmentStatus: 'awaiting_payment',
    })
    return { id, total, subtotal, deliveryFee, items }
  },
  async getOrder(id) {
    return read(KEYS.orders, []).find((o) => o.id === id) || null
  },
  async getMyOrders(uid) {
    return read(KEYS.orders, []).filter((o) => o.uid === uid)
  },
  async getAllOrders() {
    return read(KEYS.orders, [])
  },
  async updateOrder(id, patch) {
    const orders = read(KEYS.orders, [])
    const o = orders.find((x) => x.id === id)
    if (o) {
      Object.assign(o, patch, { updatedAt: new Date().toISOString() })
      write(KEYS.orders, orders)
    }
  },
  async updateOrderStatus(id, status) {
    const map = {
      pending_payment: 'awaiting_payment',
      new: 'confirmed',
      confirmed: 'confirmed',
      baking: 'in_production',
      ready: 'ready_for_collection',
      completed: 'completed',
      cancelled: 'cancelled',
    }
    return this.updateOrder(id, { status, fulfilmentStatus: map[status] || status })
  },

  // ---- Auth ----
  async signup({ email, password, displayName }) {
    const users = read(KEYS.users, [])
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.')
    }
    const user = {
      uid: 'usr_' + Math.random().toString(36).slice(2, 12),
      email,
      displayName: displayName || email.split('@')[0],
      password: encode(password),
    }
    users.push(user)
    write(KEYS.users, users)
    return writeSession(user)
  },
  async login({ email, password }) {
    const users = read(KEYS.users, [])
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase())
    if (!u || u.password !== encode(password)) {
      throw new Error('Incorrect email or password.')
    }
    return writeSession(u)
  },
  async logout() {
    localStorage.removeItem(KEYS.session)
    listeners.forEach((l) => {
      try {
        l()
      } catch {
        /* ignore */
      }
    })
  },
  getSession() {
    return read(KEYS.session, null)
  },

  // ---- Realtime-ish ----
  subscribe(cb) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}

function writeSession(user) {
  const session = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAdmin: ADMIN_EMAILS.includes((user.email || '').toLowerCase()),
  }
  write(KEYS.session, session)
  return session
}
