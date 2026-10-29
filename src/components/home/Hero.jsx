import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import HeroBackground from './HeroBackground.jsx'
import Reveal from '../Reveal.jsx'

// Hero — full-bleed, full-width sliding background with the headline overlaid.
// The background is a wider-than-viewport panoramic scene that pans slowly
// (see .hero-bg-track in index.css); a dark scrim keeps the copy legible.
export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-plum-900 pt-28 pb-20 md:pt-32">
      {/* Sliding full-width background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-bg-track absolute inset-y-0 left-0 h-full w-[140%]">
          <HeroBackground />
        </div>
      </div>

      {/* Legibility scrims */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow text-plum-200">Bespoke cake design studio</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2.7rem] font-medium leading-[1.05] tracking-[-0.02em] text-ivory sm:text-6xl md:text-[4.3rem]">
              Considered cakes,
              <br />
              made to be{' '}
              <span className="italic text-honey-400">remembered.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-plum-100">
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
              <Link
                to="/our-story"
                className="btn border border-ivory/40 text-ivory hover:bg-ivory/10"
              >
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Subtle scroll cue */}
      <div
        className="absolute inset-x-0 bottom-6 flex justify-center text-ivory/70"
        aria-hidden="true"
      >
        <span className="h-10 w-px bg-ivory/40" />
      </div>
    </section>
  )
}
