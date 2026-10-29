// ============================================================================
// JOURNAL — editorial content
// ----------------------------------------------------------------------------
// Original, useful articles written to answer real customer questions.
// Rich block types: p, h2, h3, pullquote, tip, list, table, divider.
// Tags drive internal related-post linking.
// ============================================================================

export const categories = [
  { slug: 'planning', label: 'Planning' },
  { slug: 'flavour', label: 'Flavour' },
  { slug: 'design', label: 'Design' },
  { slug: 'weddings', label: 'Weddings' },
  { slug: 'studio-notes', label: 'Studio notes' },
]

export const journal = [
  // =========================================================================
  {
    slug: 'how-to-choose-a-cake-size',
    title: 'How to choose the right cake size for your celebration',
    excerpt:
      'Cake size is one of the first decisions to make and one of the easiest to get wrong. This guide walks through every variable — from guest counts and serving styles to tiers and keepsakes — so you can order with confidence.',
    category: 'planning',
    categoryLabel: 'Planning',
    date: '2026-09-15',
    readTime: '6 min read',
    featured: true,
    tags: ['sizing', 'planning', 'servings', 'tiers'],
    paletteKey: 'garden',
    body: [
      {
        type: 'p',
        text: 'Order too small and the cake disappears before the speeches. Order too large and you are sending slices home in serviettes. Neither is the end of the world, but a little planning beforehand makes the choice easy — and means the cake looks right on the table as well as feeding everyone at it.',
      },
      {
        type: 'h2',
        text: 'Start with the guest count',
      },
      {
        type: 'p',
        text: 'The first question is how many people you are feeding. The second — often forgotten — is whether the cake is the only dessert or one of several. A cake served as the sole sweet will need to work harder than one on a dessert table alongside other options.',
      },
      {
        type: 'tip',
        text: 'Count confirmed adults and children separately. Children often take half portions, which gives you a little flexibility on total servings.',
      },
      {
        type: 'h2',
        text: 'A practical size guide',
      },
      {
        type: 'p',
        text: 'Round cakes are sized by diameter. These are honest, generous serving estimates — not the optimistic figures you sometimes see on packaging.',
      },
      {
        type: 'table',
        head: ['Size', 'Servings (dessert)', 'Servings (finger slices)'],
        rows: [
          ['6 inch', '8–10', '14–16'],
          ['7 inch', '12–14', '20–22'],
          ['8 inch', '16–20', '26–30'],
          ['9 inch', '22–26', '34–40'],
          ['10 inch', '28–34', '44–52'],
          ['12 inch', '40–50', '64–74'],
        ],
      },
      {
        type: 'h2',
        text: 'When tiers make sense',
      },
      {
        type: 'p',
        text: 'A tiered cake is not just a larger cake — it is a design object that earns its place at the centre of the table. If you are feeding more than 60 guests, tiers usually give better proportions than one very wide single tier. They also let you offer more than one flavour, which is worth considering for larger parties where tastes vary.',
      },
      {
        type: 'pullquote',
        text: 'A tiered cake is a design object first. Size and servings follow naturally once the look is right.',
      },
      {
        type: 'h3',
        text: 'Typical two-tier combinations',
      },
      {
        type: 'list',
        items: [
          '6 inch + 8 inch — roughly 28–34 servings, compact and elegant',
          '8 inch + 10 inch — roughly 48–56 servings, a good mid-size option',
          '10 inch + 12 inch — roughly 72–86 servings, suits larger receptions',
        ],
      },
      {
        type: 'h2',
        text: 'Saving a top tier',
      },
      {
        type: 'p',
        text: 'If you want to freeze the top tier as a keepsake — a tradition at weddings — factor that into your serving count. A 6-inch top tier feeds around 8–10 people as dessert, so subtract those portions from your available total.',
      },
      {
        type: 'h2',
        text: 'When to go up a size',
      },
      {
        type: 'p',
        text: 'If you are between sizes, go up. The difference in cost is rarely significant compared to the peace of mind — and a slightly larger cake almost always looks better on the table than one that is just barely enough.',
      },
      {
        type: 'tip',
        text: 'Tell your cake designer your exact guest count and whether the cake is the main dessert. They will recommend a size that looks right for the design as well as feeding everyone comfortably.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'celebration-cake-flavours-guide',
    title: 'A complete guide to celebration cake flavours',
    excerpt:
      'Flavour deserves as much thought as decoration. From seasonal pairings and filling combinations to what works for large weddings versus intimate birthdays — everything you need to choose a cake that tastes as good as it looks.',
    category: 'flavour',
    categoryLabel: 'Flavour',
    date: '2026-08-28',
    readTime: '7 min read',
    featured: false,
    tags: ['flavour', 'planning', 'weddings', 'sponge'],
    paletteKey: 'painterly',
    body: [
      {
        type: 'p',
        text: 'The design is the first impression. The flavour is the lasting one. A cake that looks extraordinary but tastes ordinary is a missed opportunity — and the inverse is just as true. Treating flavour with the same care as decoration is what separates a genuinely memorable cake from one that is merely photographed.',
      },
      {
        type: 'h2',
        text: 'Think about the season first',
      },
      {
        type: 'p',
        text: 'Seasonal intuition applies to cake flavours just as it does to menus. Summer calls for bright, clean notes — lemon and elderflower, coconut and lime, vanilla and fresh berries. Autumn and winter welcome warmth and depth: dark chocolate and salted caramel, earl grey and honey, almond and spiced pear.',
      },
      {
        type: 'pullquote',
        text: 'A cake made in July should taste like July. Let the season do some of the work.',
      },
      {
        type: 'h2',
        text: 'Pairing sponge and filling',
      },
      {
        type: 'p',
        text: 'The sponge and the filling are in conversation with each other. A delicate vanilla sponge wants an equally considered filling — a light mascarpone, a barely-sweet elderflower cream. An almond sponge can stand up to something more assertive, like a sharp raspberry compote or a bitter chocolate ganache.',
      },
      {
        type: 'tip',
        text: 'Avoid the instinct to simply make everything richer. Sometimes a counterpoint — something acidic against something sweet, or something floral against something nutty — makes the whole more interesting than the sum of its parts.',
      },
      {
        type: 'h2',
        text: 'Our most-requested flavour combinations',
      },
      {
        type: 'list',
        items: [
          'Vanilla bean sponge with mascarpone and fresh strawberry — the one that works for everyone',
          'Lemon sponge with elderflower cream and lemon curd — bright and celebratory',
          'Dark chocolate sponge with salted caramel buttercream — rich without being cloying',
          'Almond and raspberry — a classic pairing with a European elegance',
          'Earl grey sponge with honey cream and fig — subtle and grown-up',
          'Coconut sponge with lime and mango — summery, light, unexpectedly popular at weddings',
        ],
      },
      {
        type: 'h2',
        text: 'Two flavours for larger celebrations',
      },
      {
        type: 'p',
        text: 'For any celebration over 50 guests, offering two flavours is worth considering — one that feels familiar and one that gives the curious something to seek out. The most natural way is to split tiers: a chocolate and salted caramel base, a lemon and elderflower top. Guests remember the choice.',
      },
      {
        type: 'h2',
        text: 'Dietary requirements',
      },
      {
        type: 'p',
        text: 'If you know guests have dietary needs, mention them early. Gluten-free sponges, dairy-free buttercreams and egg-free options are all possible — but they need to be built into the design from the start, not added as an afterthought. A separate small cake for guests with requirements is sometimes the most elegant solution at larger events.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'what-makes-a-cake-bespoke',
    title: 'What makes a cake truly bespoke',
    excerpt:
      'Bespoke is used loosely — it has started to mean "customisable" when it should mean something more specific. This is what bespoke actually looks like in practice, and why the distinction matters.',
    category: 'studio-notes',
    categoryLabel: 'Studio notes',
    date: '2026-08-10',
    readTime: '5 min read',
    featured: false,
    tags: ['bespoke', 'design', 'process', 'studio'],
    paletteKey: 'quiet',
    body: [
      {
        type: 'p',
        text: 'Bespoke has been stretched. It now appears on everything from supermarket sandwich boxes to online cake configurators where you choose a size and a flavour from a dropdown. That is not bespoke — that is customisation, and the difference is worth understanding if you are deciding whether to commission one.',
      },
      {
        type: 'pullquote',
        text: 'Customisation chooses from a menu. Bespoke begins with a blank sheet.',
      },
      {
        type: 'h2',
        text: 'It begins with questions, not options',
      },
      {
        type: 'p',
        text: 'A bespoke cake starts with conversation. Not "which flavour?" but "who is this for?", "what does your day look like?", "what matters to you about this cake?" The design grows from those answers rather than from a template.',
      },
      {
        type: 'p',
        text: 'That conversation is what creates the relationship between the cake and the occasion. A wedding cake that references a specific garden, a birthday cake that plays with someone\'s particular sense of colour — these are things that cannot be configured in a dropdown. They require a designer who is actually listening.',
      },
      {
        type: 'h2',
        text: 'Design and flavour developed together',
      },
      {
        type: 'p',
        text: 'In a bespoke process, the appearance and the flavour are not separate decisions. The structure of the cake — how many tiers, what each tier does visually — shapes the eating experience as much as the ingredients. A three-tiered cake with three different flavours tells a story that a single-tier cake simply cannot.',
      },
      {
        type: 'h2',
        text: 'Made once, for one occasion',
      },
      {
        type: 'p',
        text: 'The clearest marker of a bespoke cake is this: it exists for one day, for one set of people, in one place. It is not reproduced. The design might inspire future work, but the cake itself — that exact configuration of form, colour, flavour and decoration — is made once and eaten.',
      },
      {
        type: 'tip',
        text: 'If a cake designer can quote you instantly from a picture without asking a single question about you or your occasion, it probably is not bespoke. A thoughtful process takes a little more time — and that time is where the value lives.',
      },
      {
        type: 'h2',
        text: 'What this means for you',
      },
      {
        type: 'p',
        text: 'Commissioning a bespoke cake is an investment in something that is genuinely yours. It requires a little more from you — a conversation, some decisions, some trust — and it gives you something that could not have existed without you.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'wedding-cake-planning-timeline',
    title: 'The wedding cake planning timeline: when to book, decide and finalise',
    excerpt:
      'Wedding cake decisions sit at the intersection of design, logistics and timing. Start too late and your options narrow. This guide covers exactly when to do what — from the first enquiry to the final confirmation.',
    category: 'weddings',
    categoryLabel: 'Weddings',
    date: '2026-07-20',
    readTime: '7 min read',
    featured: false,
    tags: ['weddings', 'planning', 'timeline', 'booking'],
    paletteKey: 'sculptural',
    body: [
      {
        type: 'p',
        text: 'Wedding cakes are made to order, which means the timeline is real — not a suggestion. A baker can only take on a certain number of cakes in a given week. The more notice you give, the more considered your design can be, and the less likely it is that your date has already gone.',
      },
      {
        type: 'h2',
        text: '12 months before: first enquiry',
      },
      {
        type: 'p',
        text: 'You do not need to know exactly what you want at this stage. You just need a date, a rough guest count, and a sense of the mood of the day. Get in touch early, even if the details are still forming. Popular dates — particularly from April to September — fill quickly.',
      },
      {
        type: 'tip',
        text: 'If you have found a cake designer whose work you love, book before you have finalised anything else. The best cake designers are in demand. A date hold is usually all that is needed at the early stage.',
      },
      {
        type: 'h2',
        text: '6–9 months before: design conversation',
      },
      {
        type: 'p',
        text: 'This is the right moment for a proper design conversation. By now you likely have a venue confirmed, a colour direction for the day, and a rough idea of the aesthetic. Bring any images that show the feeling you are after — not necessarily cakes, but anything that captures the mood.',
      },
      {
        type: 'list',
        items: [
          'Venue photos (exterior and interior, especially where the cake will sit)',
          'Flowers — colours and varieties your florist is working with',
          'Any design reference that communicates the feeling of the day',
          'Your dress, if you are comfortable sharing — it often contains the whole palette',
        ],
      },
      {
        type: 'h2',
        text: '3–4 months before: finalise the design',
      },
      {
        type: 'p',
        text: 'The design should be confirmed and agreed at this point. Changes after this stage are usually possible, but significant changes become harder to accommodate as the date approaches. This is also when any tasting sessions, if offered, typically happen.',
      },
      {
        type: 'pullquote',
        text: 'The design conversation should feel like planning something together, not filling in a form.',
      },
      {
        type: 'h2',
        text: '4–6 weeks before: practical logistics',
      },
      {
        type: 'p',
        text: 'Confirm the delivery address and timing, the point of contact at the venue, and the setup requirements. A tiered cake needs a stable, level surface out of direct sunlight. If your reception is outside, this matters more than you might think.',
      },
      {
        type: 'h2',
        text: '1–2 weeks before: final confirmation',
      },
      {
        type: 'p',
        text: 'A final check-in to confirm guest numbers have not changed significantly, delivery timing is still right, and any last-minute logistical details are settled. After this point, the cake is in production.',
      },
      {
        type: 'h2',
        text: 'On the day',
      },
      {
        type: 'p',
        text: 'You have enough to think about. Your cake should simply arrive, be set up, and be exactly what you discussed. If anything feels unclear in the days before, a quick message to your baker will settle it.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'cake-design-trends-2026',
    title: 'Cake design directions worth knowing in 2026',
    excerpt:
      'Not trends in the fleeting sense, but meaningful shifts in how people are thinking about celebration cakes — and what they say about the way we celebrate now.',
    category: 'design',
    categoryLabel: 'Design',
    date: '2026-07-05',
    readTime: '5 min read',
    featured: false,
    tags: ['design', 'trends', 'style', 'colour'],
    paletteKey: 'painterly',
    body: [
      {
        type: 'p',
        text: 'Design directions in cakes follow broader culture more closely than most people expect. The same conversations happening in interiors, fashion and editorial — about restraint, about authenticity, about colour — eventually arrive on the cake table. Here are the directions that feel genuinely current.',
      },
      {
        type: 'h2',
        text: 'Texture over decoration',
      },
      {
        type: 'p',
        text: 'Decoration is being replaced by surface. Rather than adding elements to a smooth cake, designers are treating the surface itself as the design — raked butter, draped ganache, the pressed impression of fabric or bark. The result is a cake that rewards looking closely without needing anything added.',
      },
      {
        type: 'h2',
        text: 'Colour used with intention',
      },
      {
        type: 'p',
        text: 'The era of the all-white wedding cake is giving way to something more specific. Colour is being used deliberately — one particular dusty sage, one exact terracotta, one considered plum — rather than as a vague backdrop. The shift is from "coloured cake" to "this colour, for this reason".',
      },
      {
        type: 'pullquote',
        text: 'The question is not "should we add colour" but "which colour, and what does it do here?"',
      },
      {
        type: 'h2',
        text: 'Asymmetry and organic placement',
      },
      {
        type: 'p',
        text: 'Formal symmetry — a flower on each tier, matched decorations at equal intervals — is being replaced by a more considered placement that looks placed rather than positioned. One side of the cake is more embellished; the arrangement trails rather than repeats. It reads as designed rather than decorated.',
      },
      {
        type: 'h2',
        text: 'Botanical detail with restraint',
      },
      {
        type: 'p',
        text: 'Sugar flowers are not going anywhere, but the approach has shifted. Rather than abundant trailing arrangements, the tendency now is towards a single considered placement — one branch, one cluster — with the majority of the cake left clean. Restraint makes the detail more valuable.',
      },
      {
        type: 'h2',
        text: 'Cakes that match the table, not just the brief',
      },
      {
        type: 'p',
        text: 'The most interesting cakes being made right now are designed in context — sized and styled for their table, their room, their day. A cake that fits its setting is always more beautiful than one that ignores it.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'how-to-brief-your-cake-designer',
    title: 'How to brief your cake designer: what to say and what to bring',
    excerpt:
      'A clear brief gets you a better cake. Here is exactly what information helps a designer the most, what is less useful than you think, and how to share reference images without accidentally closing down the creative conversation.',
    category: 'planning',
    categoryLabel: 'Planning',
    date: '2026-06-18',
    readTime: '6 min read',
    featured: false,
    tags: ['planning', 'process', 'bespoke', 'design'],
    paletteKey: 'garden',
    body: [
      {
        type: 'p',
        text: 'The brief is the beginning of the design. A useful brief does not mean knowing exactly what you want — it means knowing enough about the occasion, the people and the feeling of the day to give a designer something solid to work from.',
      },
      {
        type: 'h2',
        text: 'What matters most',
      },
      {
        type: 'list',
        items: [
          'The occasion and who it is for — their personality, what they love, what would make them smile',
          'The date and guest count — these shape size and logistics before anything else',
          'The setting — inside or outside, formal or relaxed, intimate or large',
          'The feeling you want — elegant, playful, minimal, romantic, bold',
          'Any colours that are already in the day — flowers, table linens, clothing',
        ],
      },
      {
        type: 'h2',
        text: 'Reference images: how to use them well',
      },
      {
        type: 'p',
        text: 'Reference images are genuinely useful, but the most common mistake is bringing too many — a folder of 40 cakes that all contradict each other. A better approach is to identify the two or three images that best capture the feeling, then say specifically what it is about each one that you love.',
      },
      {
        type: 'tip',
        text: '"I love the shape of the tiers on this one" and "the colour on this one is exactly right" is far more useful than "I want something like all of these".',
      },
      {
        type: 'h2',
        text: 'References do not have to be cakes',
      },
      {
        type: 'p',
        text: 'Some of the most useful reference images are not cakes at all. A piece of fabric, a painting, a room, a garden, a piece of jewellery — anything that communicates a colour, a texture, a mood. The designer\'s job is to translate these into a cake; your job is to show them what you are responding to.',
      },
      {
        type: 'pullquote',
        text: 'The best brief is one that shows the designer how you see the world, not just what you have seen on Pinterest.',
      },
      {
        type: 'h2',
        text: 'What you do not need to know yet',
      },
      {
        type: 'p',
        text: 'You do not need to have decided on the flavour, the exact size, or the precise decoration before your first conversation. These are things you will work out together. What you need to bring is a clear picture of the occasion and the people — everything else grows from there.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'storing-and-serving-your-cake',
    title: 'Storing and serving your celebration cake',
    excerpt:
      'A beautiful cake deserves to be served at its best. How to store it before the celebration, cut it cleanly, and — if there is any left — keep it well afterwards.',
    category: 'planning',
    categoryLabel: 'Planning',
    date: '2026-05-30',
    readTime: '4 min read',
    featured: false,
    tags: ['serving', 'storage', 'planning', 'events'],
    paletteKey: 'quiet',
    body: [
      {
        type: 'p',
        text: 'The care that goes into making a cake should extend to how it is looked after before and during the celebration. Most issues with cakes at events come from environment and handling — not from the cake itself.',
      },
      {
        type: 'h2',
        text: 'Storing the cake before the event',
      },
      {
        type: 'p',
        text: 'A buttercream cake is best stored in a cool room, out of direct sunlight. A refrigerator is too cold and too dry for most decorated cakes — it can cause condensation that affects the surface finish. A cool hallway or pantry is usually ideal.',
      },
      {
        type: 'tip',
        text: 'If it is summer and your home is warm, a light box or cake dome placed over the cake (without touching the decoration) will protect it from the heat and from curious hands.',
      },
      {
        type: 'h2',
        text: 'At the venue',
      },
      {
        type: 'p',
        text: 'The ideal position for a cake table is away from direct sunlight, away from heating vents or radiators, and on a level surface. For outdoor events, shade is essential — buttercream will soften and begin to melt in direct sun.',
      },
      {
        type: 'h2',
        text: 'Cutting the cake',
      },
      {
        type: 'p',
        text: 'Use a long, thin-bladed knife — not a serrated bread knife. Dip it in hot water and wipe it clean between cuts for the cleanest slices. Cut around the outside of the cake in a circular pattern rather than working from the centre outward.',
      },
      {
        type: 'table',
        head: ['Tier size', 'Grid cuts', 'Portions'],
        rows: [
          ['6 inch', '3×3 roughly', '8–10'],
          ['8 inch', '4×3 roughly', '14–18'],
          ['10 inch', '5×4 roughly', '24–30'],
          ['12 inch', '6×5 roughly', '40–48'],
        ],
      },
      {
        type: 'h2',
        text: 'Storing leftovers',
      },
      {
        type: 'p',
        text: 'Cut cake keeps well wrapped in cling film in the fridge for two to three days. Let it come to room temperature for 30 minutes before eating — cold cake is denser and less flavourful than cake at room temperature. Sponge cake also freezes well: wrap individual slices tightly and freeze for up to three months.',
      },
    ],
  },

  // =========================================================================
  {
    slug: 'colour-in-cake-design',
    title: 'Colour in cake design: how we use it and why it matters',
    excerpt:
      'Colour is one of the most expressive tools in cake design — and one of the most misunderstood. A studio perspective on choosing colour with intention rather than defaulting to trends.',
    category: 'design',
    categoryLabel: 'Design',
    date: '2026-05-12',
    readTime: '5 min read',
    featured: false,
    tags: ['design', 'colour', 'studio', 'style'],
    paletteKey: 'painterly',
    body: [
      {
        type: 'p',
        text: 'Colour decisions in cake design are often made too quickly and too literally. The brief mentions purple flowers so the cake becomes purple. The venue has grey walls so the cake goes grey. These connections are understandable but they shortcut the more interesting question, which is: what should this colour do?',
      },
      {
        type: 'h2',
        text: 'Colour as mood, not match',
      },
      {
        type: 'p',
        text: 'A cake\'s colour does not need to match the floristry. It needs to feel right alongside it — to sit in the same emotional register, even if the specific hue is different. A dusty terracotta cake next to pale peach flowers works better than a cake dyed to match the flowers exactly, because complementary colours have more depth than identical ones.',
      },
      {
        type: 'pullquote',
        text: 'The best colour decisions are made by asking what feeling the colour creates, not which object it matches.',
      },
      {
        type: 'h2',
        text: 'The case for restraint',
      },
      {
        type: 'p',
        text: 'One strong colour, used across a simple form, will almost always be more effective than several colours competing for attention. The temptation is to add — another shade, another accent, another element. The discipline is to subtract. What is the single colour that could carry this entire cake?',
      },
      {
        type: 'h2',
        text: 'Tone matters as much as hue',
      },
      {
        type: 'p',
        text: 'The same hue at different tones creates completely different cakes. A saturated cobalt blue reads as bold and contemporary. The same blue at a muted, chalky tone reads as something entirely different — more considered, less assertive. When choosing a colour direction, look at tone as carefully as you look at hue.',
      },
      {
        type: 'h2',
        text: 'White is not neutral',
      },
      {
        type: 'p',
        text: 'A white or ivory cake is a colour choice, not the absence of one. It says something specific — clean, restrained, classic. It suits certain occasions and settings and is wrong for others. Choosing white because it feels safe is as intentional as choosing chartreuse.',
      },
      {
        type: 'tip',
        text: 'If you are drawn to a colour but unsure whether it will work for your occasion, bring a piece of fabric or a flower in that colour to the design conversation. Seeing it in the context of the day makes the decision much easier.',
      },
    ],
  },
]

export const getArticleBySlug = (slug) => journal.find((a) => a.slug === slug)

export const getArticlesByCategory = (cat) =>
  journal.filter((a) => a.category === cat)

export const getRelatedArticles = (article, count = 3) => {
  const scored = journal
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      const sharedTags = (a.tags || []).filter((t) => (article.tags || []).includes(t)).length
      const sameCategory = a.category === article.category ? 2 : 0
      return { article: a, score: sharedTags + sameCategory }
    })
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map((s) => s.article)
}

export const allTags = [...new Set(journal.flatMap((a) => a.tags || []))].sort()
