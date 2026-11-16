// ============================================================================
// URL helpers — keep canonical URL formatting consistent across the site.
// ============================================================================

/**
 * Return a canonical path that ends with a trailing slash, except for the
 * homepage ('/') and paths that look like files (contain a dot in the final
 * segment). External URLs are returned unchanged.
 */
export function canonicalPath(path) {
  if (!path || path === '/') return '/'
  // External URL — leave alone.
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path
  // File path — leave alone.
  if (/\.[^/]+$/.test(path)) return path
  return path.endsWith('/') ? path : `${path}/`
}

/**
 * Convert a relative or absolute URL to an absolute URL on the preferred
 * canonical domain, normalising the path to include a trailing slash.
 */
export function canonicalUrl(path, baseUrl) {
  if (!path) return baseUrl
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path
  const normalised = canonicalPath(path)
  if (normalised.startsWith('/')) {
    return `${baseUrl.replace(/\/$/, '')}${normalised}`
  }
  return `${baseUrl.replace(/\/$/, '')}/${normalised}`
}
