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
// ============================================================================

// URL-safe Base64 encoder required for Google OAuth RS256 JWT
function base64Url(data) {
  let b64 = ''
  if (typeof data === 'string') {
    b64 = btoa(data)
  } else {
    let binary = ''
    const bytes = new Uint8Array(data)
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    b64 = btoa(binary)
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Convert PEM PKCS8 to ArrayBuffer for Web Crypto import
function pemToBuffer(pem) {
  const cleanPem = pem
    .replace(/-----BEGIN[A-Z\s]+-----/, '')
    .replace(/-----END[A-Z\s]+-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '')
  const binary = atob(cleanPem)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i)
  }
  return buffer.buffer
}

// Verify the Paystack webhook signature using HMAC-SHA512
async function verifyPaystackSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
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

// Mint a Google OAuth2 access token for Firestore with admin datastore scope
async function getFirebaseAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/datastore',
    })
  )

  const unsignedJwt = `${header}.${payload}`
  const pemKey = privateKey.replace(/\\n/g, '\n')
  const keyBuffer = pemToBuffer(pemKey)

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedJwt)
  )

  const sig = base64Url(sigBuffer)
  const assertion = `${unsignedJwt}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Google OAuth error: ${res.status} - ${errText}`)
  }

  const data = await res.json()
  return data.access_token
}

// Update the order in Firestore via REST API with updateMask to protect existing fields
async function updateOrderInFirestore(projectId, token, orderId, paymentData) {
  const fields = {
    status: { stringValue: 'confirmed' },
    paymentStatus: { stringValue: 'paid' },
    paystackReference: { stringValue: paymentData.reference || '' },
    paidAt: { stringValue: paymentData.paid_at || new Date().toISOString() },
    amountPaid: { doubleValue: Number(paymentData.amount || 0) / 100 },
    channel: { stringValue: paymentData.channel || 'card' },
  }

  const fieldKeys = Object.keys(fields)
  const mask = fieldKeys.map((f) => `updateMask.fieldPaths=${f}`).join('&')
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?${mask}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Firestore update failed (${res.status}): ${errText}`)
  }

  return true
}

// Extract the internal order ID from Paystack event data
function extractOrderId(data) {
  const { metadata, reference } = data

  // 1. Check metadata object
  if (metadata && typeof metadata === 'object') {
    if (metadata.orderId) return String(metadata.orderId)
    if (metadata.order_id) return String(metadata.order_id)
    if (Array.isArray(metadata.custom_fields)) {
      const field = metadata.custom_fields.find(
        (f) => f.variable_name === 'order_id' || f.display_name === 'Order ID'
      )
      if (field?.value) return String(field.value)
    }
  }

  // 2. Check if metadata was serialized as JSON string
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata)
      if (parsed?.orderId) return String(parsed.orderId)
      if (parsed?.order_id) return String(parsed.order_id)
    } catch (_) {}
  }

  // 3. Check reference format from Checkout.jsx: PBC-<orderId>-<timestamp>
  if (reference && typeof reference === 'string') {
    const match = reference.match(/^PBC-([a-zA-Z0-9_-]+)-\d+$/)
    if (match) return match[1]
  }

  return null
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'active',
      message: 'Paystack webhook listener is ready. Send POST requests from Paystack.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  console.log('[Paystack Webhook] Received POST request')
  console.log('[Paystack Webhook] Signature present:', !!signature)

  // 1. Verify webhook signature
  const secretKey = env.PAYSTACK_SECRET_KEY || ''
  if (!secretKey) {
    console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is not set.')
    return new Response('PAYSTACK_SECRET_KEY not configured', { status: 500 })
  }

  const isValid = await verifyPaystackSignature(rawBody, signature, secretKey)
  if (!isValid) {
    console.warn('[Paystack Webhook] Signature verification FAILED. Check PAYSTACK_SECRET_KEY matches your Paystack dashboard.')
    return new Response('Invalid signature', { status: 401 })
  }

  console.log('[Paystack Webhook] Signature verified ✓')

  // 2. Parse Paystack webhook JSON
  let eventPayload
  try {
    eventPayload = JSON.parse(rawBody)
  } catch (err) {
    console.error('[Paystack Webhook] Invalid JSON:', err.message)
    return new Response('Invalid JSON payload', { status: 400 })
  }

  const { event, data } = eventPayload
  console.log('[Paystack Webhook] Event type:', event)
  console.log('[Paystack Webhook] Payment reference:', data?.reference)
  console.log('[Paystack Webhook] Payment status:', data?.status)
  console.log('[Paystack Webhook] Metadata:', JSON.stringify(data?.metadata))

  // 3. Handle charge.success
  if (event === 'charge.success' && data?.status === 'success') {
    const orderId = extractOrderId(data)
    console.log('[Paystack Webhook] Extracted orderId:', orderId)

    if (!orderId) {
      console.warn('[Paystack Webhook] Could not extract orderId from metadata or reference:', data.reference)
      return new Response('Event received, order ID not found', { status: 200 })
    }

    // Resolve Firebase credentials
    let clientEmail = env.FIREBASE_CLIENT_EMAIL
    let privateKey = env.FIREBASE_PRIVATE_KEY
    let projectId = env.FIREBASE_PROJECT_ID || 'purplebeecakes01'

    if (env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
        clientEmail = sa.client_email || clientEmail
        privateKey = sa.private_key || privateKey
        projectId = sa.project_id || projectId
        console.log('[Paystack Webhook] Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT')
      } catch (e) {
        console.error('[Paystack Webhook] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message)
      }
    }

    console.log('[Paystack Webhook] Firebase project:', projectId)
    console.log('[Paystack Webhook] Firebase client email present:', !!clientEmail)
    console.log('[Paystack Webhook] Firebase private key present:', !!privateKey)

    if (clientEmail && privateKey) {
      try {
        console.log('[Paystack Webhook] Getting Firebase access token...')
        const accessToken = await getFirebaseAccessToken(clientEmail, privateKey)
        console.log('[Paystack Webhook] Firebase token obtained ✓')
        console.log(`[Paystack Webhook] Updating Firestore order ${orderId}...`)
        await updateOrderInFirestore(projectId, accessToken, orderId, data)
        console.log(`[Paystack Webhook] ✓ Order ${orderId} confirmed successfully`)
      } catch (err) {
        console.error(`[Paystack Webhook] Firestore update FAILED for order ${orderId}:`, err.message)
      }
    } else {
      console.error('[Paystack Webhook] Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY) in Cloudflare environment variables.')
    }
  } else {
    console.log(`[Paystack Webhook] Ignored event: ${event} (status: ${data?.status})`)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
