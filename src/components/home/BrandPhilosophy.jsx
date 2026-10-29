import OptimizedImage from '../OptimizedImage.jsx'
import Reveal from '../Reveal.jsx'

// Brand philosophy — the thinking behind the studio.
export default function BrandPhilosophy() {
  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal className="order-2 md:order-1">
            <p className="eyebrow">The thinking</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              Flavour, design and colour, considered together
            </h2>
            <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
              <p>
                A cake is asked to do two things at once — to look the part and to
                taste of something real. We never treat those as separate jobs.
                The flavour is designed into the structure, and the design is built
                around how the cake will be eaten.
              </p>
              <p>
                Colour is a studio signature, used the way a painter uses it — with
                intention, restraint and a little courage. The result should feel
                personal, never patterned from a template.
              </p>
            </div>

            <blockquote className="mt-9 border-l-2 border-plum-300 pl-5">
              <p className="font-display text-2xl font-medium leading-snug text-ink">
                “The best cakes feel like they belong to one day, to one table,
                to the people gathered there.”
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={120} className="order-1 md:order-2">
            <div className="relative mx-auto max-w-md md:max-w-none">
              <div className="absolute -left-5 -top-6 hidden h-full w-full rounded-2xl bg-plum-100/70 md:block" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(55,42,74,0.3)]">
                <OptimizedImage
                  seed="philosophy-purplebee"
                  paletteKey="quiet"
                  alt="A textured cake illustration — development placeholder"
                  aspect="5 / 6"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
