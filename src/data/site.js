// ============================================================================
// SITE / BUSINESS INFORMATION
// ----------------------------------------------------------------------------
// Every concrete business detail below (email, phone, address, social
// handles, service area, domain) is a PLACEHOLDER that must be confirmed and
// replaced by the business owner before launch. Nothing here is verified.
// The structure is data-driven so updates only need to happen in this file.
// ============================================================================

export const site = {
  name: 'Purple Bee Cakes',
  // Short, refined wordmark used in the header.
  monogram: 'PB',
  tagline: 'Bespoke cake design studio',
  description:
    'Purple Bee Cakes is a cake design studio crafting bespoke celebration and wedding cakes. Each cake is designed around the occasion, made with considered flavour and a love for the finer details, for the moments that matter most.',

  // ⚠️ PLACEHOLDER — replace with the live domain before deployment.
  url: 'https://www.purplebeecakes.co.uk',

  contact: {
    // ⚠️ PLACEHOLDERS — confirm real details before launch.
    email: 'hello@purplebeecakes.co.uk',
    phone: '',
    // Hours intentionally omitted until confirmed.
  },

  // ⚠️ PLACEHOLDER — confirm the real service area before launch.
  serviceArea: 'Greater London & surrounding areas — to be confirmed',

  social: [
    // ⚠️ PLACEHOLDER handles — replace with verified accounts before launch.
    { label: 'Instagram', href: 'https://instagram.com/purplebeecakes', handle: '@purplebeecakes' },
    { label: 'Facebook', href: 'https://facebook.com/purplebeecakes', handle: 'Purple Bee Cakes' },
    { label: 'Pinterest', href: 'https://pinterest.com/purplebeecakes', handle: 'Purple Bee Cakes' },
  ],

  // Used for structured data. ⚠️ PLACEHOLDER — replace before launch.
  founded: '',

  // Price guidance defaults. ⚠️ PLACEHOLDERS — confirm before launch.
  startingPrice: 'POA',
}

// Content shown on the enquiry page to set expectations. Real business only.
export const enquiryInfo = {
  leadTime:
    'Bespoke cakes are made to order. Please enquire as early as you can — ideally several weeks ahead — so there is time to design, source and craft your cake.',
  process: [
    {
      step: '01',
      title: 'Share your vision',
      body: 'Tell us about your occasion, the feel you are after and anything that has caught your eye. Reference images are welcome.',
    },
    {
      step: '02',
      title: 'Design conversation',
      body: 'We talk through design direction, flavours, size and the practical details so the cake fits your celebration and your setting.',
    },
    {
      step: '03',
      title: 'Crafted for your day',
      body: 'Your cake is made to order and finished by hand, ready for collection or delivery as agreed for your occasion.',
    },
  ],
}
