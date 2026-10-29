import { Quote } from 'lucide-react'
import { testimonials, testimonialsArePlaceholders } from '../../data/testimonials.js'
import Reveal from '../Reveal.jsx'

// Testimonials — refined, and honestly flagged as development samples until
// genuine, consented customer feedback replaces them.
export default function Testimonials() {
  return (
    <section className="section-y bg-cream/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Kind words</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
            From the people we have baked for
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 110}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-ivory p-7">
                <Quote size={26} strokeWidth={1.4} className="text-plum-300" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-pretty font-display text-lg leading-snug text-ink">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="text-sm font-medium text-ink">{t.author}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-stone-light">
                    {t.context}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {testimonialsArePlaceholders && (
          <p className="mt-10 rounded-xl border border-dashed border-stone-light bg-ivory px-5 py-4 text-center text-xs text-stone">
            Development content — these are sample testimonials shown as layout
            placeholders. They will be replaced with genuine, consented customer
            reviews before launch. No star ratings or review counts are shown.
          </p>
        )}
      </div>
    </section>
  )
}
