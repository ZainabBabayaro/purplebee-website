// ============================================================================
// Paystack webhook handler — Cloudflare Pages Function
// ----------------------------------------------------------------------------
// Cloudflare Pages Functions run server-side at the edge.
// This file is automatically deployed as a serverless endpoint at:
//   https://www.purplebeecakes.com/api/paystack-webhook
//
// Set in your Cloudflare Pages project → Settings → Environment variables:
//   PAYSTACK_SECRET_KEY   — your Paystack secret key (sk_live_...)
//   FIREBASE_PROJECT_ID   — purplebeecakes01
//   FIREBASE_CLIENT_EMAIL — from your Firebase service account JSON
//   FIREBASE_PRIVATE_KEY  — from your Firebase service account JSON
// ============================================================================

// Verify the webhook signature using HMAC-SHA512.
async function verifySignature(body, signature, secret) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(body)
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return computed === signature
}

// Get a Firebase Admin access token using a service account.
async function getFirebaseToken(clientEmail, privateKey, projectId) {
  const now = Math.floor(Date.now() / 1000)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  }))

  // Sign with RS256 (requires the private key in PEM format)
  const pemKey = privateKey.replace(/\\n/g, '\n')
  const keyBuffer = pemToBuffer(pemKey)
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  )
  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(`${header}.${payload}`)
  )
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
  const jwt = `${header}.${payload}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const { access_token } = await res.json()
  return access_token
}

function pemToBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const binary = atob(b64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return buffer.buffer
}

// Update the order status in Firestore via REST API.
async function updateOrderInFirestore(projectId, token, orderId, status, paystackRef) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}`
  await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        status: { stringValue: status },
        paystackReference: { stringValue: paystackRef || '' },
        paidAt: { stringValue: new Date().toISOString() },
      },
    }),
  })
}

export async function onRequestPost({ request, env }) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  // 1. Verify signature
  const valid = await verifySignature(body, signature, env.PAYSTACK_SECRET_KEY || '')
  if (!valid) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(body)
  const { event: eventType, data } = event

  // 2. Handle charge.success
  if (eventType === 'charge.success') {
    const { reference, metadata, status } = data
    // You should store the order ID in Paystack metadata at checkout time.
    const orderId = metadata?.orderId || metadata?.order_id

    if (orderId && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      try {
        const token = await getFirebaseToken(
          env.FIREBASE_CLIENT_EMAIL,
          env.FIREBASE_PRIVATE_KEY,
          env.FIREBASE_PROJECT_ID
        )
        await updateOrderInFirestore(
          env.FIREBASE_PROJECT_ID, token, orderId, 'confirmed', reference
        )
      } catch (err) {
        console.error('Firestore update failed:', err.message)
        // Still return 200 so Paystack doesn't retry
      }
    }
  }

  return new Response('OK', { status: 200 })
}
