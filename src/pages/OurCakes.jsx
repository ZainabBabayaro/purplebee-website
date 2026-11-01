import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import { cakes } from '../data/cakes.js'

const occasions = ['All', 'Wedding', 'Birthday', 'Celebration']

export default function OurCakes() {
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(
    () => (filter === 'All' ? cakes : cakes.filter((c) => c.occasion === filter)),
    [filter, cakes],
  )

  return (
    <>
      <SEO
        title="Our Cakes"
        description="Browse the Purple Bee Cakes gallery of bespoke celebration, birthday and wedding cake designs — each made to order for one occasion."
        canonicalPath="/our-cakes"
        structured={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Our Cakes', path: '/our-cakes' }])]}
      />
      <PageHero
        eyebrow="The gallery"
        title="Our cakes"
        intro="A growing collection of designs made for real celebrations. Filter by occasion, then open any cake to read the thinking behind it and enquire."
        trail={[{ name: 'Home', to: '/' }, { name: 'Our Cakes', to: '/our-cakes' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filter cakes by occasion">
            {occasions.map((o) => {
              const active = filter === o
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setFilter(o)}
                  aria-pressed={active}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-plum-600 text-ivory'
                      : 'border border-line bg-ivory text-ink hover:border-plum-300'
                  }`}
                >
                  {o}
                </button>
              )
            })}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
            {filtered.map((cake, i) => {
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
                      <h2 className="font-display text-lg font-medium text-ink transition-colors group-hover:text-plum-600 md:text-xl">
                        {cake.name}
                      </h2>
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

          <p className="mt-14 rounded-xl border border-dashed border-stone-light bg-cream/40 px-5 py-4 text-xs text-stone">
            Development content — cake designs, names and details shown here are
            sample studies and will be replaced with the studio's real work and
            photography before launch.
          </p>
        </div>
      </section>
    </>
  )
}
