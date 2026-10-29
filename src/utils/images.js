// ============================================================================
// IMAGE HELPERS
// ----------------------------------------------------------------------------
// Until the studio supplies real photography, cake visuals are represented by
// art-directed SVG placeholders (see components/PlaceholderArt.jsx). These are
// clearly development placeholders — not photographs of real cakes. The
// OptimizedImage component prefers a real `src` when one is provided, so
// swapping in photography later requires no layout changes.
// ============================================================================

// Deterministic 32-bit hash of a string. Used so each cake keeps a stable,
// reproducible composition across renders and prerender.
export function hashSeed(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Small pseudo-random generator seeded from the hash, exposing a few values.
export function seededRand(str = '') {
  const seed = hashSeed(str)
  const a = (seed >> 0) & 0xff
  const b = (seed >> 8) & 0xff
  const c = (seed >> 16) & 0xff
  const d = (seed >> 24) & 0xff
  return {
    r1: a / 255,
    r2: b / 255,
    r3: c / 255,
    r4: d / 255,
    // combined helpers
    pick: (arr, n) => arr[Math.floor((n <= 1 ? a / 255 : n) * arr.length) % arr.length],
  }
}

// Palette definitions per collection / cake. Each defines a background
// gradient, a stand colour, tier tones, an accent and a motif.
export const palettes = {
  garden: {
    bg: ['#fbf7f1', '#f1e7f3'],
    ground: '#efe5d4',
    tiers: ['#ffffff', '#f3eaf2'],
    accent: '#bda5cd',
    motif: 'floral',
    motifColors: ['#e7c9d6', '#c8bda3', '#d8c0cf'],
  },
  sculptural: {
    bg: ['#f5ece0', '#ece1d2'],
    ground: '#e2d7c6',
    tiers: ['#3b3447', '#4a3a63'],
    accent: '#c4a85f',
    motif: 'line',
    motifColors: ['#c4a85f'],
  },
  painterly: {
    bg: ['#fbf7f1', '#f7e8dc'],
    ground: '#efe5d4',
    tiers: ['#f4e1d4', '#e8d5e1'],
    accent: '#d98a5b',
    motif: 'paint',
    motifColors: ['#d98a5b', '#7e5f96', '#5b8a8c'],
  },
  quiet: {
    bg: ['#fbf7f1', '#f3ecdf'],
    ground: '#e9decb',
    tiers: ['#f1e9db', '#e7dbc6'],
    accent: '#c9a96a',
    motif: 'texture',
    motifColors: ['#c9a96a'],
  },
}

export const getPalette = (key) => palettes[key] || palettes.garden
