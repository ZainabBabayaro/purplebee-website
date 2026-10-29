// ============================================================================
// HeroBackground
// ----------------------------------------------------------------------------
// A wide, art-directed panoramic scene used as the full-bleed sliding hero
// background. Development placeholder (not a photograph). Designed to be wider
// than the viewport so a slow horizontal pan reveals more of the composition.
// Replace with a real wide photograph by swapping the <img> in Hero instead.
// ============================================================================

function CakeSilhouette({ x, baseY, scale, color, opacity = 0.55 }) {
  // A soft tiered cake silhouette for the mid-ground.
  const tiers = [
    { w: 130, h: 70, y: -70 },
    { w: 160, h: 78, y: -140 },
  ]
  return (
    <g transform={`translate(${x} ${baseY}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="4" rx="92" ry="11" fill="#000" opacity="0.06" />
      <rect x="-90" y="-2" width="180" height="6" rx="3" fill="#efe5d4" />
      {tiers.map((t, i) => (
        <rect
          key={i}
          x={-t.w / 2}
          y={t.y}
          width={t.w}
          height={t.h}
          rx="12"
          fill={color}
        />
      ))}
      <rect x="-20" y={-200} width="40" height="64" rx="10" fill={color} />
      <circle cx="0" cy="-208" r="9" fill={color} />
    </g>
  )
}

function FloralSpray({ x, y, colors }) {
  const flowers = [
    { x: 0, y: 0, r: 7 },
    { x: 26, y: -10, r: 5 },
    { x: -18, y: 12, r: 6 },
    { x: 34, y: 8, r: 4.5 },
  ]
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.9">
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-4"
              rx="2.6"
              ry="5"
              fill={colors[i % colors.length]}
              opacity="0.85"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="2" fill="#c4a85f" />
        </g>
      ))}
      <path d="M0 4 C -8 22, -16 26, -22 40" stroke={colors[1]} strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d="M26 -6 C 32 6, 40 6, 46 18" stroke={colors[1]} strokeWidth="1.4" fill="none" opacity="0.45" />
    </g>
  )
}

export default function HeroBackground() {
  return (
    <svg
      viewBox="0 0 1400 800"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="herobg" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#fbf7f1" />
          <stop offset="45%" stopColor="#f3ecdf" />
          <stop offset="100%" stopColor="#e3d4ec" />
        </linearGradient>
        <radialGradient id="herolight" cx="78%" cy="20%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="herovign" cx="50%" cy="50%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#372a4a" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      <rect width="1400" height="800" fill="url(#herobg)" />
      <rect width="1400" height="800" fill="url(#herolight)" />

      {/* soft ground */}
      <path d="M0 640 C 300 600, 520 670, 760 632 C 1000 596, 1180 656, 1400 624 L1400 800 L0 800 Z" fill="#efe5d4" opacity="0.7" />
      <path d="M0 690 C 320 660, 560 712, 820 678 C 1080 644, 1240 700, 1400 672 L1400 800 L0 800 Z" fill="#e9decb" opacity="0.6" />

      {/* distant cake silhouettes across the scene */}
      <CakeSilhouette x={250} baseY={660} scale={0.9} color="#cdb9dd" opacity={0.5} />
      <CakeSilhouette x={640} baseY={650} scale={1.15} color="#bda5cd" opacity={0.55} />
      <CakeSilhouette x={1080} baseY={662} scale={0.85} color="#d9c8e3" opacity={0.45} />

      {/* florals in the foreground */}
      <FloralSpray x={1120} y={620} colors={['#e7c9d6', '#c8bda3', '#d8c0cf']} />
      <FloralSpray x={170} y={650} colors={['#d8c0cf', '#c8bda3', '#e7c9d6']} />

      {/* gentle bee marks */}
      <g transform="translate(980 200)" fill="#b8995a" opacity="0.5">
        <ellipse cx="0" cy="0" rx="9" ry="5.5" />
        <ellipse cx="-7" cy="-3" rx="6" ry="3" opacity="0.3" transform="rotate(-25 -7 -3)" />
        <ellipse cx="7" cy="-3" rx="6" ry="3" opacity="0.3" transform="rotate(25 7 -3)" />
      </g>
      <g transform="translate(560 300)" fill="#b8995a" opacity="0.4">
        <ellipse cx="0" cy="0" rx="8" ry="5" />
        <ellipse cx="-6" cy="-3" rx="5" ry="2.6" opacity="0.3" transform="rotate(-25 -6 -3)" />
        <ellipse cx="6" cy="-3" rx="5" ry="2.6" opacity="0.3" transform="rotate(25 6 -3)" />
      </g>

      {/* soft vignette for depth + legibility */}
      <rect width="1400" height="800" fill="url(#herovign)" />
    </svg>
  )
}
