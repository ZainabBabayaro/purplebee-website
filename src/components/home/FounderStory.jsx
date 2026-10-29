import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import OptimizedImage from '../OptimizedImage.jsx'
import Reveal from '../Reveal.jsx'

// Founder story — kept as a clearly-marked placeholder. The real founder's
// name, photograph and story will replace this content before launch; nothing
// here is presented as verified fact.
export default function FounderStory() {
  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <Reveal className="md:col-span-5">
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <div className="absolute -right-4 -bottom-5 hidden h-full w-full rounded-2xl border border-plum-200/70 md:block" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl">
                <OptimizedImage
                  seed="founder-purplebee"
                  paletteKey="garden"
                  alt="Founder portrait placeholder — to be replaced with authentic photography"
                  aspect="4 / 5"
                />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-stone shadow-sm">
                Portrait to be added
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} className="md:col-span-7">
            <p className="eyebrow">Behind the studio</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              The person behind Purple Bee Cakes
            </h2>
            <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
              <p>
                Every studio has a point of view, and Purple Bee Cakes is no
                different. This is where the founder's story will live — how the
                studio began, what drives the work, and the philosophy that runs
                through every cake.
              </p>
              <p>
                A short introduction, an authentic photograph and a few words on
                approach will sit here, so customers can connect with the person
                making their cake.
              </p>
            </div>

            <p className="mt-6 rounded-xl border border-dashed border-stone-light bg-cream/50 px-5 py-4 text-xs text-stone">
              Development placeholder — this section awaits the founder's real
              name, photograph and story, to be confirmed before launch.
            </p>

            <Link
              to="/our-story"
              className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-medium text-plum-600"
            >
              Read the full story
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
