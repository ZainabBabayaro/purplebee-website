import { getPalette } from '../utils/images.js'
import PlaceholderArt from './PlaceholderArt.jsx'

// ============================================================================
// OptimizedImage
// ----------------------------------------------------------------------------
// Renders a responsive, lazy-loaded image with WebP source + original-format
// fallback. Includes explicit width/height to prevent CLS. Falls back to
// PlaceholderArt when no src is provided.
// ============================================================================

function webpUrlFor(src) {
  if (!src || typeof src !== 'string') return null
  if (src.endsWith('.webp')) return null
  if (/\.(jpe?g|png)$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)$/i, '.webp')
  }
  return null
}

export default function OptimizedImage({
  src,
  imageUrl,       // alias — either prop works
  alt = '',
  paletteKey = 'garden',
  seed = 'purple-bee',
  aspect = '4 / 5',
  priority = false,
  width,
  height,
  className = '',
  imgClassName = '',
  sizes,
}) {
  const palette = getPalette(paletteKey)
  const resolvedSrc = src || imageUrl || null
  const wrapperStyle = { aspectRatio: aspect }
  const webpSrc = webpUrlFor(resolvedSrc)

  if (!resolvedSrc) {
    return (
      <div
        className={`relative overflow-hidden bg-cream ${className}`}
        style={wrapperStyle}
      >
        <PlaceholderArt
          seed={seed}
          palette={palette}
          label={alt || 'Cake illustration — development placeholder'}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    )
  }

  const img = (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : 'auto'}
      sizes={sizes}
      className={`h-full w-full object-cover ${imgClassName}`}
    />
  )

  return (
    <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
      {webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          {img}
        </picture>
      ) : img}
    </div>
  )
}
