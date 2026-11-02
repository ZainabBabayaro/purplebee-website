import { Link, useParams } from 'react-router-dom'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'
import { getCollectionBySlug } from '../data/collections.js'
import { getCakesByCollection } from '../data/cakes.js'

export default function CollectionDetail() {
  const { slug } = useParams()
  const collection = getCollectionBySlug(slug)

  if (!collection) {
    return (
      <div className="px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Collection not found</h1>
        <Link to="/collections" className="btn btn-outline mt-8">Back to collections</Link>
      </div>
    )
  }

  const cakes = getCakesByCollection(slug)

  return (
    <>
      <SEO
        title={`${collection.name} Collection`}
        description={`${collection.name} — ${collection.subtitle}. ${collection.description}`}
        canonicalPath={`/collections/${slug}`}
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: collection.name, path: `/collections/${slug}` },
        ])]}
      />
      <PageHero
        eyebrow={collection.subtitle}
        title={collection.name}
        intro={collection.description}
        trail={[{ name: 'Home', to: '/' }, { name: 'Collections', to: '/collections' }, { name: collection.name, to: `/collections/${slug}` }]}
      />

      {/* Occasions */}
      <section className="bg-ivory pb-4">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap gap-3">
            {collection.occasions.map((o) => (
              <span key={o} className="rounded-full border border-line bg-cream/60 px-4 py-1.5 text-sm text-stone">
                {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-ivory pt-10">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Feature image */}
          <Reveal className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(55,42,74,0.3)]">
              <OptimizedImage
                seed={`collection-${slug}-feature`}
                paletteKey={collection.paletteKey}
                alt={`${collection.name} collection — feature illustration, development placeholder`}
                aspect="16 / 9"
              />
            </div>
          </Reveal>

          <h2 className="mt-16 font-display text-3xl font-medium text-ink md:text-4xl">
            Designs in this direction
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
            {cakes.map((cake, i) => {
              const offset = i % 3 === 1 ? 'md:mt-12' : ''
              return (
                <Reveal key={cake.slug} delay={(i % 3) * 80} className={offset}>
                  <Link to={`/cakes/${cake.slug}`} className="group block">
                    <div className="overflow-hidden rounded-xl bg-cream">
                      <OptimizedImage
                        src={cake.image}
                        seed={`cake-${cake.slug}`}
                        paletteKey={cake.paletteKey}
                        alt={`${cake.name} — ${cake.summary}`}
                        aspect="4 / 5"
                        className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg font-medium text-ink transition-colors group-hover:text-plum-600 md:text-xl">
                        {cake.name}
                      </h3>
                      <span className="shrink-0 text-xs uppercase tracking-wide text-stone-light">
                        {cake.occasion}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-stone">{cake.summary}</p>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Like this direction?"
        title="Enquire about a cake in this style"
        body="Tell us about your occasion and what drew you to this collection. We will design something around your day."
      />
    </>
  )
}
