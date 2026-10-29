import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cakes } from '../../data/cakes.js'
import OptimizedImage from '../OptimizedImage.jsx'
import Reveal from '../Reveal.jsx'

// Signature gallery — an editorial, staggered grid of selected cake designs.
export default function SignatureGallery() {
  // A curated selection for the homepage; the full set lives on Our Cakes.
  const selected = cakes.slice(0, 6)

  return (
    <section className="section-y bg-cream/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
            A closer look at the cakes
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-stone">
            A few designs from across the collections. Each is made once, for one
            occasion — shown here to give a sense of how we work.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
          {selected.map((cake, i) => {
            // staggered editorial rhythm: offset the middle column down
            const offset = i % 3 === 1 ? 'md:mt-16' : ''
            return (
              <Reveal key={cake.slug} delay={(i % 3) * 90} className={offset}>
                <Link to={`/cakes/${cake.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl bg-ivory">
                    <OptimizedImage
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

        <Reveal className="mt-14 flex justify-center">
          <Link to="/our-cakes" className="btn btn-outline">
            View the full gallery
            <ArrowRight size={16} strokeWidth={1.8} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
