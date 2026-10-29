// ============================================================================
// Logo — Purple Bee Cakes
// ----------------------------------------------------------------------------
// Uses the real brand SVG at /public/favicon.svg.
// The SVG has a square purple background (no built-in corner radius).
// We wrap it in a container that:
//   - Clips to a rounded rectangle (rounded-2xl = 1rem radius)
//   - Shows the bee mark slightly larger inside (scale-[1.15]) so it feels
//     less padded, matching the brief — overall component size unchanged.
//
// Three variants:
//   <LogoMark />          — mark only
//   <LogoLockup />        — mark + wordmark, light backgrounds
//   <LogoLockupLight />   — mark + wordmark, dark backgrounds
// ============================================================================

// Rounds the purple square and scales the bee mark up a touch inside it.
function LogoSquare({ size = 38 }) {
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, minWidth: size }}
      aria-hidden="true"
    >
      <img
        src="/favicon.svg"
        alt=""
        width={size}
        height={size}
        // scale-[1.18] makes the white bee mark visually larger inside the
        // purple square without changing the outer dimensions at all.
        className="h-full w-full scale-[1.18] object-cover"
        style={{ display: 'block' }}
      />
    </span>
  )
}

// ── LogoMark — mark only ─────────────────────────────────────────────────────
export function LogoMark({ size = 38, className = '' }) {
  return (
    <span className={`inline-flex shrink-0 ${className}`}>
      <LogoSquare size={size} />
      <span className="sr-only">Purple Bee Cakes</span>
    </span>
  )
}

// ── LogoLockup — light backgrounds (header) ──────────────────────────────────
export function LogoLockup({ className = '' }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoSquare size={38} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.1rem] font-medium tracking-tight text-ink">
          Purple Bee
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.28em] text-stone">
          Cakes
        </span>
      </span>
    </span>
  )
}

// ── LogoLockupLight — dark backgrounds (footer, admin) ───────────────────────
export function LogoLockupLight({ className = '' }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoSquare size={38} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.1rem] font-medium tracking-tight text-ivory">
          Purple Bee
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.28em] text-plum-300">
          Cakes
        </span>
      </span>
    </span>
  )
}
