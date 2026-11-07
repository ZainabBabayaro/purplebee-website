import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import { collections } from '../data/collections.js'

export default function Collections() {
  return (
    <>
      <SEO
        title="Collections"
        description="Browse all Purple Bee Cakes collections — bespoke cakes, signature designs, celebration cakes, wedding cakes, cake slices and loaf cakes."
        canonicalPath="/collections"
        structured={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }])]}
      />
      <PageHero
        eyebrow="What we make"
        title="Our collections"
        intro="Browse by collection or explore everything we offer. Click any collection to see all the designs inside and add them to your basket."
        trail={[{ name: 'Home', to: '/' }, { name: 'Collections', to: '/collections' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
            {collections.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 2) * 100}>
                <Link to={`/collections/${c.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl">
                    <OptimizedImage
                      seed={`collection-${c.slug}`}
                      paletteKey={c.paletteKey}
                      alt={`${c.name} collection — ${c.subtitle}, design direction illustration`}
                      aspect="16 / 11"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/90 text-plum-700 opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <ArrowUpRight size={20} strokeWidth={1.6} />
                    </span>
                  </div>
                  <div className="mt-6 max-w-lg">
                    <h2 className="font-display text-2xl font-medium text-ink transition-colors group-hover:text-plum-600 md:text-3xl">
                      {c.name}
                    </h2>
                    <p className="mt-1 text-sm uppercase tracking-wide text-plum-600">{c.subtitle}</p>
                    <p className="mt-4 text-pretty leading-relaxed text-stone">{c.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
