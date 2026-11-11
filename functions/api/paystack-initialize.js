// ============================================================================
// POST /api/paystack-initialize — admin-initiated payment request
// ----------------------------------------------------------------------------
// Creates a Paystack payment link for an existing order (for example, a bespoke
// cake converted from an enquiry). Only admins may call this. The amount comes
// from the stored order — never from the browser.
// ============================================================================

import {
  corsHeaders,
  firestoreGet,
  firestorePatch,
  handleOptions,
  hasFirebaseCredentials,
  jsonResponse,
  requireAdmin,
} from '../_lib/firebase.js'

export async function onRequestOptions() {
  return handleOptions()
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env)
  if (!auth.ok) {
    return jsonResponse({ error: auth.error }, auth.status, corsHeaders())
  }

  if (!hasFirebaseCredentials(env)) {
    return jsonResponse(
      { error: 'Firebase service-account credentials are not configured on the server.' },
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
    return jsonResponse({ error: 'Invalid payment request payload.' }, 400, corsHeaders())
  }

  const orderId = String(body.orderId || '').trim()
  if (!orderId) return jsonResponse({ error: 'orderId is required.' }, 400, corsHeaders())

  const order = await firestoreGet(env, 'orders', orderId)
  if (!order) return jsonResponse({ error: 'Order not found.' }, 404, corsHeaders())
  if (order.paymentStatus === 'paid') {
    return jsonResponse({ error: 'This order has already been paid.' }, 409, corsHeaders())
  }

  const amount = Number(order.total)
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonResponse({ error: 'This order does not have a valid total.' }, 409, corsHeaders())
  }
  if (!order.customerEmail) {
    return jsonResponse({ error: 'The order has no customer email for Paystack.' }, 409, corsHeaders())
  }

  // Use a unique reference so a previous failed/abandoned attempt cannot block
  // a new payment request. The webhook and verify endpoint resolve the order
  // from metadata, and fall back to the PBC-<orderId>-<timestamp> format.
  const reference = `PBC-${orderId}-${Date.now()}`
  const siteUrl = env.SITE_URL || 'https://purplebeecakes.com'

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: order.customerEmail,
      amount: Math.round(amount * 100),
      currency: 'NGN',
      reference,
      callback_url: `${siteUrl.replace(/\/$/, '')}/order-confirmation?order=${encodeURIComponent(orderId)}`,
      metadata: {
        orderId,
        customerName: order.customerName || '',
        source: 'admin-payment-request',
        custom_fields: [
          { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          { display_name: 'Customer', variable_name: 'customer', value: order.customerName || '' },
        ],
      },
    }),
  })

  const paystackJson = await paystackRes.json().catch(() => ({}))
  if (!paystackRes.ok || !paystackJson.status || !paystackJson.data?.authorization_url) {
    console.error('[paystack-initialize] Paystack error:', paystackRes.status, paystackJson)
    return jsonResponse(
      { error: paystackJson.message || 'Paystack could not create a payment link.' },
      502,
      corsHeaders(),
    )
  }

  const { authorization_url: authorizationUrl, access_code: accessCode } = paystackJson.data

  await firestorePatch(env, 'orders', orderId, {
    paymentRequestUrl: authorizationUrl,
    paymentRequestReference: reference,
    paymentRequestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return jsonResponse(
    {
      orderId,
      reference,
      authorizationUrl,
      accessCode,
      amount,
    },
    200,
    corsHeaders(),
  )
}
