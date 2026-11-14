// ============================================================================
// COLLECTIONS — Purple Bee Cakes product categories
// ----------------------------------------------------------------------------
// This file is the seed/fallback catalogue. In production the admin-managed
// Firestore `collections` collection is the source of truth; these records are
// used for prerendering and as a graceful fallback if the backend is empty.
// ============================================================================

export const collections = [
  {
    slug: 'celebration-cakes',
    name: 'Celebration Cakes',
    seoTitle: 'Celebration Cakes in Abuja | Purple Bee Cakes',
    seoDescription: 'Order beautifully designed celebration cakes in Abuja for birthdays, anniversaries, graduations and milestones. Each cake is made to order and finished by hand.',
    subtitle: 'For every milestone worth making unforgettable.',
    description: 'A birthday, anniversary, graduation or a milestone worth marking. Give your celebration a centrepiece that feels as special as the occasion.',
    intro: 'Thoughtfully designed celebration cakes, made to order for the moments that matter.',
    occasions: ['Birthdays', 'Anniversaries', 'Graduations', 'Baby showers'],
    paletteKey: 'painterly',
    icon: '🎂',
    bannerImage: '/images/cakes/celebration_cake.webp',
    visible: true,
    published: true,
    displayOrder: 0,
    productIds: [],
  },
  {
    slug: 'slices-and-loaves',
    name: 'Slices & Loaves',
    seoTitle: 'Cake Slices and Cake Loaves in Abuja | Purple Bee Cakes',
    seoDescription: 'Indulgent cake slices and flavoured loaf cakes in Abuja — perfect for gifting, tasting or enjoying at home. Made fresh to order with the same care as our celebration cakes.',
    subtitle: 'Everyday indulgence, beautifully made.',
    description: 'Individual cake slices perfect for gifting, tasting or treating yourself, alongside elegantly flavoured loaf cakes for everyday moments. Each one made with the same care as our full celebration cakes.',
    intro: 'Individual slices and elegantly flavoured loaves — the same care as our full celebration cakes, in everyday portions.',
    occasions: ['Gifting', 'Home', 'Events', 'Tasting'],
    paletteKey: 'quiet',
    icon: '◇',
    bannerImage: '/images/cakes/slice-combo.webp',
    visible: true,
    published: true,
    displayOrder: 1,
    productIds: [],
  },
  {
    slug: 'bespoke-cakes',
    name: 'Bespoke Cakes',
    seoTitle: 'Bespoke Cakes in Abuja | Custom Cake Design | Purple Bee Cakes',
    seoDescription: 'Commission a bespoke cake in Abuja designed entirely around your occasion, colours and vision. Custom celebration, wedding and designer cakes made to order.',
    subtitle: 'Your vision, thoughtfully brought to life.',
    description: 'Every bespoke cake begins with a conversation. We design around your occasion, your colours and your vision — no two are alike.',
    intro: 'Commissioned from scratch around your occasion, palette and ideas.',
    occasions: ['Weddings', 'Birthdays', 'Milestones', 'Any celebration'],
    paletteKey: 'garden',
    icon: '✦',
    bannerImage: '/images/cakes/Bespoke_cake.webp',
    visible: true,
    published: true,
    displayOrder: 2,
    productIds: [],
  },
  {
    slug: 'wedding-cakes',
    name: 'Wedding Cakes',
    seoTitle: 'Wedding Cakes in Abuja | Luxury Custom Wedding Cakes',
    seoDescription: 'Elegant multi-tiered wedding cakes in Abuja, designed to complement your style and setting. Luxury custom designs with considered flavours and meticulous finishing.',
    subtitle: 'The sweetest centrepiece to your forever.',
    description: 'Multi-tiered wedding cakes designed to complement your setting and style, with flavours as memorable as the occasion.',
    intro: 'Multi-tiered centrepieces designed to complement your setting and style.',
    occasions: ['Weddings', 'Engagements', 'Anniversaries'],
    paletteKey: 'sculptural',
    icon: '♡',
    bannerImage: '/images/cakes/geo_1.webp',
    visible: true,
    published: true,
    displayOrder: 3,
    productIds: [],
  },
  {
    slug: 'corporate-cakes',
    name: 'Corporate Cakes',
    seoTitle: 'Corporate Cakes in Abuja | Branded Event Cakes | Purple Bee Cakes',
    seoDescription: 'Distinctive corporate cakes in Abuja for launches, client appreciation, company milestones and branded events. Made to order with a refined, professional finish.',
    subtitle: 'Making business milestones worth celebrating.',
    description: 'Thoughtfully designed corporate cakes that bring a touch of distinction to company celebrations, product launches, client appreciation and team milestones.',
    intro: 'Distinctive cakes for launches, client appreciation and company milestones.',
    occasions: ['Corporate Anniversaries', 'Product Launches', 'Company Milestones', 'Client Appreciation'],
    paletteKey: 'sculptural',
    icon: '◈',
    bannerImage: '/images/cakes/corperate-1.webp',
    visible: true,
    published: true,
    displayOrder: 4,
    productIds: [],
  },
  {
    slug: 'signature-collection',
    name: 'Signature Collection',
    seoTitle: 'Signature Cakes in Abuja | Purple Bee Cakes',
    seoDescription: 'Our curated signature cake collection — refined designs made fresh to order for celebrations in Abuja. Browse our most-loved cakes and order online.',
    subtitle: 'Our most-loved designs, ready to order.',
    description: 'A curated selection of Purple Bee Cakes signature designs — refined, repeatable and always made fresh to order.',
    intro: 'Our most-loved designs, refined and ready to order.',
    occasions: ['Birthdays', 'Celebrations', 'Gifts'],
    paletteKey: 'quiet',
    icon: '❋',
    bannerImage: '/images/cakes/celebrate.webp',
    visible: true,
    published: true,
    displayOrder: 5,
    productIds: [],
  },
]

export const getCollectionBySlug = (slug) =>
  collections.find((c) => c.slug === slug)

export function normalizeCollection(collection) {
  if (!collection) return null
  const c = { ...collection }
  c.id = c.id || c.slug
  c.slug = c.slug || c.id
  c.name = c.name || 'Untitled collection'
  c.subtitle = c.subtitle || ''
  c.description = c.description || ''
  c.intro = c.intro || ''
  c.occasions = Array.isArray(c.occasions) ? c.occasions : []
  c.productIds = Array.isArray(c.productIds) ? c.productIds : []
  c.bannerImage = c.bannerImage || ''
  c.paletteKey = c.paletteKey || 'quiet'
  c.icon = c.icon || '◇'
  c.visible = c.visible !== false
  c.published = c.published !== false
  c.displayOrder = Number.isFinite(Number(c.displayOrder)) ? Number(c.displayOrder) : 0
  return c
}

export function isCollectionVisible(collection) {
  return collection?.visible !== false && collection?.published !== false
}
