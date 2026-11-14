// ============================================================================
// Analytics helpers — push events to window.dataLayer for GTM/GA4 and fbq for
// Meta Pixel. These are thin wrappers that fail silently if the trackers are
// not loaded yet, so they never block user actions.
// ============================================================================

function isClient() {
  return typeof window !== 'undefined'
}

export function pushDataLayer(event, params = {}) {
  if (!isClient() || !window.dataLayer) return
  window.dataLayer.push({ event, ...params })
}

export function metaEvent(event, params = {}) {
  if (!isClient() || typeof window.fbq !== 'function') return
  window.fbq('track', event, params)
}

function productItem(product, qty = 1) {
  return {
    item_id: product.slug || product.id || product.productId || 'unknown',
    item_name: product.name || 'Unnamed product',
    item_category: product.collectionName || product.category || 'Cake',
    item_variant: product.variantId || product.customisation?.variantId || undefined,
    price: Number(product.price || product.unitPrice || 0),
    quantity: Number(qty) || 1,
  }
}

export function trackViewItem(product) {
  const item = productItem(product, 1)
  pushDataLayer('view_item', {
    ecommerce: {
      currency: 'NGN',
      value: item.price,
      items: [item],
    },
  })
  metaEvent('ViewContent', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price,
    currency: 'NGN',
  })
}

export function trackAddToCart(product, qty = 1) {
  const item = productItem(product, qty)
  pushDataLayer('add_to_cart', {
    ecommerce: {
      currency: 'NGN',
      value: item.price * item.quantity,
      items: [item],
    },
  })
  metaEvent('AddToCart', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price * item.quantity,
    currency: 'NGN',
  })
}

export function trackBeginCheckout(items = [], value = 0) {
  const lineItems = items.map((i) => productItem(i, i.qty))
  pushDataLayer('begin_checkout', {
    ecommerce: {
      currency: 'NGN',
      value: Number(value) || lineItems.reduce((n, i) => n + i.price * i.quantity, 0),
      items: lineItems,
    },
  })
  metaEvent('InitiateCheckout', {
    content_ids: lineItems.map((i) => i.item_id),
    value: Number(value) || lineItems.reduce((n, i) => n + i.price * i.quantity, 0),
    currency: 'NGN',
    num_items: lineItems.reduce((n, i) => n + i.quantity, 0),
  })
}

export function trackPurchase(orderId, value, items = []) {
  const lineItems = items.map((i) => productItem(i, i.qty))
  pushDataLayer('purchase', {
    ecommerce: {
      transaction_id: orderId,
      currency: 'NGN',
      value: Number(value),
      items: lineItems,
    },
  })
  metaEvent('Purchase', {
    content_ids: lineItems.map((i) => i.item_id),
    content_type: 'product',
    value: Number(value),
    currency: 'NGN',
    num_items: lineItems.reduce((n, i) => n + i.quantity, 0),
  })
}

export function trackGenerateLead(method = 'form') {
  pushDataLayer('generate_lead', { lead_method: method })
  metaEvent('Lead', { lead_method: method })
}

export function trackContact(method = 'whatsapp') {
  pushDataLayer('contact', { contact_method: method })
  metaEvent('Contact', { contact_method: method })
}

export function trackPageView(path) {
  pushDataLayer('page_view', { page_path: path })
}
