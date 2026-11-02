// ============================================================================
// Cloudflare Pages Function: /cdn/*
// ----------------------------------------------------------------------------
// Serves objects stored in Cloudflare R2 directly via Cloudflare's edge cache.
// Allows images to work instantly without needing a custom domain or public R2.
// ============================================================================

export async function onRequestGet(context) {
  const { env, params } = context
  const bucket = env.R2_BUCKET || env.IMAGES_BUCKET

  if (!bucket) {
    return new Response('R2 bucket binding is not configured.', { status: 500 })
  }

  const path = Array.isArray(params.path) ? params.path.join('/') : params.path
  if (!path) {
    return new Response('Not found', { status: 404 })
  }

  const object = await bucket.get(path)
  if (!object) {
    return new Response('Image not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('Access-Control-Allow-Origin', '*')

  return new Response(object.body, { headers })
}

