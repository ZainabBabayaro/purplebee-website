// ============================================================================
// catalogue — shared hooks for backend-driven products & collections
// ----------------------------------------------------------------------------
// The static catalogue is used for the initial (SSR/prerender) render and as a
// graceful fallback when Firestore has not been seeded yet. Once the client
// mounts, the admin-managed Firestore records replace it.
// ============================================================================

import { useEffect, useMemo, useState } from 'react'
import { dataApi } from './db.js'
import { cakes, normalizeProduct } from '../data/cakes.js'
import {
  collections as staticCollections,
  normalizeCollection,
  isCollectionVisible,
} from '../data/collections.js'

export const staticProducts = cakes.map(normalizeProduct)
export const staticCollectionList = staticCollections.map(normalizeCollection)

function orderProducts(list, collection) {
  const explicit = collection?.productIds || []
  const rank = new Map(explicit.map((id, i) => [id, i]))
  return [...list].sort((a, b) => {
    const ra = rank.has(a.id) ? rank.get(a.id) : rank.has(a.slug) ? rank.get(a.slug) : Infinity
    const rb = rank.has(b.id) ? rank.get(b.id) : rank.has(b.slug) ? rank.get(b.slug) : Infinity
    if (ra !== rb) return ra - rb
    if ((a.displayOrder || 0) !== (b.displayOrder || 0)) return (a.displayOrder || 0) - (b.displayOrder || 0)
    return (a.name || '').localeCompare(b.name || '')
  })
}

export function productsForCollection(products, collection, { includeHidden = false } = {}) {
  if (!collection) return []
  const explicit = collection.productIds || []
  const list = products.filter((p) => {
    if (!includeHidden && p.active === false) return false
    const slugs = p.collectionSlugs || []
    return slugs.includes(collection.slug) || explicit.includes(p.id) || explicit.includes(p.slug)
  })
  return orderProducts(list, collection)
}

export function useCatalogue({ includeHidden = false } = {}) {
  const [products, setProducts] = useState(staticProducts)
  const [collections, setCollections] = useState(staticCollectionList)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.allSettled([dataApi.getInventory(), dataApi.getCollections()])
      .then(([productResult, collectionResult]) => {
        if (!active) return
        if (productResult.status === 'fulfilled' && Array.isArray(productResult.value) && productResult.value.length) {
          setProducts(productResult.value.map(normalizeProduct).filter(Boolean))
        }
        if (collectionResult.status === 'fulfilled' && Array.isArray(collectionResult.value) && collectionResult.value.length) {
          setCollections(
            collectionResult.value.map((c) => {
              const fallback = staticCollectionList.find(
                (sc) => sc.slug === c.slug || sc.id === c.id,
              )
              return normalizeCollection({
                ...fallback,
                ...c,
                bannerImage: c.bannerImage || fallback?.bannerImage || '',
              })
            }).filter(Boolean),
          )
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visibleProducts = useMemo(
    () => products.filter((p) => includeHidden || p.active !== false),
    [products, includeHidden],
  )
  const visibleCollections = useMemo(
    () => collections
      .filter((c) => includeHidden || isCollectionVisible(c))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name)),
    [collections, includeHidden],
  )

  return { products, visibleProducts, collections, visibleCollections, loading }
}

export function useProduct(slug) {
  const initial = useMemo(
    () => staticProducts.find((p) => p.slug === slug || p.id === slug) || null,
    [slug],
  )
  const [product, setProduct] = useState(initial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    dataApi.getProduct(slug)
      .then((p) => {
        if (!active) return
        if (p) setProduct(normalizeProduct(p))
        else if (!initial) setProduct(null)
      })
      .catch(() => { /* keep static fallback */ })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug, initial])

  return { product, loading }
}

export function useCollection(slug) {
  const initial = useMemo(
    () => staticCollectionList.find((c) => c.slug === slug || c.id === slug) || null,
    [slug],
  )
  const [collection, setCollection] = useState(initial)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    dataApi.getCollections()
      .then((list) => {
        if (!active) return
        const found = (list || []).find((c) => c && (c.slug === slug || c.id === slug))
        if (found) {
          setCollection(
            normalizeCollection({
              ...initial,
              ...found,
              bannerImage: found.bannerImage || initial?.bannerImage || '',
            }),
          )
        } else if (!initial) setCollection(null)
      })
      .catch(() => { /* keep static fallback */ })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug, initial])

  return { collection, loading }
}
