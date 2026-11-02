import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'

// Hero — full cake left, three detail shots mosaic right.
// All four images are real photography of the same cake.
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-28 md:pt-36">
      {/* Soft background washes */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-plum-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cream/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 md:grid-cols-12 md:gap-8 md:px-8 md:pb-28">

        {/* ── Text ── */}
        <div className="md:col-span-5 md:pr-6">
          <Reveal>
            <p className="eyebrow">Bespoke cake design studio</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl md:text-[4rem]">
              Considered cakes,
              <br />
              made to be{' '}
              <span className="italic text-plum-600">remembered.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-stone">
              A studio pairing thoughtful design with flavour made from scratch —
              for the celebrations that deserve something personal.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/our-cakes" className="btn btn-primary">
                Explore our cakes
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>
              <Link to="/our-story" className="btn btn-ghost">
                Our story
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-10 text-xs uppercase tracking-[0.2em] text-stone-light">
              Bespoke celebration &amp; wedding cakes
            </p>
          </Reveal>
        </div>

        {/* ── Image mosaic ── */}
        <Reveal delay={160} className="md:col-span-7">
          <div className="grid grid-cols-12 grid-rows-2 gap-3 md:gap-4">

            {/* Main full-cake image — spans 7 cols, both rows */}
            <div className="col-span-7 row-span-2 overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(55,42,74,0.35)]">
              <img
                src="/images/hero/img-6550-2.jpg"
                alt="Three-tier wedding cake with crimson lace texture, hand-crafted sugar flowers in sage and burgundy, and gold leaf detail"
                width={880}
                height={1120}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Detail 1 — lace embossing on top tier */}
            <div className="col-span-5 row-span-1 overflow-hidden rounded-xl shadow-md">
              <img
                src="/images/hero/img-6565.jpg"
                alt="Close-up of ivory lace embossing on the top tier with crimson sugar flowers"
                width={540}
                height={480}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Detail 2 — sugar flowers and lace collar */}
            <div className="col-span-5 row-span-1 overflow-hidden rounded-xl shadow-md">
              <img
                src="/images/hero/img-6564.jpg"
                alt="Hand-crafted sage and burgundy sugar flowers with delicate lace collar detail"
                width={540}
                height={480}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  )
}
