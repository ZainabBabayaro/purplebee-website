// ============================================================================
// COLLECTIONS — curated design families
// ----------------------------------------------------------------------------
// These are curated DIRECTIONAL collections that show how the studio thinks
// about cake design. They are development content (`development: true`) and
// must be confirmed or replaced by the business owner before launch. The
// descriptions are written as design directions, not confirmed product lines.
// ============================================================================

export const collections = [
  {
    slug: 'romantic-garden',
    name: 'Romantic Garden',
    subtitle: 'Floral, soft, alive with detail',
    description:
      'Hand-finished sugar flowers and gathered botanical details, designed for celebrations that lean toward the romantic. Soft colour, considered asymmetry and a sense of something grown rather than simply made.',
    occasions: ['Weddings', 'Anniversaries', 'Milestone birthdays'],
    paletteKey: 'garden',
    development: true,
  },
  {
    slug: 'modern-sculptural',
    name: 'Modern Sculptural',
    subtitle: 'Minimal forms, confident lines',
    description:
      'Clean silhouettes and a restrained palette, where one beautiful idea is allowed to breathe. For the modern celebration that speaks quietly but says exactly what it means.',
    occasions: ['Birthdays', 'Civil ceremonies', 'Contemporary celebrations'],
    paletteKey: 'sculptural',
    development: true,
  },
  {
    slug: 'painterly-colour',
    name: 'Painterly Colour',
    subtitle: 'Colour as the subject',
    description:
      'Cakes that treat colour the way a painter does — layered, blended, sometimes unexpected. A celebration of hue, used with intention and never simply for its own sake.',
    occasions: ['Birthdays', 'Celebrations', 'Creative briefs'],
    paletteKey: 'painterly',
    development: true,
  },
  {
    slug: 'quiet-luxury',
    name: 'Quiet Luxury',
    subtitle: 'Texture, tone, restraint',
    description:
      'Textured butters and natural tones — the kind of detail you feel before you quite notice it. Understated cakes for occasions where quiet elegance is the whole point.',
    occasions: ['Weddings', 'Anniversaries', 'Intimate gatherings'],
    paletteKey: 'quiet',
    development: true,
  },
]

export const getCollectionBySlug = (slug) =>
  collections.find((c) => c.slug === slug)
