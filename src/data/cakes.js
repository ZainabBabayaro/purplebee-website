// ============================================================================
// CAKES — individual designs
// ----------------------------------------------------------------------------
// Development content (`development: true`). Designs and their details are
// sample studies to demonstrate the cake pages and must be confirmed or
// replaced with the studio's real work and photography before launch.
// Flavour and serving guidance are PLACEHOLDERS until confirmed.
// ============================================================================

// Flavour options shown across cake pages. ⚠️ PLACEHOLDER — confirm before launch.
export const flavourOptions = [
  'Vanilla bean & mascarpone',
  'Lemon & elderflower',
  'Dark chocolate & salted caramel',
  'Almond & raspberry',
  'Earl grey & honey',
  'Coconut & lime',
]

// Serving guidance. ⚠️ PLACEHOLDER — confirm before launch.
export const servingGuides = [
  { size: '6 inch', servings: '6–8 servings' },
  { size: '8 inch', servings: '12–16 servings' },
  { size: '10 inch', servings: '22–28 servings' },
  { size: '12 inch', servings: '36–45 servings' },
]

const rawCakes = [
  {
    slug: 'iris',
    name: 'Iris',
    collectionSlug: 'romantic-garden',
    collectionName: 'Romantic Garden',
    occasion: 'Wedding',
    summary: 'A clean tiered form dressed in a loose arrangement of sugar flowers.',
    description:
      'Iris began as a study in restraint — how few elements a wedding cake needs before it feels complete. The answer was a soft ivory ground, a single trailing cluster of hand-shaped flowers, and almost nothing else. The flowers gather on one side as if the wind placed them, leaving the rest of the cake to its quiet lines.',
    paletteKey: 'garden',
    featured: true,
    development: true,
  },
  {
    slug: 'wisteria',
    name: 'Wisteria',
    collectionSlug: 'romantic-garden',
    collectionName: 'Romantic Garden',
    occasion: 'Birthday',
    summary: 'Trailing sugar wisteria spilling over a soft lilac ground.',
    description:
      'Wisteria takes its name from the way the flowers fall — a cascade of pale lilac trailing down one edge of the cake. The colour is built up in translucent layers so it reads as petal rather than paint, and the ground is left deliberately plain so the movement can carry the whole design.',
    paletteKey: 'garden',
    featured: true,
    development: true,
  },
  {
    slug: 'marguerite',
    name: 'Marguerite',
    collectionSlug: 'romantic-garden',
    collectionName: 'Romantic Garden',
    occasion: 'Celebration',
    summary: 'A single oversized daisy on a fresh green base.',
    description:
      'Marguerite is a small cake with a big idea — one generous daisy, shaped by hand and set against a soft sage ground. It is the sort of design that earns its simplicity through confidence: there is nowhere for the work to hide, so every edge matters.',
    paletteKey: 'garden',
    featured: false,
    development: true,
  },
  {
    slug: 'pillar',
    name: 'Pillar',
    collectionSlug: 'modern-sculptural',
    collectionName: 'Modern Sculptural',
    occasion: 'Birthday',
    summary: 'A single bold tier with a confident, matte finish.',
    description:
      'Pillar is built around a single gesture: a clean, matte form with one architectural line drawn across it. There is no floristry and no flourish — the whole design depends on proportion and the quality of the finish, which is exactly the point.',
    paletteKey: 'sculptural',
    featured: true,
    development: true,
  },
  {
    slug: 'atrium',
    name: 'Atrium',
    collectionSlug: 'modern-sculptural',
    collectionName: 'Modern Sculptural',
    occasion: 'Wedding',
    summary: 'Stacked geometric tiers with a quiet, architectural air.',
    description:
      'Atrium thinks of a cake the way an architect thinks of a room — in terms of light, weight and the relationship between two forms. The tiers are slightly offset, the surface is smooth and matte, and a single thin line of tone marks where they meet.',
    paletteKey: 'sculptural',
    featured: false,
    development: true,
  },
  {
    slug: 'slate-and-honey',
    name: 'Slate & Honey',
    collectionSlug: 'modern-sculptural',
    collectionName: 'Modern Sculptural',
    occasion: 'Celebration',
    summary: 'A restrained two-tone study in deep slate and warm gold.',
    description:
      'Slate & Honey pairs a deep, grounded tone with a sliver of warm gold — a colour combination that comes from watching late light hit stone. The design is a study in balance: dark and light, cool and warm, kept in perfect tension across a single tier.',
    paletteKey: 'sculptural',
    featured: false,
    development: true,
  },
  {
    slug: 'watercolour',
    name: 'Watercolour',
    collectionSlug: 'painterly-colour',
    collectionName: 'Painterly Colour',
    occasion: 'Birthday',
    summary: 'A hand-painted surface that blends colour like wash on paper.',
    description:
      'Watercolour treats the surface of the cake as a canvas. Colour is brushed on wet and left to meet and blend, so the result is alive and never repeats. No two are identical — the painting is the point, and the cake becomes its own small artwork.',
    paletteKey: 'painterly',
    featured: true,
    development: true,
  },
  {
    slug: 'persimmon',
    name: 'Persimmon',
    collectionSlug: 'painterly-colour',
    collectionName: 'Painterly Colour',
    occasion: 'Celebration',
    summary: 'A colour-blocked cake built around one warm, autumnal hue.',
    description:
      'Persimmon commits fully to a single warm hue — confident, seasonal and a little unexpected for a cake. The form is simple so the colour can do the talking, finished with a soft texture that catches the light without shining.',
    paletteKey: 'painterly',
    featured: false,
    development: true,
  },
  {
    slug: 'linen',
    name: 'Linen',
    collectionSlug: 'quiet-luxury',
    collectionName: 'Quiet Luxury',
    occasion: 'Wedding',
    summary: 'A textured natural-white surface with a softly draped feel.',
    description:
      'Linen is finished so the surface reads like folded cloth — natural, soft and full of quiet texture. There is no colour to speak of, which is precisely the pleasure: the whole design lives in the way the light moves across its surface.',
    paletteKey: 'quiet',
    featured: true,
    development: true,
  },
  {
    slug: 'alabaster',
    name: 'Alabaster',
    collectionSlug: 'quiet-luxury',
    collectionName: 'Quiet Luxury',
    occasion: 'Celebration',
    summary: 'A stencilled, low-relief pattern across a pale, calm ground.',
    description:
      'Alabaster takes a subtle repeat pattern and lays it low across the surface, so it reveals itself slowly rather than announcing itself. It is a cake for someone who would rather be elegant than loud, and it rewards a closer look.',
    paletteKey: 'quiet',
    featured: false,
    development: true,
  },
]

// ---------------------------------------------------------------------------
// Store pricing & availability.
// ⚠️ PLACEHOLDER prices (GBP) and stock levels — confirm before launch. These
// back the store catalog (Firestore in production, local fallback in dev).
// ---------------------------------------------------------------------------
const storeMeta = {
  iris: { price: 180, stock: 6 },
  wisteria: { price: 120, stock: 8 },
  marguerite: { price: 95, stock: 10 },
  pillar: { price: 110, stock: 8 },
  atrium: { price: 220, stock: 4 },
  'slate-and-honey': { price: 130, stock: 7 },
  watercolour: { price: 140, stock: 9 },
  persimmon: { price: 115, stock: 8 },
  linen: { price: 200, stock: 5 },
  alabaster: { price: 150, stock: 7 },
}

export const cakes = rawCakes.map((c) => ({
  ...c,
  price: storeMeta[c.slug]?.price ?? 90,
  stock: storeMeta[c.slug]?.stock ?? 10,
  active: true,
}))

export const getCakeBySlug = (slug) => cakes.find((c) => c.slug === slug)
export const getFeaturedCakes = () => cakes.filter((c) => c.featured)
export const getCakesByCollection = (slug) =>
  cakes.filter((c) => c.collectionSlug === slug)
