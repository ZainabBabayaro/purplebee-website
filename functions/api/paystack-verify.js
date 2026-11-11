// ============================================================================
// POST /api/paystack-verify — server-side payment verification
// ----------------------------------------------------------------------------
// The browser calls this after Paystack succeeds. The browser NEVER sets a paid
// status itself: only this endpoint (and the signed webhook) may mark an order
// paid, and only after Paystack confirms the amount and currency match the
// order that was stored server-side.
// ============================================================================

import {
  corsHeaders,
  firestoreGet,
  firestorePatch,
  handleOptions,
  hasFirebaseCredentials,
  jsonResponse,
} from '../_lib/firebase.js'

function referenceBelongsToOrder(reference, orderId, metadata) {
  if (!reference) return false
  if (reference === orderId) return true
  if (reference.startsWith(`PBC-${orderId}-`)) return true
  const metaOrder = metadata?.orderId || metadata?.order_id
  return String(metaOrder || '') === orderId
}

export async function onRequestOptions() {
  return handleOptions()
}

export async function onRequestPost({ request, env }) {
  if (!hasFirebaseCredentials(env)) {
    return jsonResponse(
      { error: 'Payment verification is not configured on the server.' },
      503,
      corsHeaders(),
    )
  }

  const secretKey = env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return jsonResponse({ error: 'PAYSTACK_SECRET_KEY is not configured on the server.' }, 503, corsHeaders())
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid verification payload.' }, 400, corsHeaders())
  }

  const orderId = String(body.orderId || '').trim()
  const reference = String(body.reference || '').trim()
  if (!orderId || !reference) {
    return jsonResponse({ error: 'orderId and reference are required.' }, 400, corsHeaders())
  }

  const order = await firestoreGet(env, 'orders', orderId)
  if (!order) return jsonResponse({ error: 'Order not found.' }, 404, corsHeaders())

  if (order.paymentStatus === 'paid') {
    return jsonResponse({ verified: true, orderId, alreadyPaid: true }, 200, corsHeaders())
  }

  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  )
  const paystackJson = await paystackRes.json().catch(() => ({}))
  const data = paystackJson.data

  if (!paystackRes.ok || !paystackJson.status || !data) {
    console.error('[paystack-verify] Paystack lookup failed:', paystackRes.status, paystackJson)
    return jsonResponse({ verified: false, error: 'Could not verify the payment with Paystack.' }, 502, corsHeaders())
  }

  if (data.status !== 'success') {
    return jsonResponse({ verified: false, error: `Payment status is "${data.status}".` }, 200, corsHeaders())
  }

  if (!referenceBelongsToOrder(reference, orderId, data.metadata)) {
    console.error('[paystack-verify] Reference does not belong to order', orderId, reference)
    return jsonResponse({ verified: false, error: 'This payment does not belong to this order.' }, 400, corsHeaders())
  }

  const expectedKobo = Math.round((Number(order.total) || 0) * 100)
  const paidKobo = Number(data.amount)
  if (!Number.isFinite(paidKobo) || paidKobo !== expectedKobo) {
    console.error(
      '[paystack-verify] Amount mismatch for order', orderId,
      'expected', expectedKobo, 'paid', paidKobo,
    )
    return jsonResponse(
      { verified: false, error: 'The amount paid does not match the order total. Please contact us.' },
      409,
      corsHeaders(),
    )
  }

  if ((data.currency || 'NGN').toUpperCase() !== 'NGN') {
    return jsonResponse({ verified: false, error: 'Unexpected payment currency.' }, 409, corsHeaders())
  }

  const now = new Date().toISOString()
  const paidAt = data.paid_at || data.paidAt || now
  const nextStatus = order.status === 'pending_payment' || !order.status ? 'confirmed' : order.status
  const nextFulfilment = order.fulfilmentStatus === 'awaiting_payment' || !order.fulfilmentStatus
    ? 'confirmed'
    : order.fulfilmentStatus

  await firestorePatch(env, 'orders', orderId, {
    paymentStatus: 'paid',
    fulfilmentStatus: nextFulfilment,
    status: nextStatus,
    paystackReference: reference,
    amountPaid: paidKobo / 100,
    channel: data.channel || 'card',
    currency: data.currency || 'NGN',
    paidAt,
    updatedAt: now,
  })

  return jsonResponse(
    {
      verified: true,
      orderId,
      paymentStatus: 'paid',
      amountPaid: paidKobo / 100,
      reference,
    },
    200,
    corsHeaders(),
  )
}
