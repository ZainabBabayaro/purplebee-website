// ============================================================================
// localdb — localStorage fallback for Firebase (dev only)
// ----------------------------------------------------------------------------
// Used automatically when Firebase isn't configured. This is a development
// mock: it is NOT secure (passwords are trivially encoded, data is local to
// this browser). Real security and persistence come from Firebase + rules.
// Mirrors the public API of services/db.js so swapping to Firebase is seamless.
// ============================================================================

import { cakes } from '../data/cakes.js'
import { ADMIN_EMAILS } from '../config/firebase.js'

const KEYS = {
  inv: 'pb_inventory',
  orders: 'pb_orders',
  users: 'pb_users',
  session: 'pb_session',
  posts: 'pb_posts',
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
    inv = cakes.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      paletteKey: c.paletteKey,
      collectionName: c.collectionName,
      occasion: c.occasion,
      summary: c.summary,
      price: c.price,
      stock: c.stock,
      active: c.active,
    }))
    write(KEYS.inv, inv)
  }
  return inv
}

export const localdb = {
  isLocal: true,

  // ---- Inventory ----
  async addProduct(product) {
    const inv = seedInventory()
    const id = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (inv.find((p) => p.id === id)) throw new Error('A product with this name already exists.')
    const full = { ...product, id, active: product.active !== false }
    inv.push(full)
    write(KEYS.inv, inv)
    return { id }
  },
  async getInventory() {
    return seedInventory()
  },
  async getProduct(id) {
    return seedInventory().find((p) => p.id === id) || null
  },
  async updateProduct(id, patch) {
    const inv = seedInventory()
    const p = inv.find((x) => x.id === id)
    if (p) Object.assign(p, patch)
    write(KEYS.inv, inv)
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
      const p = inv.find((x) => x.id === item.id)
      if (!p || p.stock < item.qty) {
        throw new Error(`"${item.name}" is no longer available in that quantity.`)
      }
    }
    for (const item of order.items) {
      inv.find((x) => x.id === item.id).stock -= item.qty
    }
    write(KEYS.inv, inv)

    const orders = read(KEYS.orders, [])
    const id = 'ord_' + Math.random().toString(36).slice(2, 10)
    const full = { ...order, id, status: 'new', createdAt: new Date().toISOString() }
    orders.unshift(full)
    write(KEYS.orders, orders)
    return { id }
  },
  async getMyOrders(uid) {
    return read(KEYS.orders, []).filter((o) => o.uid === uid)
  },
  async getAllOrders() {
    return read(KEYS.orders, [])
  },
  async updateOrderStatus(id, status) {
    const orders = read(KEYS.orders, [])
    const o = orders.find((x) => x.id === id)
    if (o) {
      o.status = status
      write(KEYS.orders, orders)
    }
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
