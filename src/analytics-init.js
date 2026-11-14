// ============================================================================
// Analytics initialisation — Meta Pixel + GA4 direct config
// ----------------------------------------------------------------------------
// This file runs once when the app starts. It initialises third-party
// trackers only when their IDs are configured in src/data/site.js. If no ID
// is set, the tracker is skipped silently and no external scripts are loaded.
// ============================================================================
import { site } from './data/site.js'

const { ga4MeasurementId, metaPixelId } = site.analytics || {}

// GA4 direct config (only needed if GA4 is not already configured in GTM).
if (ga4MeasurementId && typeof window !== 'undefined' && typeof window.gtag === 'function') {
  window.gtag('config', ga4MeasurementId)
}

// Meta Pixel base code (standard Facebook snippet).
if (metaPixelId && typeof window !== 'undefined') {
  if (!window.fbq) {
    const n = (window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!window._fbq) window._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []

    const t = document.createElement('script')
    t.async = true
    t.src = 'https://connect.facebook.net/en_US/fbevents.js'
    const s = document.getElementsByTagName('script')[0]
    s.parentNode.insertBefore(t, s)
  }
  window.fbq('init', metaPixelId)
  window.fbq('track', 'PageView')
}
