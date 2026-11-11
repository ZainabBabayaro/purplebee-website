// ============================================================================
// Paystack webhook handler — Cloudflare Pages Function
// ----------------------------------------------------------------------------
// Deployed at:
//   https://<your-domain>/api/paystack-webhook
//   https://<your-domain>/api/webhook/paystack
//
// Environment variables (Cloudflare Pages -> Settings -> Environment variables):
//   PAYSTACK_SECRET_KEY   — Your Paystack secret key (sk_live_... or sk_test_...)
//   FIREBASE_PROJECT_ID   — purplebeecakes01 (defaults to purplebeecakes01)
//   FIREBASE_SERVICE_ACCOUNT — (Option A) Entire JSON string of Firebase service account
//   FIREBASE_CLIENT_EMAIL — (Option B) client_email from service account
//   FIREBASE_PRIVATE_KEY  — (Option B) private_key from service account
//
// Security model:
//   • The signature is verified before anything is parsed.
//   • The order is re-read from Firestore and the paid amount/currency must
//     match the stored order total exactly before paymentStatus is set to paid.
// ============================================================================

import {
  firestoreGet,
  firestorePatch,
  hasFirebaseCredentials,
} from '../_lib/firebase.js'

// Verify the Paystack webhook signature using HMAC-SHA512
async function verifyPaystackSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false
  try {
    const encoder = new TextEncoder()
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign'],
    )
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(rawBody))
    const computed = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return computed.toLowerCase() === signature.trim().toLowerCase()
  } catch (err) {
    console.error('Error verifying Paystack signature:', err)
    return false
  }
}

// Extract the internal order ID from Paystack event data
function extractOrderId(data) {
  const { metadata, reference } = data

  if (metadata && typeof metadata === 'object') {
    if (metadata.orderId) return String(metadata.orderId)
    if (metadata.order_id) return String(metadata.order_id)
    if (Array.isArray(metadata.custom_fields)) {
      const field = metadata.custom_fields.find(
        (f) => f.variable_name === 'order_id' || f.display_name === 'Order ID',
      )
      if (field?.value) return String(field.value)
    }
  }

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata)
      if (parsed?.orderId) return String(parsed.orderId)
      if (parsed?.order_id) return String(parsed.order_id)
    } catch (_) {}
  }

  // Admin payment requests use PBC-<orderId>-<timestamp>; inline checkout uses
  // the order ID itself as the reference.
  if (reference && typeof reference === 'string') {
    const match = reference.match(/^PBC-([a-zA-Z0-9_-]+)-\d+$/)
    if (match) return match[1]
    return reference
  }

  return null
}

function referenceBelongsToOrder(reference, orderId, metadata) {
  if (!reference) return false
  if (reference === orderId) return true
  if (reference.startsWith(`PBC-${orderId}-`)) return true
  const metaOrder = metadata?.orderId || metadata?.order_id
  return String(metaOrder || '') === orderId
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'active',
      message: 'Paystack webhook listener is ready. Send POST requests from Paystack.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  const secretKey = env.PAYSTACK_SECRET_KEY || ''
  if (!secretKey) {
    console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is not set.')
    return new Response('PAYSTACK_SECRET_KEY not configured', { status: 500 })
  }

  const isValid = await verifyPaystackSignature(rawBody, signature, secretKey)
  if (!isValid) {
    console.warn('[Paystack Webhook] Signature verification FAILED.')
    return new Response('Invalid signature', { status: 401 })
  }

  let eventPayload
  try {
    eventPayload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[Paystack Webhook] Invalid JSON:', err.message)
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const { event, data } = eventPayload
  console.log('[Paystack Webhook] Event:', event, '| reference:', data?.reference, '| status:', data?.status)

  if (event !== 'charge.success' || data?.status !== 'success') {
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const orderId = extractOrderId(data)
  if (!orderId) {
    console.warn('[Paystack Webhook] Could not extract orderId:', data?.reference)
    return new Response(JSON.stringify({ received: true, orderFound: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!hasFirebaseCredentials(env)) {
    console.error('[Paystack Webhook] Firebase service-account credentials are not configured.')
    return new Response('Firebase credentials not configured', { status: 500 })
  }

  try {
    const order = await firestoreGet(env, 'orders', orderId)
    if (!order) {
      console.warn('[Paystack Webhook] Order not found:', orderId)
      return new Response(JSON.stringify({ received: true, orderFound: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (order.paymentStatus === 'paid') {
      return new Response(JSON.stringify({ received: true, alreadyPaid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!referenceBelongsToOrder(data.reference, orderId, data.metadata)) {
      console.error('[Paystack Webhook] Reference/order mismatch:', data.reference, orderId)
      return new Response(JSON.stringify({ received: true, verified: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const expectedKobo = Math.round((Number(order.total) || 0) * 100)
    const paidKobo = Number(data.amount)
    if (!Number.isFinite(paidKobo) || paidKobo !== expectedKobo) {
      console.error(
        '[Paystack Webhook] Amount mismatch for order', orderId,
        'expected', expectedKobo, 'paid', paidKobo,
      )
      return new Response(JSON.stringify({ received: true, verified: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if ((data.currency || 'NGN').toUpperCase() !== 'NGN') {
      console.error('[Paystack Webhook] Unexpected currency:', data.currency)
      return new Response(JSON.stringify({ received: true, verified: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const now = new Date().toISOString()
    const nextStatus = order.status === 'pending_payment' || !order.status ? 'confirmed' : order.status
    const nextFulfilment = order.fulfilmentStatus === 'awaiting_payment' || !order.fulfilmentStatus
      ? 'confirmed'
      : order.fulfilmentStatus

    await firestorePatch(env, 'orders', orderId, {
      paymentStatus: 'paid',
      fulfilmentStatus: nextFulfilment,
      status: nextStatus,
      paystackReference: data.reference,
      amountPaid: paidKobo / 100,
      channel: data.channel || 'card',
      currency: data.currency || 'NGN',
      paidAt: data.paid_at || now,
      updatedAt: now,
    })

    console.log('[Paystack Webhook] ✓ Order paid:', orderId)
  } catch (err) {
    console.error('[Paystack Webhook] Failed to update order:', err.message)
    return new Response('Webhook processing failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
