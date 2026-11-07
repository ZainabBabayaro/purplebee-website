// ============================================================================
// COLLECTIONS — Purple Bee Cakes product categories
// ============================================================================

export const collections = [
    {
    slug: 'celebration-cakes',
    name: 'Celebration Cakes',
    subtitle: 'For every milestone worth marking',
    description:
'A birthday, anniversary, graduation or a milestone worth marking. Give your celebration a centrepiece that feels as special as the occasion.',
    occasions: ['Birthdays', 'Anniversaries', 'Graduations', 'Baby showers'],
    paletteKey: 'painterly',
    icon: '🎂',
  },
    {
    slug: 'cake-slices',
    name: 'Cake Slices',
    subtitle: 'Your favourite part of the day, beautifully served.',
    description:
      'Sometimes, the best reason to have cake is simply wanting cake.  Our individual cake slices are perfect for gifting, sampling flavours, or treating yourself. Each slice is made with the same care as our full cakes.',
    occasions: ['Gifting', 'Tasting', 'Events'],
    paletteKey: 'garden',
    icon: '◇',
  },
  {
    slug: 'loaf-cakes',
    name: 'Loaf Cakes',
    subtitle: 'Everyday indulgence, thoughtfully baked',
    description:
      'Elegantly flavoured loaf cakes for gifting, gathering or simply enjoying at home. Available in a rotating selection of seasonal flavours.',
    occasions: ['Gifting', 'Home', 'Events'],
    paletteKey: 'quiet',
    icon: '▭',
  },
  {
    slug: 'bespoke-cakes',
    name: 'Bespoke Cakes',
    subtitle: 'Designed entirely around you',
    description:
      'Every bespoke cake begins with a conversation. We design around your occasion, your colours and your vision — no two are alike.',
    occasions: ['Weddings', 'Birthdays', 'Milestones', 'Any celebration'],
    paletteKey: 'garden',
    icon: '✦',
  },


  {
    slug: 'wedding-cakes',
    name: 'Wedding Cakes',
    subtitle: 'The centrepiece of your day',
    description:
      'Multi-tiered wedding cakes designed to complement your setting and style, with flavours as memorable as the occasion.',
    occasions: ['Weddings', 'Engagements', 'Anniversaries'],
    paletteKey: 'sculptural',
    icon: '♡',
  },
{
  slug: 'corporate-cakes',
  name: 'Corporate Cakes',
  subtitle: 'Making business milestones worth celebrating.',
  description:
    'Thoughtfully designed corporate cakes that bring a touch of distinction to company celebrations, product launches, client appreciation, team milestones and special business occasions. Beautifully presented and crafted with exceptional flavours, they make every achievement a little sweeter.',
  occasions: [
    'Corporate Anniversaries',
    'Staff Birthdays',
    'Product Launches',
    'Company Milestones',
    'Client Appreciation',
    'Office Celebrations',
    'Team Achievements',
    'End of the year gifting'
  ],
  paletteKey: 'sculptural',
  icon: '♡',
}

]

export const getCollectionBySlug = (slug) =>
  collections.find((c) => c.slug === slug)
