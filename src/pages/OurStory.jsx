import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'

const values = [
  {
    title: 'Flavour comes first.',
    body: 'A beautiful exterior means little if the cake inside doesn\'t deliver. We invest care in developing flavours, fillings and textures that make every slice satisfying.',
  },
  {
    title: 'Design should mean something.',
    body: 'We don\'t believe decoration should be added simply for the sake of it. Every colour, texture and finishing detail should contribute to the overall design.',
  },
  {
    title: 'Quality is in the details.',
    body: 'From ingredient selection to preparation and presentation, we believe the little things shape the final experience.',
  },
  {
    title: 'Every occasion deserves consideration.',
    body: 'Whether it\'s an intimate birthday or a significant celebration, your cake should feel appropriate for the moment.',
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
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Our Story', path: '/our-story' }]),
        ]}
      />
      <PageHero
        eyebrow="The studio"
        title="Our story"
        intro="Purple Bee Cakes was built around a simple belief: cake should be an experience, not just another item on the celebration table.
We believe in beautiful presentation, exceptional flavour and the little details that transform something familiar into something special."
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
               Where artistry meets indulgence
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
                  src="/images/team/copy_founder.JPEG"
                  alt="The founder of Purple Bee Cakes"
                  width={593}
                  height={800}
                  aspect="593 / 800"
                  className="rounded-2xl"
                />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="md:col-span-7">
              <p className="eyebrow">The person</p>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
             The face behind the cakes.
              </h2>
              <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
                <p>
                 Purple Bee Cakes is a business built on a love for cake making, creativity and the joy of creating something that becomes part of people's most meaningful moments.
                </p>
                <p>Over the years, that love has grown into a commitment to creating cakes that bring together beautiful design and exceptional flavour.</p>
                <p>For me, cake making is about more than following a recipe or recreating a photograph. It's about understanding what makes a cake enjoyable, what makes a design memorable and how the two can work together.</p>
                <p>I want Purple Bee Cakes to be known for cakes that people look forward to eating just as much as they look forward to showing them off.</p>
                <p>Every cake we create is an opportunity to deliver on that promise.</p>
            
              </div>
            
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
