// ============================================================================
// POST /api/checkout — server-authoritative order creation
// ----------------------------------------------------------------------------
// The browser may only describe WHAT is being bought. Every price, availability
// check and stock adjustment is resolved here from Firestore. The returned
// total is the only amount the client is allowed to charge.
// ============================================================================

import {
  corsHeaders,
  firestoreGet,
  firestoreList,
  firestoreTransaction,
  handleOptions,
  hasFirebaseCredentials,
  jsonResponse,
} from '../_lib/firebase.js'

const MAX_QTY_PER_LINE = 50
const MAX_LINES = 40
const MAX_TEXT = 2000

const CUSTOMISATION_KEYS = [
  'size', 'servings', 'variantId', 'flavour', 'filling', 'covering',
  'eventType', 'celebrantGender', 'details', 'message', 'colour',
]

class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'CheckoutError'
    this.status = status
  }
}

function str(value, max = MAX_TEXT) {
  if (value === null || value === undefined) return ''
  return String(value).trim().slice(0, max)
}

function sanitiseCustomisation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const out = {}
  for (const key of CUSTOMISATION_KEYS) {
    const value = input[key]
    if (value === null || value === undefined || value === '') continue
    if (typeof value === 'object') continue
    out[key] = String(value).slice(0, 300)
  }
  return Object.keys(out).length ? out : null
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function productIsAvailable(product) {
  return product
    && product.active !== false
    && product.archived !== true
    && product.available !== false
}

function purchaseTypeFor(product) {
  if (product.purchaseType) return product.purchaseType
  return product.productType === 'cake' ? 'configurable' : 'simple'
}

function imageFor(product) {
  if (Array.isArray(product.images) && product.images.length) return String(product.images[0] || '')
  return String(product.imageUrl || product.image || '')
}

export async function onRequestOptions() {
  return handleOptions()
}

export async function onRequestPost({ request, env }) {
  if (!hasFirebaseCredentials(env)) {
    return jsonResponse(
      { error: 'Checkout is not configured on the server yet. Please contact us to place your order.' },
      503,
      corsHeaders(),
    )
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid checkout payload.' }, 400, corsHeaders())
  }

  const customerName = str(payload.customerName, 120)
  const customerEmail = str(payload.customerEmail, 200).toLowerCase()
  const customerPhone = str(payload.customerPhone, 40)
  const eventDate = str(payload.eventDate, 40)
  const eventType = str(payload.eventType, 80)
  const celebrantGender = str(payload.celebrantGender, 40)
  const delivery = payload.delivery === 'delivery' ? 'delivery' : 'collection'
  const flavour = str(payload.flavour, 200)
  const notes = str(payload.notes, 4000)
  const uid = str(payload.uid, 128) || 'guest'

  const fieldErrors = {}
  if (!customerName) fieldErrors.customerName = 'Please add your name.'
  if (!customerEmail) fieldErrors.customerEmail = 'Email is required.'
  else if (!isValidEmail(customerEmail)) fieldErrors.customerEmail = 'Enter a valid email.'
  if (!customerPhone) fieldErrors.customerPhone = 'Phone number is required.'
  if (!eventDate) fieldErrors.eventDate = 'Please add your event date.'
  if (!eventType) fieldErrors.eventType = 'Please choose the occasion.'
  if (Object.keys(fieldErrors).length) {
    return jsonResponse({ error: 'Please check the highlighted fields.', errors: fieldErrors }, 400, corsHeaders())
  }

  const lines = Array.isArray(payload.items) ? payload.items : []
  if (!lines.length) return jsonResponse({ error: 'Your basket is empty.' }, 400, corsHeaders())
  if (lines.length > MAX_LINES) return jsonResponse({ error: 'Too many items in one order.' }, 400, corsHeaders())

  const requested = []
  for (const line of lines) {
    const productId = str(line.productId || line.id, 200)
    if (!productId) {
      return jsonResponse({ error: 'An item in your basket is missing its product.' }, 400, corsHeaders())
    }
    requested.push({
      productId,
      qty: Math.max(1, Math.min(MAX_QTY_PER_LINE, parseInt(line.qty, 10) || 1)),
      variantId: str(line.variantId || line.customisation?.variantId, 120) || null,
      lineId: str(line.lineId || line.id, 200) || null,
      customisation: sanitiseCustomisation(line.customisation),
      description: str(line.description, 1000),
    })
  }

  const now = new Date().toISOString()
  const orderId = crypto.randomUUID()

  try {
    // Resolve slugs to document ids before the transaction. Prices and stock are
    // then re-read inside the transaction so concurrent buyers cannot oversell.
    const catalogue = await firestoreList(env, 'inventory')
    const byId = new Map(catalogue.map((p) => [p.id, p]))
    const bySlug = new Map(catalogue.map((p) => [p.slug, p]))
    const resolvedIds = []

    for (const line of requested) {
      const match = byId.get(line.productId) || bySlug.get(line.productId)
      if (!match) throw new CheckoutError(`"${line.productId}" is no longer available.`, 409)
      line.productId = match.id
      resolvedIds.push({ collection: 'inventory', id: match.id })
    }

    const items = await firestoreTransaction(env, resolvedIds, async (tx) => {
      const built = []

      for (const line of requested) {
        const product = tx.get('inventory', line.productId)
        if (!product) throw new CheckoutError(`"${line.productId}" is no longer available.`, 409)

        const name = str(product.name, 160) || 'Product'
        if (!productIsAvailable(product)) {
          throw new CheckoutError(`"${name}" is not currently available.`, 409)
        }

        const purchaseType = purchaseTypeFor(product)
        if (purchaseType === 'quotation') {
          throw new CheckoutError(
            `"${name}" is a bespoke item — please send a cake enquiry instead of checking out.`,
            400,
          )
        }

        const variants = Array.isArray(product.variants) ? product.variants : []
        let variant = null
        if (line.variantId) {
          variant = variants.find((v) => v && v.id === line.variantId) || null
          if (!variant) {
            throw new CheckoutError(`The selected size for "${name}" is no longer available.`, 409)
          }
        } else if (variants.length) {
          throw new CheckoutError(`Please choose a size for "${name}".`, 400)
        }

        const unitPrice = Number(variant ? variant.price : product.price)
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          throw new CheckoutError(`"${name}" does not have a valid price. Please contact us.`, 409)
        }

        const trackStock = product.trackStock !== false
        const stock = Number(product.stock)
        if (trackStock && Number.isFinite(stock) && stock < line.qty) {
          throw new CheckoutError(`Only ${Math.max(0, stock)} × "${name}" left in stock.`, 409)
        }

        const customisation = line.customisation
          ? {
              ...line.customisation,
              ...(variant ? { variantId: variant.id, size: variant.label, servings: variant.servings } : {}),
            }
          : (variant ? { variantId: variant.id, size: variant.label, servings: variant.servings } : null)

        built.push({
          product,
          trackStock,
          item: {
            id: product.id,
            productId: product.id,
            lineId: line.lineId || `${product.id}-${variant ? variant.id : 'standard'}`,
            slug: product.slug || product.id,
            name,
            productType: product.productType || 'cake',
            purchaseType,
            imageUrl: imageFor(product),
            qty: line.qty,
            unitPrice,
            price: unitPrice,
            subtotal: unitPrice * line.qty,
            variantId: variant ? variant.id : null,
            customisation,
            description: line.description,
          },
        })
      }

      const orderItems = built.map((b) => b.item)
      const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
      // Collection is free. Local delivery is quoted separately and is never
      // invented from browser-supplied totals.
      const deliveryFee = 0
      const total = subtotal + deliveryFee
      if (!Number.isFinite(total) || total <= 0) {
        throw new CheckoutError('We could not calculate a valid order total.', 400)
      }

      const writes = [
        tx.set('orders', orderId, {
          uid,
          customerName,
          customerEmail,
          customerPhone,
          eventDate,
          eventType,
          celebrantGender,
          delivery,
          flavour,
          notes,
          items: orderItems,
          subtotal,
          deliveryFee,
          total,
          status: 'pending_payment',
          paymentStatus: 'pending',
          fulfilmentStatus: 'awaiting_payment',
          createdAt: now,
          updatedAt: now,
          source: 'web-checkout',
        }),
      ]

      for (const b of built) {
        if (b.trackStock) writes.push(tx.increment('inventory', b.product.id, 'stock', -b.item.qty))
      }

      return writes
    })

    // Respond from the persisted order so the client can never see a total
    // different from what was stored.
    const saved = await firestoreGet(env, 'orders', orderId)
    return jsonResponse({
      id: orderId,
      subtotal: Number(saved?.subtotal) || 0,
      deliveryFee: Number(saved?.deliveryFee) || 0,
      total: Number(saved?.total) || 0,
      items: saved?.items || [],
    }, 201, corsHeaders())
  } catch (err) {
    if (err instanceof CheckoutError) {
      return jsonResponse({ error: err.message }, err.status, corsHeaders())
    }
    console.error('[checkout] Failed:', err)
    return jsonResponse(
      { error: 'We could not complete your order. Please try again or contact us.' },
      500,
      corsHeaders(),
    )
  }
}
