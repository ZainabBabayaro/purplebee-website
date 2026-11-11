import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import { useCatalogue } from '../services/catalogue.js'
import { productMainImage } from '../data/cakes.js'

// Gallery filters — brief specifies: All Cakes, Birthday, Wedding,
// Anniversary, Milestone Celebrations, Custom Designs.
// Map these to actual product data by occasion + collection membership.
const hasCollection = (c, slug) =>
  (c.collectionSlugs || []).includes(slug) || c.collectionSlug === slug

const FILTERS = [
  { label: 'All Cakes',              match: () => true },
  { label: 'Birthday Cakes',         match: (c) => c.occasion === 'Birthday' },
  { label: 'Wedding Cakes',          match: (c) => c.occasion === 'Wedding' || hasCollection(c, 'wedding-cakes') },
  { label: 'Anniversary Cakes',      match: (c) => c.occasion === 'Anniversary' || c.occasion === 'Celebration' },
  { label: 'Milestone Celebrations', match: (c) => c.occasion === 'Celebration' || hasCollection(c, 'celebration-cakes') },
  { label: 'Custom Designs',         match: (c) => hasCollection(c, 'bespoke-cakes') || hasCollection(c, 'wedding-cakes') },
]

export default function OurCakes() {
  const [filterIndex, setFilterIndex] = useState(0)
  const { visibleProducts, loading } = useCatalogue()

  const filtered = useMemo(
    () => visibleProducts.filter((p) => p.active !== false).filter(FILTERS[filterIndex].match),
    [visibleProducts, filterIndex],
  )

  return (
    <>
      <SEO
        title="Custom Birthday & Celebration Cakes in Abuja | Purple Bee Cakes"
        description="Explore custom birthday cakes, wedding cakes, anniversary and celebration cake designs in Abuja. Find a design you love and commission a cake made entirely for your occasion."
        canonicalPath="/our-cakes"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Our Cakes', path: '/our-cakes' },
        ])]}
      />

      <PageHero
        eyebrow="The gallery"
        title="Our cakes."
        intro="Explore our collection of carefully designed cakes — from timeless and elegant creations to expressive, artistic designs. Each cake is an opportunity to bring your celebration to life through colour, texture, flavour and detail."
        trail={[{ name: 'Home', to: '/' }, { name: 'Our Cakes', to: '/our-cakes' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">

          {/* Filters */}
          <div
            className="flex flex-wrap items-center gap-2 border-b border-line pb-5"
            role="group"
            aria-label="Filter cakes by type"
          >
            {FILTERS.map((f, i) => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilterIndex(i)}
                aria-pressed={filterIndex === i}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filterIndex === i
                    ? 'bg-plum-600 text-ivory'
                    : 'border border-line bg-ivory text-ink hover:border-plum-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-stone">
            Showing {filtered.length} design{filtered.length !== 1 ? 's' : ''}
          </p>

          {loading && visibleProducts.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
            </div>
          ) : (
            /* Gallery grid */
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
              {filtered.map((cake, i) => {
                const offset = i % 3 === 1 ? 'md:mt-12' : ''
                return (
                  <Reveal key={cake.slug} delay={(i % 3) * 70} className={offset}>
                    <Link to={`/cakes/${cake.slug}`} className="group block">
                      <div className="overflow-hidden rounded-xl bg-cream">
                        <OptimizedImage
                          src={productMainImage(cake)}
                          seed={`cake-${cake.slug}`}
                          paletteKey={cake.paletteKey}
                          alt={`${cake.name} — ${cake.summary}`}
                          aspect="4 / 5"
                          width={400}
                          height={500}
                          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <h2 className="font-display text-lg font-medium text-ink transition-colors group-hover:text-plum-600 md:text-xl">
                          {cake.name}
                        </h2>
                        <span className="shrink-0 text-xs uppercase tracking-wide text-stone-light">
                          {cake.collectionName}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-snug text-stone">{cake.summary}</p>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}

          {/* Gallery closing section */}
          <Reveal className="mt-20 rounded-3xl bg-plum-900 px-8 py-12 text-center text-ivory md:py-16">
            <p className="eyebrow text-plum-300">Not found what you are looking for?</p>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ivory md:text-4xl">
              Every cake we make can be made for you.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-plum-200">
              If you have a specific vision in mind, we can design a cake entirely around your occasion, palette and preferences. Tell us what you are imagining and we will bring it to life.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/cake-enquiry" className="btn bg-ivory text-plum-700 hover:bg-plum-50">
                Start a cake enquiry
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <Link to="/shop" className="btn border border-plum-600 text-ivory hover:bg-plum-800">
                Shop our cakes
              </Link>
            </div>
          </Reveal>

        </div>
      </section>
    </>
  )
}
