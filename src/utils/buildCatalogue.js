// ============================================================================
// Build-time catalogue loader — used by prerender.js
// ----------------------------------------------------------------------------
// Fetches the current product inventory and collections from Firestore so the
// static build reflects the live catalogue. Falls back to the static seed data
// when Firebase is not configured or when explicitly running without network.
// ============================================================================

import { isFirebaseConfigured, initFirebaseForBuild } from '../config/firebase.js'
import { cakes, normalizeProduct } from '../data/cakes.js'
import { collections as staticCollections, normalizeCollection } from '../data/collections.js'

export async function buildCatalogue() {
  if (!isFirebaseConfigured) {
    console.warn('[build] Firebase not configured — using static catalogue fallback.')
    return staticCatalogue()
  }

  try {
    await initFirebaseForBuild()
    const firebase = await import('../config/firebase.js')
    const { collection, getDocs } = await import('firebase/firestore')

    const [inventorySnap, collectionsSnap] = await Promise.all([
      getDocs(collection(firebase.db, 'inventory')),
      getDocs(collection(firebase.db, 'collections')),
    ])

    const products = inventorySnap.docs
      .map((d) => normalizeProduct({ id: d.id, ...d.data() }))
      .filter(Boolean)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || '').localeCompare(b.name || ''))

    const collections = collectionsSnap.docs
      .map((d) => normalizeCollection({ id: d.id, ...d.data() }))
      .filter(Boolean)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || '').localeCompare(b.name || ''))

    if (!products.length && !collections.length) {
      // Firestore returned empty collections. This is valid for a fresh project,
      // but warn so the build is not silent about it.
      console.warn('[build] Firestore returned no products or collections — using static fallback.')
      return staticCatalogue()
    }

    console.log(`[build] Fetched ${products.length} products and ${collections.length} collections from Firestore.`)
    return { products, collections, source: 'firestore' }
  } catch (err) {
    const allowFallback = process.env.ALLOW_STATIC_FALLBACK === '1' || process.env.ALLOW_STATIC_FALLBACK === 'true'
    if (!allowFallback) {
      throw new Error(
        `[build] Firestore catalogue fetch failed. ` +
        `Set ALLOW_STATIC_FALLBACK=1 to build from static seed data instead. ` +
        `Original error: ${err.message}`
      )
    }
    console.warn(`[build] Firestore fetch failed — using static fallback. Error: ${err.message}`)
    return staticCatalogue()
  }
}

function staticCatalogue() {
  return {
    products: cakes.map(normalizeProduct).filter(Boolean),
    collections: staticCollections.map(normalizeCollection).filter(Boolean),
    source: 'static',
  }
}
