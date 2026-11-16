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
            <p className="eyebrow">Behind the studio</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              The person behind Purple Bee Cakes
            </h2>
            <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
              <p>
              Purple Bee Cakes is a business built on a love for cake making, creativity and the joy of creating something that becomes part of people's most meaningful moments.

Over the years, that love has grown into a commitment to creating cakes that bring together beautiful design and exceptional flavour.




              </p>
              <p>
For me, cake making is about more than following a recipe or recreating a photograph. It's about understanding what makes a cake enjoyable, what makes a design memorable and how the two can work together.

              </p>
              <p>
                I want Purple Bee Cakes to be known for cakes that people look forward to eating just as much as they look forward to showing them off.

              </p>
              <p>
               Every cake we create is an opportunity to deliver on that promise.
              </p>
            </div>

            

            <Link
              to="/our-story/"
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
