# Purple Bee Cakes — Website Handover

A bespoke, multi-page React + Tailwind website for Purple Bee Cakes, a cake
design studio. Built with Vite, React Router and static site generation (SSG)
for SEO, with art-directed placeholder visuals that can be swapped for real
photography without layout changes.

---

## 1. How to run

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build + prerender all routes to dist/
npm run preview    # serve the built site (see note on clean URLs below)
```

- **Build** = `vite build` (client bundle) then `node prerender.js` (emits a
  static HTML file per route with full metadata + structured data, plus
  `sitemap.xml`).
- **Clean URLs (no trailing slash):** standard static hosts (Netlify, Vercel,
  Cloudflare Pages) resolve `/cakes/iris` to `/cakes/iris/index.html`
  automatically. `vite preview` serves the prerendered file with a trailing
  slash; for an exact local mirror use `npx serve dist` or deploy to a static
  host. Unknown routes fall back to client-side routing, so no route is ever
  broken.

---

## 2. Pages completed

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Hero, featured collections, signature gallery, brand philosophy, bespoke enquiry, testimonials, founder, final CTA |
| `/our-cakes` | Our Cakes gallery | Filterable by occasion |
| `/collections` | Collections list | Curated design families |
| `/collections/:slug` | Collection detail | Intro + all cakes in the collection |
| `/cakes/:slug` | Cake detail | Design story, flavours, servings, enquiry CTA, related cakes |
| `/our-story` | About | Philosophy, values, founder placeholder |
| `/journal` | Journal list | Featured + grid of articles |
| `/journal/:slug` | Article | Full article + related |
| `/contact` | Contact | Details + contact form |
| `/enquiry` | Enquiry | Full bespoke enquiry form + process + FAQ |
| `/privacy` | Privacy policy | Starter template |
| `*` / `/404` | 404 | Custom not-found page (`dist/404.html`) |

All 27 routes are prerendered to static HTML.

---

## 3. Components implemented

- `Header` (sticky, transparent-over-hero, scrolled state) + `MobileMenu`
  (overlay, focus trap, Esc, scroll lock, route-close).
- `Footer` (brand, nav, collections, contact, social, legal, honest dev notice).
- `Layout` (skip link, header, outlet, footer).
- `SEO` (Helmet-based title/description/canonical/OG/Twitter/JSON-LD) + structured
  data builders (Organization, Bakery, BreadcrumbList, Product, Article).
- `OptimizedImage` — renders a real `src` when provided, else art-directed
  `PlaceholderArt`; supports aspect ratio (CLS control), lazy/eager loading, alt text.
- `PlaceholderArt` — deterministic SVG cake compositions (offline, performant).
- `Reveal` — IntersectionObserver entrance animation, reduced-motion aware,
  progressive enhancement (content visible without JS).
- `PageHero`, `Breadcrumbs`, `CTASection`, `CollectionCard`, `CakeCard`.
- `form/Inputs` — accessible `Input`, `Textarea`, `Select` (label association,
  `aria-invalid`, `aria-describedby`, error/hint).
- Home sections: `Hero`, `FeaturedCollections`, `SignatureGallery`,
  `BrandPhilosophy`, `BespokeEnquiry`, `Testimonials`, `FounderStory`.

---

## 4. Features that are functional

- Multi-page client-side routing with React Router; every page reachable via
  nav and internal links.
- Responsive layouts throughout; mobile menu fully functional.
- Enquiry form: all requested fields, client-side validation, accessible errors,
  focus management on invalid submit, and a confirmation state. **Honest by
  design:** it clearly states the enquiry has *not* been sent until a submission
  service is connected (see §6).
- Contact form with validation and the same honest confirmation.
- Occasion filter on the gallery; related-cake and related-article sections.
- Collection → cakes and cake → enquiry navigation flows.

---

## 5. SEO measures implemented

- **Rendering strategy:** SSG via `prerender.js` (Vite SSR + `react-dom/server`
  `StaticRouter`). Search engines receive fully rendered, metadata-rich HTML
  without executing JS. Client then hydrates for interactivity.
- Unique `<title>` + meta description per page (verified — no duplicates;
  the template default title/description are stripped at prerender time).
- One `<h1>` per page (verified across all 27 pages).
- Logical H2/H3 hierarchy; descriptive, readable URLs (slugs).
- Canonical URLs, Open Graph and Twitter card metadata per page.
- `sitemap.xml` (25 URLs, excludes noindex pages) and `robots.txt`.
- Structured data: Organization + Bakery (home), BreadcrumbList (inner pages),
  Product (cake pages — no price/ratings/offers), Article (journal). Matches
  visible content; nothing fabricated.
- Custom 404 page (`noindex`).
- Semantic HTML landmarks, descriptive alt text, breadcrumbs.

**Not claimed:** search rankings, indexation status, or Core Web Vitals /
Lighthouse scores. These require live testing after deployment.

---

## 6. Integrations requiring credentials / configuration

- **Form submission (enquiry + contact):** not yet connected. `FORM_ENDPOINT`
  constants at the top of `src/pages/Enquiry.jsx` and `src/pages/Contact.jsx` are
  empty. Set one (e.g. Formspree, Web3Forms, or your own endpoint) to enable real
  submissions — the code already POSTs `FormData` when an endpoint is set. Until
  then, the forms validate and show an honest "not sent" confirmation.
- **Email/phone/address/service area/social handles/domain:** all placeholders
  in `src/data/site.js`. Confirm and replace before launch. The placeholder
  domain `https://www.purplebeecakes.co.uk` is used for canonical URLs, OG tags
  and the sitemap — update `site.url` (and `public/robots.txt`) to the live
  domain.
- **OG image:** `public/og-image.svg` is a branded SVG placeholder. Replace with
  a 1200×630 PNG/JPG before launch (some social platforms don't render SVG).
- **Analytics / conversion tracking:** not included. If added, implement with
  consent and document cookies in the privacy policy.

---

## 7. Content placeholders to replace before launch

Everything is data-driven, so updates live in `src/data/`:

- **Collections** (`collections.js`): names/descriptions are sample design
  directions (`development: true`). Confirm final collections.
- **Cakes** (`cakes.js`): designs, names, stories are sample studies
  (`development: true`). **Flavours and serving guidance are placeholders.**
  Replace with real designs + photography (point `OptimizedImage` `src` at real
  photos; layout needs no changes).
- **Photography:** all cake images are `PlaceholderArt` SVGs, clearly labelled
  "development placeholder". They are **not** real Purple Bee Cakes products.
- **Testimonials** (`testimonials.js`): clearly flagged sample placeholders with
  a visible banner. No star ratings or review counts are shown. Replace with
  genuine, consented customer feedback and remove the banner.
- **Founder story:** home + About pages hold clearly-marked founder placeholders
  (name, photograph, story). Do not publish until confirmed.
- **Journal** (`journal.js`): editorial drafts (`draft: true`) — review before
  publishing.
- **Pricing:** intentionally not published (bespoke, per enquiry). The Product
  schema omits offers/prices.

---

## 8. Performance & accessibility checks performed

**Performance (implemented, scores untested):**
- Inline SVG placeholder art (tiny, no requests) + aspect-ratio wrappers to
  prevent CLS.
- `OptimizedImage` lazy-loads below-the-fold real images; hero is `eager`/`fetchpriority=high`.
- Font preconnect + `display=swap`; minimal JS; no heavy runtime libraries.
- Single ~84 KB gzipped JS bundle, ~8 KB gzipped CSS.

**Accessibility (implemented; full validation needs manual AT testing):**
- Skip-to-content link, semantic landmarks, logical heading order.
- Accessible mobile menu (focus trap, Esc, scroll lock, `aria-expanded`).
- Form labels, `aria-invalid`, `aria-describedby`, inline errors, focus on
  invalid field.
- Visible focus indicators; sufficient colour-contrast palette.
- Reduced-motion support (animations/parallax disabled).
- Breadcrumbs with `aria-current`; decorative art has `role="img"` + labels.

---

## 9. Project structure

```
src/
  components/      Header, MobileMenu, Footer, Layout, SEO, Reveal,
                  OptimizedImage, PlaceholderArt, PageHero, Breadcrumbs,
                  CTASection, CakeCard, CollectionCard, ScrollToTop
  components/home/ Hero, FeaturedCollections, SignatureGallery,
                  BrandPhilosophy, BespokeEnquiry, Testimonials, FounderStory
  components/form/ Inputs (Input/Textarea/Select)
  pages/           Home, OurCakes, Collections, CollectionDetail, CakeDetail,
                  OurStory, Journal, JournalArticle, Contact, Enquiry,
                  Privacy, NotFound
  data/            site, navigation, collections, cakes, testimonials, journal
  utils/           images (palettes + seeded RNG for placeholder art)
  App.jsx, main.jsx, entry-server.jsx, index.css
prerender.js       SSG build step (also emits sitemap.xml)
public/            favicon.svg, og-image.svg, robots.txt
```

---

## 10. Remaining blockers before launch

1. Set `site.url` (and `public/robots.txt` sitemap URL) to the live domain.
2. Confirm + replace all placeholder business details in `src/data/site.js`.
3. Connect `FORM_ENDPOINT` in `Enquiry.jsx` and `Contact.jsx`.
4. Replace placeholder collections/cakes/testimonials/founder/journal with real
   content and real photography.
5. Replace `og-image.svg` with a 1200×630 PNG/JPG.
6. Finalise the privacy policy with real practices.
7. Test on a deployed static host and run Lighthouse / a screen reader pass.
