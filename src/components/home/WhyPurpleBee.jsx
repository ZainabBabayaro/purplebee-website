import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'

const propositions = [
  {
    number: '01',
    title: 'Flavour is never an afterthought.',
    body: 'We develop our recipes around the complete eating experience. The sponge, fillings and finishes are selected to complement one another, giving every slice its own character.',
  },
  {
    number: '02',
    title: 'Beautiful by design.',
    body: 'We approach cake decoration as an art. From colour choices to textures, proportions and finishing details, every element contributes to the final result.',
  },
  {
    number: '03',
    title: 'Made with quality in mind.',
    body: 'We pay attention to ingredient selection and preparation because the quality of a cake begins long before the decoration.',
  },
  {
    number: '04',
    title: 'Your occasion matters.',
    body: 'A cake for an intimate birthday should feel different from one created for a grand celebration. We consider the occasion, your preferences and the experience you want to create.',
  },
]

export default function WhyPurpleBee() {
  return (
    <section className="section-y bg-plum-900 text-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Header */}
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-plum-300">The Purple Bee Difference</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ivory md:text-5xl lg:text-[3.2rem]">
            The difference is in what goes into every cake.
          </h2>
          <div className="mt-6 h-px w-16 bg-honey-500/60" />
          <p className="mt-7 max-w-xl text-pretty leading-relaxed text-plum-200">
            You can find cake almost anywhere. Finding one that delivers on flavour, presentation and the complete experience is what matters.
          </p>
        </Reveal>

        {/* Propositions grid */}
        <div className="mt-16 grid gap-px border border-plum-800 bg-plum-800 md:grid-cols-2 rounded-2xl overflow-hidden">
          {propositions.map((p, i) => (
            <Reveal key={p.number} delay={i * 80}>
              <div className="flex flex-col gap-4 bg-plum-900 p-8 md:p-10 h-full transition-colors hover:bg-plum-800/60">
                {/* Number */}
                <span className="font-display text-5xl font-light leading-none text-plum-700/80 select-none">
                  {p.number}
                </span>
                {/* Divider */}
                <div className="h-px w-10 bg-honey-500/50" />
                {/* Title */}
                <h3 className="font-display text-xl font-medium leading-snug text-ivory md:text-2xl">
                  {p.title}
                </h3>
                {/* Body */}
                <p className="text-pretty text-sm leading-relaxed text-plum-200 md:text-base">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom tagline + CTA */}
        <Reveal delay={160} className="mt-16 flex flex-col items-start gap-6 border-t border-plum-800 pt-12 md:flex-row md:items-center md:justify-between">
          <blockquote className="max-w-lg font-display text-xl font-medium italic leading-snug text-plum-200 md:text-2xl">
            "Beautifully designed to be admired, thoughtfully crafted to be savoured."
          </blockquote>
          <Link
            to="/store"
            className="btn shrink-0 bg-ivory text-plum-700 hover:bg-plum-50"
          >
            Shop our cakes
            <ArrowRight size={16} strokeWidth={1.8} />
          </Link>
        </Reveal>

      </div>
    </section>
  )
}
