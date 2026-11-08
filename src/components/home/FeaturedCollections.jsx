import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { collections } from '../../data/collections.js'
import CollectionCard from '../CollectionCard.jsx'
import Reveal from '../Reveal.jsx'

export default function FeaturedCollections() {
  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <p className="eyebrow">What we make</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              Our collections
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-stone">
              From bespoke commissions to signature designs, wedding centrepieces
              to everyday indulgences — browse by collection or explore everything we offer.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/our-cakes"
              className="btn btn-primary shrink-0"
            >
              Explore cakes
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </Reveal>
        </div>

        {/* All 6 collections — 2 rows of 3 on desktop, 2 cols on tablet, 1 on mobile */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 70}>
              <CollectionCard collection={c} index={i} />
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
