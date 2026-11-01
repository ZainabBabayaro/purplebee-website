import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd, cakeProductLd } from '../components/SEO.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'
import { getCakeBySlug, cakes, flavourOptions, servingGuides } from '../data/cakes.js'

export default function CakeDetail() {
  const { slug } = useParams()
  const cake = getCakeBySlug(slug)

  if (!cake) {
    return (
      <div className="px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Cake not found</h1>
        <Link to="/our-cakes" className="btn btn-outline mt-8">Back to the gallery</Link>
      </div>
    )
  }

  const related = cakes.filter((c) => c.collectionSlug === cake.collectionSlug && c.slug !== cake.slug).slice(0, 3)
  const fallbackRelated = cakes.filter((c) => c.slug !== cake.slug).slice(0, 3)
  const relatedCakes = related.length ? related : fallbackRelated

  return (
    <>
      <SEO
        title={cake.name}
        description={cake.summary}
        canonicalPath={`/cakes/${slug}`}
        type="article"
        structured={[
          cakeProductLd(cake),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Our Cakes', path: '/our-cakes' },
            { name: cake.name, path: `/cakes/${slug}` },
          ]),
        ]}
      />

      <article className="bg-ivory pt-28 pb-8 md:pt-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Breadcrumbs
            className="mb-8"
            trail={[
              { name: 'Home', to: '/' },
              { name: 'Our Cakes', to: '/our-cakes' },
              { name: cake.name, to: `/cakes/${slug}` },
            ]}
          />
        </div>
      </article>

      {/* Main */}
      <section className="bg-ivory pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <Reveal>
              <div className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-35px_rgba(55,42,74,0.4)] md:sticky md:top-28">
                <OptimizedImage
                  src={cake.image}
                  seed={`cake-${slug}`}
                  paletteKey={cake.paletteKey}
                  alt={`${cake.name} cake — ${cake.summary}`}
                  aspect="4 / 5"
                />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <p className="eyebrow">{cake.collectionName} · {cake.occasion}</p>
              <h1 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
                {cake.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-stone">{cake.summary}</p>

              <div className="mt-8 space-y-5 text-pretty leading-relaxed text-stone">
                <p>{cake.description}</p>
              </div>

              {/* Flavours — placeholder */}
              <div className="mt-10 rounded-2xl border border-line bg-cream/40 p-6">
                <h2 className="font-display text-lg font-medium text-ink">Suggested flavours</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {flavourOptions.map((f) => (
                    <li key={f} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Servings — placeholder */}
              <div className="mt-5 rounded-2xl border border-line bg-cream/40 p-6">
                <h2 className="font-display text-lg font-medium text-ink">Serving guidance</h2>
                <table className="mt-4 w-full text-sm">
                  <tbody>
                    {servingGuides.map((s) => (
                      <tr key={s.size} className="border-b border-line last:border-0">
                        <td className="py-2 font-medium text-ink">{s.size}</td>
                        <td className="py-2 text-right text-stone">{s.servings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-5 text-xs text-stone">
                Flavours and serving sizes are development placeholders, to be
                confirmed before launch. Pricing is provided per enquiry.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/enquiry" className="btn btn-primary">
                  Enquire about this cake
                  <ArrowRight size={16} strokeWidth={1.8} />
                </Link>
                <Link to={`/collections/${cake.collectionSlug}`} className="btn btn-outline">
                  View the {cake.collectionName} collection
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="section-y bg-cream/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">More to explore</h2>
            <Link to="/our-cakes" className="link-underline inline-flex items-center gap-2 text-sm font-medium text-plum-600">
              All cakes
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
            {relatedCakes.map((c, i) => (
              <Reveal key={c.slug} delay={i * 90}>
                <Link to={`/cakes/${c.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl bg-ivory">
                    <OptimizedImage
                      src={c.image}
                      seed={`cake-${c.slug}`}
                      paletteKey={c.paletteKey}
                      alt={`${c.name} — ${c.summary}`}
                      aspect="4 / 5"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium text-ink transition-colors group-hover:text-plum-600 md:text-xl">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-stone">{c.occasion}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
