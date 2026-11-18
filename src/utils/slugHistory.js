// ============================================================================
// Slug history helpers — keep permanent 301 redirect targets resolvable when
// products or collections are renamed.
// ============================================================================

/**
 * Return a normalized slug-history entry array.
 * Accepts undefined, an array of strings, or an array of { slug, changedAt }.
 */
export function normalizeSlugHistory(history = []) {
  if (!Array.isArray(history)) return []
  return history
    .map((item) => {
      if (typeof item === 'string') {
        return { slug: item, changedAt: new Date().toISOString() }
      }
      if (item && typeof item === 'object' && typeof item.slug === 'string') {
        return {
          slug: item.slug,
          changedAt: item.changedAt || new Date().toISOString(),
        }
      }
      return null
    })
    .filter(Boolean)
}

/**
 * Append a previous slug to the history when it actually changed.
 * Prevents duplicate entries and avoids appending the current slug.
 */
export function appendSlugHistory({ previousSlug, currentSlug, existingHistory = [] }) {
  if (!previousSlug || !currentSlug || previousSlug === currentSlug) {
    return normalizeSlugHistory(existingHistory)
  }
  const history = normalizeSlugHistory(existingHistory)
  const allSlugs = new Set([currentSlug, ...history.map((h) => h.slug)])
  if (allSlugs.has(previousSlug)) return history
  return [
    ...history,
    { slug: previousSlug, changedAt: new Date().toISOString() },
  ]
}

/**
 * Flatten a slug history so every historical slug points directly to the
 * current slug. This eliminates redirect chains (A -> B -> C becomes A -> C).
 */
export function flattenSlugRedirects(currentSlug, history = []) {
  if (!currentSlug) return []
  const seen = new Set([currentSlug])
  const redirects = []
  // Walk history newest-to-oldest so the most recent previous slug is handled
  // first; any older slug that overlaps is skipped.
  for (const entry of normalizeSlugHistory(history).slice().reverse()) {
    if (!entry.slug || seen.has(entry.slug)) continue
    seen.add(entry.slug)
    redirects.push({ from: entry.slug, to: currentSlug })
  }
  return redirects
}
