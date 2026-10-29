import { seededRand } from '../utils/images.js'

// ============================================================================
// PlaceholderArt
// ----------------------------------------------------------------------------
// An art-directed SVG that stands in for cake photography during development.
// It is NOT a photo of a real cake — it is a stylised composition built from the
// brand palette. Designs vary deterministically by `seed` so each cake keeps a
// stable look. Replace with real photography before launch; OptimizedImage
// renders a real `src` automatically when one is provided.
// ============================================================================

function Bee({ x, y, color, opacity = 0.5 }) {
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`} aria-hidden="true">
      <ellipse cx="0" cy="0" rx="9" ry="5.5" fill={color} />
      <ellipse cx="-3" cy="0.5" rx="1.1" ry="3.2" fill="#ffffff" opacity="0.85" />
      <ellipse cx="0.5" cy="0.4" rx="0.9" ry="2.6" fill="#ffffff" opacity="0.7" />
      <ellipse cx="-9" cy="-3" rx="6" ry="3" fill={color} opacity="0.25" transform="rotate(-25 -9 -3)" />
      <ellipse cx="7" cy="-3" rx="6" ry="3" fill={color} opacity="0.25" transform="rotate(25 7 -3)" />
    </g>
  )
}

function Florals({ cx, cy, colors, accent }) {
  // A loose cluster of simple sugar flowers on one side.
  const flowers = [
    { x: 0, y: 0, r: 9, c: colors[0] },
    { x: 22, y: -14, r: 6, c: colors[2] },
    { x: -16, y: 12, r: 7, c: colors[1] },
    { x: 30, y: 6, r: 5, c: colors[0] },
    { x: -6, y: -24, r: 5, c: colors[2] },
  ]
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-5"
              rx="3.2"
              ry="6"
              fill={f.c}
              opacity="0.85"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="2.4" fill={accent} />
        </g>
      ))}
      {/* trailing stems */}
      <path d={`M0 6 C -10 28, -22 30, -30 46`} stroke={colors[1]} strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d={`M22 -8 C 30 4, 40 4, 48 16`} stroke={colors[1]} strokeWidth="1.4" fill="none" opacity="0.5" />
    </g>
  )
}

function LineAccent({ cx, cy, w, color }) {
  // A single confident diagonal line, sculptural motif.
  return (
    <g aria-hidden="true">
      <line
        x1={cx - w / 2}
        y1={cy - w / 2}
        x2={cx + w / 2}
        y2={cy + w / 2}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  )
}

function Paint({ cx, cy, colors }) {
  // Soft blended blocks of colour, painterly motif.
  const shapes = [
    { x: 0, y: 0, w: 120, h: 70, c: colors[0], r: 0 },
    { x: 50, y: 18, w: 90, h: 60, c: colors[1], r: -8 },
    { x: -30, y: 26, w: 80, h: 50, c: colors[2], r: 6 },
  ]
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      {shapes.map((s, i) => (
        <ellipse
          key={i}
          cx={s.x}
          cy={s.y}
          rx={s.w / 2}
          ry={s.h / 2}
          fill={s.c}
          opacity={0.5}
          transform={`rotate(${s.r} ${s.x} ${s.y})`}
        />
      ))}
    </g>
  )
}

function Texture({ cx, cy, color }) {
  // Faint horizontal ridges suggesting draped cloth / stencilled texture.
  const lines = Array.from({ length: 9 }, (_, i) => -120 + i * 14)
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      {lines.map((y, i) => (
        <line
          key={i}
          x1={-150}
          y1={y}
          x2={150}
          y2={y + (i % 2 ? 3 : -3)}
          stroke={color}
          strokeWidth="1.2"
          opacity="0.25"
        />
      ))}
    </g>
  )
}

export default function PlaceholderArt({ seed = '', palette, className = '', label }) {
  const p = palette
  const r = seededRand(seed)
  const tierCount = 2 + Math.round(r.r1 * 2) // 2–4 tiers

  const cx = 400
  const baseY = 620
  const tierHeight = 92
  const maxW = 300
  const minW = 150

  // Build tiers bottom-up, each narrower than the one below.
  const tiers = Array.from({ length: tierCount }, (_, i) => {
    const w = maxW - ((maxW - minW) * i) / Math.max(1, tierCount - 1)
    const y = baseY - (i + 1) * tierHeight + tierHeight
    return {
      x: cx - w / 2,
      y,
      w,
      h: tierHeight - 8,
      fill: p.tiers[i % p.tiers.length],
      rx: 10,
    }
  })

  const topTier = tiers[tiers.length - 1]
  const motifY = topTier ? topTier.y + 10 : baseY - 120

  return (
    <svg
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={label || 'Stylised cake illustration — development placeholder'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.bg[0]} />
          <stop offset="100%" stopColor={p.bg[1]} />
        </linearGradient>
        <radialGradient id={`glow-${seed}`} cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="800" height="800" fill={`url(#bg-${seed})`} />
      <rect width="800" height="800" fill={`url(#glow-${seed})`} />

      {/* Cake stand */}
      <ellipse cx={cx} cy={baseY + 6} rx={maxW / 2 + 30} ry="14" fill={p.ground} opacity="0.7" />
      <rect x={cx - maxW / 2 - 24} y={baseY} width={maxW + 48} height="6" rx="3" fill={p.ground} />

      {/* Soft contact shadow */}
      <ellipse cx={cx} cy={baseY + 2} rx={maxW / 2} ry="9" fill="#000" opacity="0.05" />

      {/* Tiers */}
      {tiers.map((t, i) => (
        <rect
          key={i}
          x={t.x}
          y={t.y}
          width={t.w}
          height={t.h}
          rx={t.rx}
          fill={t.fill}
          stroke={p.accent}
          strokeOpacity="0.18"
        />
      ))}

      {/* Motif */}
      {p.motif === 'floral' && (
        <Florals cx={cx + 40} cy={motifY} colors={p.motifColors} accent={p.accent} />
      )}
      {p.motif === 'line' && <LineAccent cx={cx} cy={motifY} w={70} color={p.accent} />}
      {p.motif === 'paint' && <Paint cx={cx} cy={motifY} colors={p.motifColors} />}
      {p.motif === 'texture' && (
        <Texture cx={cx} cy={motifY + 20} color={p.motifColors[0]} />
      )}

      {/* Subtle brand bee watermark */}
      <Bee x={120 + r.r2 * 40} y={150 + r.r3 * 30} color={p.accent} opacity={0.45} />
    </svg>
  )
}
