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
      'A beautifully made cake that became the centre of our day — the design felt considered down to the smallest detail and it tasted as good as it looked.',
    author: 'Sample testimonial — replace before launch',
    context: 'Celebration cake',
    development: true,
  },
  {
    quote:
      'The whole process felt personal. We talked through what we wanted, and the cake that arrived was exactly right — calm, elegant and entirely ours.',
    author: 'Sample testimonial — replace before launch',
    context: 'Wedding cake',
    development: true,
  },
  {
    quote:
      'Thoughtful, skilful and genuinely lovely to work with. The cake was the talking point of the evening for all the right reasons.',
    author: 'Sample testimonial — replace before launch',
    context: 'Milestone birthday',
    development: true,
  },
]

export const testimonialsArePlaceholders = testimonials.every((t) => t.development)
