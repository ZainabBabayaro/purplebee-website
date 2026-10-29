import SEO, { breadcrumbLd, organizationLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'

const values = [
  {
    title: 'Thoughtful design',
    body: 'Every cake starts with the occasion, not a catalogue. Design grows out of the brief — colour, scale and detail chosen to suit the day.',
  },
  {
    title: 'Flavour made from scratch',
    body: 'A cake should taste of something real. Sponges, fillings and finishes are made in the studio, not assembled from a box.',
  },
  {
    title: 'Meticulous detail',
    body: 'The small things are the whole thing. Clean edges, considered proportions and finishes that hold up close as well as from across the room.',
  },
  {
    title: 'A personal approach',
    body: 'Commissioning a cake is a conversation. We design with you, not at you, so the finished cake feels like yours.',
  },
]

export default function OurStory() {
  return (
    <>
      <SEO
        title="Our Story"
        description="The story, values and approach behind Purple Bee Cakes — a bespoke cake design studio focused on thoughtful design, flavour made from scratch and meticulous detail."
        canonicalPath="/our-story"
        structured={[
          organizationLd(),
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Our Story', path: '/our-story' }]),
        ]}
      />
      <PageHero
        eyebrow="The studio"
        title="Our story"
        intro="Purple Bee Cakes is a bespoke cake design studio. This is the thinking, the values and the approach that sit behind every cake — the personal story that will fill this page is being finalised with the founder."
        trail={[{ name: 'Home', to: '/' }, { name: 'Our Story', to: '/our-story' }]}
      />

      {/* Philosophy image + text */}
      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <div className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(55,42,74,0.3)]">
                <OptimizedImage
                  seed="story-purplebee"
                  paletteKey="painterly"
                  alt="Studio illustration — development placeholder"
                  aspect="4 / 5"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="eyebrow">How we work</p>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                Cakes designed once, for one occasion
              </h2>
              <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
                <p>
                  The studio exists to make cakes that feel personal rather than
                  produced. That means starting with questions, working out the
                  design around the answers, and finishing each cake by hand.
                </p>
                <p>
                  It also means keeping the work small enough to care. Bespoke
                  cakes are made to order, one at a time, so every detail gets the
                  attention it needs.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-y bg-cream/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">What we care about</p>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              The values behind the work
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className="h-full border-t-2 border-plum-300 pt-5">
                  <h3 className="font-display text-xl font-medium text-ink">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder — placeholder */}
      <section className="section-y bg-ivory">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
            <Reveal className="md:col-span-5">
              <div className="relative mx-auto max-w-sm md:max-w-none">
                <div className="absolute -right-4 -bottom-5 hidden h-full w-full rounded-2xl border border-plum-200/70 md:block" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-2xl">
                  <OptimizedImage
                    seed="founder-story"
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
              <p className="eyebrow">The person</p>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                Meet the maker
              </h2>
              <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
                <p>
                  This is where the founder's introduction will appear — their name,
                  how the studio began, and what drew them to cake design. A short,
                  honest story in their own words, with an authentic photograph.
                </p>
                <p>
                  Sharing the person behind the work helps customers feel confident
                  in who is making their cake. This section is being written with
                  the founder ahead of launch.
                </p>
              </div>
              <p className="mt-6 rounded-xl border border-dashed border-stone-light bg-cream/50 px-5 py-4 text-xs text-stone">
                Development placeholder — the founder's real name, photograph and
                  story will replace this content once confirmed.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Let's talk"
        title="Tell us about your celebration"
        secondary={{ label: 'See the cakes', to: '/our-cakes' }}
      />
    </>
  )
}
