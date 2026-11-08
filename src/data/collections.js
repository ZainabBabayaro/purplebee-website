// ============================================================================
// COLLECTIONS — Purple Bee Cakes product categories
// ============================================================================

export const collections = [
  {
    slug: 'celebration-cakes',
    name: 'Celebration Cakes',
    subtitle: 'For every milestone worth making unforgettable.',
    description: 'A birthday, anniversary, graduation or a milestone worth marking. Give your celebration a centrepiece that feels as special as the occasion.',
    occasions: ['Birthdays', 'Anniversaries', 'Graduations', 'Baby showers'],
    paletteKey: 'painterly',
    icon: '🎂',
  },
  {
    slug: 'slices-and-loaves',
    name: 'Slices & Loaves',
    subtitle: 'Everyday indulgence, beautifully made.',
    description: 'Individual cake slices perfect for gifting, tasting or treating yourself, alongside elegantly flavoured loaf cakes for everyday moments. Each one made with the same care as our full celebration cakes.',
    occasions: ['Gifting', 'Home', 'Events', 'Tasting'],
    paletteKey: 'quiet',
    icon: '◇',
  },
  {
    slug: 'bespoke-cakes',
    name: 'Bespoke Cakes',
    subtitle: 'Your vision, thoughtfully brought to life.',
    description: 'Every bespoke cake begins with a conversation. We design around your occasion, your colours and your vision — no two are alike.',
    occasions: ['Weddings', 'Birthdays', 'Milestones', 'Any celebration'],
    paletteKey: 'garden',
    icon: '✦',
  },
  {
    slug: 'wedding-cakes',
    name: 'Wedding Cakes',
    subtitle: 'The sweetest centrepiece to your forever.',
    description: 'Multi-tiered wedding cakes designed to complement your setting and style, with flavours as memorable as the occasion.',
    occasions: ['Weddings', 'Engagements', 'Anniversaries'],
    paletteKey: 'sculptural',
    icon: '♡',
  },
  {
    slug: 'corporate-cakes',
    name: 'Corporate Cakes',
    subtitle: 'Making business milestones worth celebrating.',
    description: 'Thoughtfully designed corporate cakes that bring a touch of distinction to company celebrations, product launches, client appreciation and team milestones.',
    occasions: ['Corporate Anniversaries', 'Product Launches', 'Company Milestones', 'Client Appreciation'],
    paletteKey: 'sculptural',
    icon: '◈',
  },
  {
    slug: 'signature-collection',
    name: 'Signature Collection',
    subtitle: 'Our most-loved designs, ready to order.',
    description: 'A curated selection of Purple Bee Cakes signature designs — refined, repeatable and always made fresh to order.',
    occasions: ['Birthdays', 'Celebrations', 'Gifts'],
    paletteKey: 'quiet',
    icon: '❋',
  },
]

export const getCollectionBySlug = (slug) =>
  collections.find((c) => c.slug === slug)
