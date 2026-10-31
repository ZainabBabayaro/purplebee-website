import { getPalette } from '../utils/images.js'
import PlaceholderArt from './PlaceholderArt.jsx'

// ============================================================================
// OptimizedImage
// ----------------------------------------------------------------------------
// When a real `src` (or `imageUrl`) is provided it renders a responsive,
// lazy-loaded <img>. Otherwise falls back to PlaceholderArt.
// Accepts an explicit aspect ratio for CLS control.
// ============================================================================

export default function OptimizedImage({
  src,
  imageUrl,       // alias — either prop works
  alt = '',
  paletteKey = 'garden',
  seed = 'purple-bee',
  aspect = '4 / 5',
  priority = false,
  className = '',
  imgClassName = '',
  sizes,
}) {
  const palette = getPalette(paletteKey)
  const resolvedSrc = src || imageUrl || null
  const wrapperStyle = { aspectRatio: aspect }

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

  return (
    <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}
