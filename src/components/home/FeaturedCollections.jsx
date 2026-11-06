import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { collections } from '../../data/collections.js'
import CollectionCard from '../CollectionCard.jsx'
import Reveal from '../Reveal.jsx'

// Featured collections — curated design families in an editorial grid.
export default function FeaturedCollections() {
  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <p className="eyebrow">Curated directions</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              Collections, the way we think about cake
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-stone">
              Each collection is a design direction rather than a fixed menu — a
              way of grouping how we approach colour, texture and form. Browse for
              the mood, then we shape a cake around your occasion.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/collections"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium text-plum-600"
            >
              View all collections
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 90}>
              <CollectionCard collection={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
