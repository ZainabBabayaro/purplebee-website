// ============================================================================
// TESTIMONIALS
// ----------------------------------------------------------------------------
// These are DEVELOPMENT SAMPLES only (`development: true`). No genuine customer
// reviews, identities, star ratings or review counts are presented. Replace
// every entry with verified, consented customer feedback before launch and
// remove the development notice. The component renders a visible placeholder
// banner so this is never mistaken for real reviews.
// ============================================================================

export const testimonials = [
  {
    quote:
      'The cake was soo beautiful. I felt guilty for destroying art.',
    author: 'Bukola',
    context: 'Celebration cake',
    development: true,
  },
  {
    quote:
      'The cakes are soo nice. I\’m a very good customer and I always recommend people because it\’s one of the best cakes I\’ve tasted by farr',
    author: 'Faidat B.',
    context: 'Wedding cake',
    development: true,
  },
  {
    quote:
      'I love your hospitality, trust in your customers and above all, the taste of your cake is wow! Good packaging thumbs up.',
    author: 'Abimbola ',
    context: 'Celebration birthday',
    development: true,
  },
]

export const testimonialsArePlaceholders = testimonials.every((t) => t.development)
