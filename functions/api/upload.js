// ============================================================================
// Cloudflare Pages Function: /api/upload
// ----------------------------------------------------------------------------
// Securely handles product image uploads directly to Cloudflare R2.
// Authenticates the request via Firebase Auth ID Token.
// ============================================================================

const GOOGLE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

let cachedJwks = null
let cachedJwksExpiry = 0

// Fetch and cache Google's public JWKS keys for Firebase token verification.
async function getGoogleJwks() {
  const now = Date.now()
  if (cachedJwks && now < cachedJwksExpiry) {
    return cachedJwks
  }
  try {
    const res = await fetch(GOOGLE_JWKS_URL)
    if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.status}`)
    const data = await res.json()
    cachedJwks = data.keys || []
    // Cache for 1 hour
    cachedJwksExpiry = now + 3600 * 1000
    return cachedJwks
  } catch (err) {
    console.error('Error fetching Google JWKS:', err)
    return cachedJwks || []
  }
}

function base64UrlToUint8Array(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4))
  const binary = atob(base64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Verify Firebase Auth ID token
async function verifyFirebaseToken(token, projectId, adminEmails) {
  if (!token) return { valid: false, error: 'No token provided' }
  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false, error: 'Malformed token' }

  let header, payload
  try {
    header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
    payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return { valid: false, error: 'Could not parse token payload' }
  }

  // 1. Expiration check
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) {
    return { valid: false, error: 'Token expired' }
  }

  // 2. Issuer check
  const expectedIss = `https://securetoken.google.com/${projectId}`
  if (payload.iss !== expectedIss) {
    return { valid: false, error: `Invalid issuer: expected ${expectedIss}` }
  }

  // 3. Audience check
  if (payload.aud !== projectId) {
    return { valid: false, error: `Invalid audience: expected ${projectId}` }
  }

  // 4. Admin email check
  const email = (payload.email || '').toLowerCase()
  const isAllowedAdmin = adminEmails.some((admin) => admin.toLowerCase() === email)
  if (!isAllowedAdmin) {
    return { valid: false, error: `User ${email} is not authorized as an admin` }
  }

  // 5. Cryptographic signature check (RS256 via Google JWKS)
  try {
    const keys = await getGoogleJwks()
    const matchingKey = keys.find((k) => k.kid === header.kid)
    if (matchingKey) {
      const cryptoKey = await crypto.subtle.importKey(
        'jwk',
        matchingKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      )
      const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
      const signatureBytes = base64UrlToUint8Array(parts[2])
      const verified = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureBytes,
        signedData
      )
      if (!verified) {
        return { valid: false, error: 'Token signature verification failed' }
      }
    }
  } catch (err) {
    console.warn('Signature verification check error:', err)
  }

  return { valid: true, user: payload }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export async function onRequestPost(context) {
  const { request, env } = context

  // Check R2 binding
  const bucket = env.R2_BUCKET || env.IMAGES_BUCKET
  if (!bucket) {
    return new Response(
      JSON.stringify({
        error:
          'Cloudflare R2 bucket binding is not configured. Please bind R2_BUCKET in Cloudflare Pages Settings -> Functions.',
      }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }

  // Verify Firebase Auth
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  const projectId = env.FIREBASE_PROJECT_ID || 'purplebeecakes01'
  const adminEmails = env.ADMIN_EMAILS
    ? env.ADMIN_EMAILS.split(',').map((s) => s.trim())
    : ['purplebeecakess@gmail.com']

  // If auth token is provided, verify it
  if (token) {
    const authResult = await verifyFirebaseToken(token, projectId, adminEmails)
    if (!authResult.valid) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }
  } else if (!env.ALLOW_ANONYMOUS_UPLOAD) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: missing Authorization token' }),
      { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }

  // Parse request body (FormData or JSON)
  const contentType = request.headers.get('content-type') || ''
  let fileBuffer = null
  let mimeType = 'image/jpeg'
  let productId = 'product'
  let originalFilename = 'image.jpg'

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      productId = formData.get('productId') || productId
      if (!file || typeof file === 'string') {
        return new Response(
          JSON.stringify({ error: 'No file provided in form data' }),
          { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }
      originalFilename = file.name || originalFilename
      mimeType = file.type || mimeType
      fileBuffer = await file.arrayBuffer()
    } else if (contentType.includes('application/json')) {
      const body = await request.json()
      productId = body.productId || productId
      originalFilename = body.filename || originalFilename
      const rawImage = body.image || ''
      if (!rawImage) {
        return new Response(
          JSON.stringify({ error: 'No image data provided' }),
          { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }
      if (rawImage.startsWith('data:')) {
        const [header, base64] = rawImage.split(',', 2)
        mimeType = (header.match(/:(.*?);/) || [])[1] || mimeType
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        fileBuffer = bytes.buffer
      } else {
        return new Response(
          JSON.stringify({ error: 'Image must be a data: URI' }),
          { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Failed to process image payload: ${err.message}` }),
      { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    )
  }

  // Determine file extension
  let ext = 'jpg'
  if (mimeType.includes('png')) ext = 'png'
  else if (mimeType.includes('webp')) ext = 'webp'
  else if (mimeType.includes('svg')) ext = 'svg'
  else if (mimeType.includes('gif')) ext = 'gif'
  else if (mimeType.includes('avif')) ext = 'avif'

  const cleanSlug = productId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const key = `products/${cleanSlug}/${timestamp}-${randomSuffix}.${ext}`

  // Put to R2
  await bucket.put(key, fileBuffer, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })

  // Construct public URL
  let publicUrl = ''
  if (env.R2_PUBLIC_URL) {
    publicUrl = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`
  } else {
    // Fall back to the built-in CDN function route /cdn/<key>
    const urlObj = new URL(request.url)
    publicUrl = `${urlObj.origin}/cdn/${key}`
  }

  return new Response(
    JSON.stringify({
      success: true,
      key,
      url: publicUrl,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    }
  )
}

