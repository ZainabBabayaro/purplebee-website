// ============================================================================
// CAKES — product catalogue
// productType drives purchase UX:
//   'cake'       — full celebration cake, requires CakeCustomiser (flavour/filling/covering/size)
//   'cake-slice' — individual slice, just qty + add to cart
//   'cake-loaf'  — loaf cake, just qty + add to cart
// ============================================================================

// Cake sponge flavours
export const flavourOptions = [
  'Vanilla bean & mascarpone',
  'Lemon & elderflower',
  'Dark chocolate & salted caramel',
  'Almond & raspberry',
  'Earl grey & honey',
  'Coconut & lime',
]

// Filling flavours
export const fillingOptions = [
  'Vanilla buttercream',
  'Chocolate ganache',
  'Lemon curd & cream',
  'Salted caramel buttercream',
  'Raspberry jam & cream',
  'Whipped mascarpone',
  'Nutella & hazelnut cream',
]

// Covering / finish options
export const coveringOptions = [
  { value: 'fondant',        label: 'Fondant — smooth, structured finish' },
  { value: 'ganache',        label: 'Ganache — rich, glossy coating' },
  { value: 'whipped-cream',  label: 'Whipped cream — light, soft finish' },
]

// Serving guidance — used by full cakes only.
export const servingGuides = [
  { size: '6 inch',  servings: '6–8 servings' },
  { size: '8 inch',  servings: '12–16 servings' },
  { size: '10 inch', servings: '22–28 servings' },
  { size: '12 inch', servings: '36–45 servings' },
]

// Human-readable labels for product type tags
export const productTypeLabel = {
  'cake':       'Cake',
  'cake-slice': 'Cake Slice',
  'cake-loaf':  'Cake Loaf',
}

// ── Full celebration cakes ────────────────────────────────────────────────────
const rawCakes = [
  {
    slug: 'iris',
    name: 'Iris',
    productType: 'cake',
    image: '/images/cakes/ivory-gold-cascade-cake.jpg',
    collectionSlug: 'wedding-cakes',
    collectionName: 'Wedding Cakes',
    occasion: 'Wedding',
    summary: 'A clean tiered form dressed in a loose arrangement of sugar flowers.',
    description: 'Iris began as a study in restraint — how few elements a wedding cake needs before it feels complete. The answer was a soft ivory ground, a single trailing cluster of hand-shaped flowers, and almost nothing else.',
    paletteKey: 'garden',
    featured: true,
  },
  {
    slug: 'wisteria',
    name: 'Wisteria',
    productType: 'cake',
    image: '/images/cakes/sculptural-sage-and-gold-wedding-cake.jpg',
    collectionSlug: 'signature-collection',
    collectionName: 'Signature Collection',
    occasion: 'Birthday',
    summary: 'Trailing sugar wisteria spilling over a soft lilac ground.',
    description: 'Wisteria takes its name from the way the flowers fall — a cascade of pale lilac trailing down one edge of the cake. The colour is built up in translucent layers so it reads as petal rather than paint.',
    paletteKey: 'garden',
    featured: true,
  },
  {
    slug: 'marguerite',
    name: 'Marguerite',
    productType: 'cake',
    image: '/images/cakes/elegant-burgundy-and-gold-cascade-cake.jpg',
    collectionSlug: 'celebration-cakes',
    collectionName: 'Celebration Cakes',
    occasion: 'Celebration',
    summary: 'A single oversized daisy on a fresh green base.',
    description: 'Marguerite is a small cake with a big idea — one generous daisy, shaped by hand and set against a soft sage ground. It is the sort of design that earns its simplicity through confidence.',
    paletteKey: 'garden',
    featured: false,
  },
  {
    slug: 'pillar',
    name: 'Pillar',
    productType: 'cake',
    image: '/images/cakes/sculptural-gold-accented-celebration-cake.jpg',
    collectionSlug: 'bespoke-cakes',
    collectionName: 'Bespoke Cakes',
    occasion: 'Birthday',
    summary: 'A single bold tier with a confident, matte finish.',
    description: 'Pillar is built around a single gesture: a clean, matte form with one architectural line drawn across it. There is no floristry and no flourish — the whole design depends on proportion and the quality of the finish.',
    paletteKey: 'sculptural',
    featured: true,
  },
  {
    slug: 'atrium',
    name: 'Atrium',
    productType: 'cake',
    image: '/images/cakes/sculptural-ivory-and-berry-ruffle-cake.jpg',
    collectionSlug: 'wedding-cakes',
    collectionName: 'Wedding Cakes',
    occasion: 'Wedding',
    summary: 'Stacked geometric tiers with a quiet, architectural air.',
    description: 'Atrium thinks of a cake the way an architect thinks of a room — in terms of light, weight and the relationship between two forms. The tiers are slightly offset, the surface is smooth and matte.',
    paletteKey: 'sculptural',
    featured: false,
  },
  {
    slug: 'slate-and-honey',
    name: 'Slate & Honey',
    productType: 'cake',
    image: '/images/cakes/romantic-blush-sugar-flower-cake.jpg',
    collectionSlug: 'signature-collection',
    collectionName: 'Signature Collection',
    occasion: 'Celebration',
    summary: 'A restrained two-tone study in deep slate and warm gold.',
    description: 'Slate & Honey pairs a deep, grounded tone with a sliver of warm gold. The design is a study in balance: dark and light, cool and warm, kept in perfect tension across a single tier.',
    paletteKey: 'sculptural',
    featured: false,
  },
  {
    slug: 'watercolour',
    name: 'Watercolour',
    productType: 'cake',
    image: '/images/cakes/midnight-gold-spiral-crystal-cake.jpg',
    collectionSlug: 'bespoke-cakes',
    collectionName: 'Bespoke Cakes',
    occasion: 'Birthday',
    summary: 'A hand-painted surface that blends colour like wash on paper.',
    description: 'Watercolour treats the surface of the cake as a canvas. Colour is brushed on wet and left to meet and blend, so the result is alive and never repeats. No two are identical.',
    paletteKey: 'painterly',
    featured: true,
  },
  {
    slug: 'persimmon',
    name: 'Persimmon',
    productType: 'cake',
    image: '/images/cakes/sculptural-blush-ruffle-cake.jpg',
    collectionSlug: 'celebration-cakes',
    collectionName: 'Celebration Cakes',
    occasion: 'Celebration',
    summary: 'A colour-blocked cake built around one warm, autumnal hue.',
    description: 'Persimmon commits fully to a single warm hue — confident, seasonal and a little unexpected for a cake. The form is simple so the colour can do the talking.',
    paletteKey: 'painterly',
    featured: false,
  },

  // ── Cake Slices ─────────────────────────────────────────────────────────────
  // Individual slices — qty only, no customisation required.
  {
    slug: 'vanilla-slice',
    name: 'Vanilla Slice',
    productType: 'cake-slice',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'Vanilla bean sponge with toffee caramel filling and whipped cream cheesecake — one perfect slice.',
    description: 'Our Vanilla Slice brings the classic comfort of fragrant vanilla bean sponge together with a toffee caramel filling and a whisper of whipped cream cheesecake. Familiar, indulgent and exactly as good as it sounds.',
    paletteKey: 'quiet',
    featured: false,
  },
  {
    slug: 'snickers-slice',
    name: 'Snickers Slice',
    productType: 'cake-slice',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'Rich chocolate sponge with dark ganache, salted peanut caramel and peanut buttercream — one indulgent slice.',
    description: 'The Snickers Slice delivers everything you love about our most-requested flavour in a single, beautifully generous portion. Rich chocolate sponge, dark chocolate ganache, homemade salted peanut caramel and peanut buttercream — deeply indulgent in every bite.',
    paletteKey: 'sculptural',
    featured: false,
  },
  {
    slug: 'lemon-blueberry-slice',
    name: 'Lemon Blueberry Slice',
    productType: 'cake-slice',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'Lemon sponge with blueberry filling and cream cheese ganache — one beautifully balanced slice.',
    description: 'Delicate lemon sponge soaked in lemon syrup, layered with blueberry filling and cream cheese ganache. Bright, tangy and creamy — every slice is a celebration of beautifully balanced flavour.',
    paletteKey: 'painterly',
    featured: false,
  },

  // ── Cake Loaves ──────────────────────────────────────────────────────────────
  // Loaf cakes — qty only, no customisation required.
  {
    slug: 'vanilla-loaf',
    name: 'Vanilla Loaf',
    productType: 'cake-loaf',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'Fragrant vanilla bean loaf with toffee caramel swirl — thoughtfully baked for everyday enjoyment.',
    description: 'Our Vanilla Loaf takes the comfort of a classic vanilla bake and elevates it with a fragrant vanilla bean crumb and a gentle toffee caramel swirl. Perfect for gifting, sharing or simply enjoying at home.',
    paletteKey: 'quiet',
    featured: false,
  },
  {
    slug: 'chocolate-loaf',
    name: 'Chocolate Loaf',
    productType: 'cake-loaf',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'Rich dark chocolate loaf with a hint of espresso — a deeply satisfying everyday indulgence.',
    description: 'A deeply satisfying loaf built around rich dark chocolate and a quiet note of espresso. Dense where it should be, tender where it matters — made to be enjoyed on its own or gifted to someone worth it.',
    paletteKey: 'sculptural',
    featured: false,
  },
  // Keeping linen/alabaster as legacy entries — they redirect to the new slugs above
  {
    slug: 'linen',
    name: 'Linen',
    productType: 'cake-slice',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'A textured natural-white surface with a softly draped feel.',
    description: 'Linen is finished so the surface reads like folded cloth — natural, soft and full of quiet texture. Available as individual slices for gifting or tasting.',
    paletteKey: 'quiet',
    featured: false,
  },
  {
    slug: 'alabaster',
    name: 'Alabaster',
    productType: 'cake-loaf',
    image: '',
    collectionSlug: 'slices-and-loaves',
    collectionName: 'Slices & Loaves',
    occasion: 'Celebration',
    summary: 'A stencilled, low-relief pattern across a pale, calm ground.',
    description: 'Alabaster takes a subtle repeat pattern and lays it low across the surface. Available as an elegantly flavoured loaf cake for gifting or everyday enjoyment.',
    paletteKey: 'quiet',
    featured: false,
  },
]

// ── Store pricing & availability ──────────────────────────────────────────────
const storeMeta = {
  iris:                  { price: 280000, stock: 6 },
  wisteria:              { price: 185000, stock: 8 },
  marguerite:            { price: 145000, stock: 10 },
  pillar:                { price: 170000, stock: 8 },
  atrium:                { price: 340000, stock: 4 },
  'slate-and-honey':     { price: 200000, stock: 7 },
  watercolour:           { price: 215000, stock: 9 },
  persimmon:             { price: 175000, stock: 8 },
  // Slices — starting at ₦8,000 as per brief
  'vanilla-slice':       { price: 8000,  stock: 30 },
  'snickers-slice':      { price: 8000,  stock: 30 },
  'lemon-blueberry-slice': { price: 8000, stock: 30 },
  // Loaves — starting at ₦8,000 as per brief
  'vanilla-loaf':        { price: 8000,  stock: 20 },
  'chocolate-loaf':      { price: 8000,  stock: 20 },
  // Legacy
  linen:                 { price: 8000,  stock: 20 },
  alabaster:             { price: 8000,  stock: 20 },
}

export const cakes = rawCakes.map((c) => ({
  ...c,
  price: storeMeta[c.slug]?.price ?? 50000,
  stock: storeMeta[c.slug]?.stock ?? 10,
  active: true,
  image: c.image || '',
}))

export const getCakeBySlug    = (slug) => cakes.find((c) => c.slug === slug)
export const getFeaturedCakes = ()     => cakes.filter((c) => c.featured)
export const getCakesByCollection = (slug) => cakes.filter((c) => c.collectionSlug === slug)
