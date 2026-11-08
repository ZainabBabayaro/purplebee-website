import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'

const steps = [
  {
    number: '01',
    title: 'Start your enquiry',
    body: 'Tell us about your occasion, your vision and the details that matter most. The more context you share, the better we can design something truly fitting.',
  },
  {
    number: '02',
    title: 'Design consultation',
    body: 'We discuss your brief in detail — design direction, flavours, size, colour palette and any specific elements you have in mind. Reference images are always welcome.',
  },
  {
    number: '03',
    title: 'Proposal and confirmation',
    body: 'We share a design proposal with pricing. Once you are happy and payment has been confirmed, your cake is officially in production.',
  },
  {
    number: '04',
    title: 'Creation',
    body: 'Your cake is made from scratch, decorated by hand and finished to the standard you expect from Purple Bee Cakes.',
  },
  {
    number: '05',
    title: 'Collection or delivery',
    body: 'Your cake is ready for your agreed collection or delivery arrangement — perfectly timed for your celebration.',
  },
]

const reasons = [
  {
    title: 'It is made entirely for you.',
    body: 'A bespoke cake is designed around your specific occasion, aesthetic preferences and the people involved. Nothing is chosen from a catalogue.',
  },
  {
    title: 'Design and flavour work together.',
    body: 'We develop the flavour profile and the visual design side by side, so the cake is coherent from the outside in.',
  },
  {
    title: 'Every detail is considered.',
    body: 'From the tier proportions and colour choices to the finishing techniques and presentation, every element is intentional.',
  },
  {
    title: 'The experience is personal.',
    body: 'You work directly with us from the first conversation to the finished cake. We keep the process clear, calm and straightforward.',
  },
]

export default function CustomCakes() {
  return (
    <>
      <SEO
        title="Custom Bespoke Cakes in Abuja | Purple Bee Cakes"
        description="Commission a bespoke cake designed entirely around your occasion. Purple Bee Cakes creates custom celebration, wedding and corporate cakes in Abuja — thoughtfully designed, made to order."
        canonicalPath="/custom-cakes"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Custom Cakes', path: '/custom-cakes' },
        ])]}
      />

      <PageHero
        eyebrow="Bespoke commissions"
        title="A cake made entirely for you."
        intro="Every bespoke cake we make begins with a conversation. Tell us about your occasion, share your vision and we will design something that belongs completely to your day."
        trail={[{ name: 'Home', to: '/' }, { name: 'Custom Cakes', to: '/custom-cakes' }]}
      />

      {/* Why bespoke */}
      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
            <Reveal>
              <div className="overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(55,42,74,0.3)]">
                <OptimizedImage
                  seed="custom-cakes-purplebee"
                  paletteKey="garden"
                  alt="A beautifully designed bespoke celebration cake by Purple Bee Cakes"
                  aspect="4 / 5"
                />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="eyebrow">Why commission a bespoke cake?</p>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                The difference between ordering a cake and commissioning one.
              </h2>
              <div className="mt-8 space-y-6">
                {reasons.map((r) => (
                  <div key={r.title} className="border-l-2 border-plum-200 pl-5">
                    <h3 className="font-display text-lg font-medium text-ink">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone">{r.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Design, flavour, size and detail */}
      <section className="section-y bg-cream/50">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What goes into a bespoke cake</p>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              Every decision is made with your occasion in mind.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Design',
                body: 'We approach decoration as a craft — shape, colour, texture and proportion are considered together to create something visually cohesive and intentional.',
              },
              {
                title: 'Flavour',
                body: 'Sponge, filling and covering are chosen to complement each other. We select combinations that reward every bite, not just the first.',
              },
              {
                title: 'Size',
                body: 'We recommend the right size for your guest count and presentation context — ensuring the cake looks proportional and feeds everyone comfortably.',
              },
              {
                title: 'Detail',
                body: 'From sugar flowers to hand-painted finishes, gold leaf to intricate textures — decorative details are added thoughtfully, not excessively.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="rounded-2xl border border-line bg-ivory p-7">
                  <div className="mb-4 h-0.5 w-8 bg-honey-500" />
                  <h3 className="font-display text-xl font-medium text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5-step process */}
      <section className="section-y bg-plum-900 text-ivory">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-plum-300">How it works</p>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ivory md:text-4xl">
              A clear process from first idea to finished cake.
            </h2>
          </Reveal>
          <div className="mt-14 space-y-0 divide-y divide-plum-800">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 80}>
                <div className="flex gap-8 py-7 md:gap-12">
                  <span className="shrink-0 font-display text-3xl font-light text-plum-600 md:text-4xl">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-medium text-ivory">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-plum-200">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-14 border-t border-plum-800 pt-12">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-medium text-ivory">
                  Ready to begin?
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-plum-200">
                  Start your enquiry and we will be in touch within 48 hours to discuss your occasion.
                </p>
              </div>
              <Link to="/cake-enquiry" className="btn shrink-0 bg-ivory text-plum-700 hover:bg-plum-50">
                Start your enquiry
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
