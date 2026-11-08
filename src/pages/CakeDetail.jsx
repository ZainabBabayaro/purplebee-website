import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import SEO, { breadcrumbLd, cakeProductLd } from '../components/SEO.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'
import CakeCustomiser from '../components/CakeCustomiser.jsx'
import SimpleAddToCart from '../components/SimpleAddToCart.jsx'
import ProductTypeTag from '../components/ProductTypeTag.jsx'
import { getCakeBySlug, cakes, flavourOptions, fillingOptions, coveringOptions, servingGuides, productPriceFrom } from '../data/cakes.js'

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Full cake purchase section ────────────────────────────────────────────────
function FullCakePurchase({ cake, onCustomise }) {
  const variants = Array.isArray(cake.variants) ? cake.variants : []
  const isTiered = variants.length > 0

  return (
    <>
      {/* Sponge flavours */}
      <div className="mt-10 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Sponge flavours</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {flavourOptions.map((f) => (
            <li key={f} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">{f}</li>
          ))}
        </ul>
      </div>

      {/* Fillings */}
      <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Fillings</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {fillingOptions.map((f) => (
            <li key={f} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">{f}</li>
          ))}
        </ul>
      </div>

      {/* Coverings */}
      <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Coverings</h2>
        <ul className="mt-4 space-y-2">
          {coveringOptions.map((c) => (
            <li key={c.value} className="text-sm text-stone">
              <span className="font-medium text-ink">{c.label.split('—')[0].trim()}</span>
              {c.label.includes('—') && <span className="text-stone"> — {c.label.split('—')[1].trim()}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Sizes */}
      <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">
          {isTiered ? 'Tier combinations & servings' : 'Sizes & servings'}
        </h2>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {isTiered
              ? variants.map((v) => (
                  <tr key={v.id || v.label} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 font-medium text-ink">{v.label}</td>
                    <td className="py-2 text-right text-stone">{v.servings}</td>
                    <td className="py-2 pl-4 text-right font-medium text-ink">{money(v.price)}</td>
                  </tr>
                ))
              : servingGuides.map((s) => (
                  <tr key={s.size} className="border-b border-line last:border-0">
                    <td className="py-2 font-medium text-ink">{s.size}</td>
                    <td className="py-2 text-right text-stone">{s.servings}</td>
                    <td className="py-2 pl-4 text-right font-medium text-ink">{money(cake.price)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {isTiered && (
          <p className="mt-3 text-xs text-stone">
            Each tier is three layers deep. Choose your tier combination when you add the cake to your basket.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onCustomise} className="btn btn-primary">
          <ShoppingBag size={16} strokeWidth={1.8} />
          Customise &amp; add to basket
        </button>
        <Link to="/enquiry" className="btn btn-outline">
          Enquire about this cake
          <ArrowRight size={16} strokeWidth={1.8} />
        </Link>
      </div>
      <p className="mt-3 text-xs text-stone">
        Choose your sponge, filling, covering and size before adding to basket.
      </p>
    </>
  )
}

// ── Slice / Loaf purchase section ─────────────────────────────────────────────
function SimplePurchase({ cake }) {
  const isSlice = cake.productType === 'cake-slice'
  return (
    <>
      <div className="mt-10 rounded-2xl border border-line bg-cream/40 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-medium text-ink">
              {isSlice ? 'Individual slice' : 'Full loaf'}
            </h2>
            <p className="mt-1 text-sm text-stone">
              {isSlice
                ? 'Each slice is freshly made to order. Perfect for gifting or treating yourself.'
                : 'Made fresh to order. Keeps well for 3–4 days at room temperature.'}
            </p>
          </div>
          <span className="font-display text-2xl font-medium text-ink shrink-0">
            {money(cake.price)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <SimpleAddToCart product={cake} />
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CakeDetail() {
  const { slug } = useParams()
  const cake = getCakeBySlug(slug)
  const [customising, setCustomising] = useState(false)

  if (!cake) {
    return (
      <div className="px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Product not found</h1>
        <Link to="/our-cakes" className="btn btn-outline mt-8">Back to the gallery</Link>
      </div>
    )
  }

  const isFullCake = cake.productType === 'cake'
  const hasVariants = Array.isArray(cake.variants) && cake.variants.length > 0
  const related = cakes
    .filter((c) => c.collectionSlug === cake.collectionSlug && c.slug !== cake.slug)
    .slice(0, 3)
  const relatedCakes = related.length ? related : cakes.filter((c) => c.slug !== cake.slug).slice(0, 3)

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

            {/* Image */}
            <Reveal>
              <div className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-35px_rgba(55,42,74,0.4)] md:sticky md:top-28">
                <OptimizedImage
                  src={cake.image}
                  seed={`cake-${slug}`}
                  paletteKey={cake.paletteKey}
                  alt={`${cake.name} — ${cake.summary}`}
                  aspect="4 / 5"
                />
              </div>
            </Reveal>

            {/* Details */}
            <Reveal delay={120}>
              {/* Collection + product type tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">{cake.collectionName}</span>
                <span className="text-stone-light">·</span>
                <ProductTypeTag productType={cake.productType} />
              </div>

              <h1 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
                {cake.name}
              </h1>

              {/* Price — always visible */}
              <p className="mt-4 font-display text-3xl font-medium text-ink">
                {hasVariants && <span className="mr-2 align-middle text-sm font-normal uppercase tracking-wide text-stone">From</span>}
                {money(productPriceFrom(cake))}
              </p>

              <p className="mt-4 text-lg leading-relaxed text-stone">{cake.summary}</p>

              <div className="mt-6 space-y-4 text-pretty leading-relaxed text-stone">
                <p>{cake.description}</p>
              </div>

              {/* Purchase section — branches by product type */}
              {isFullCake ? (
                <FullCakePurchase cake={cake} onCustomise={() => setCustomising(true)} />
              ) : (
                <SimplePurchase cake={cake} />
              )}
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
              All cakes <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
            {relatedCakes.map((c, i) => (
              <Reveal key={c.slug} delay={i * 90}>
                <Link to={`/cakes/${c.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl bg-ivory relative">
                    <OptimizedImage
                      src={c.image}
                      seed={`cake-${c.slug}`}
                      paletteKey={c.paletteKey}
                      alt={`${c.name} — ${c.summary}`}
                      aspect="4 / 5"
                      className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-3 top-3">
                      <ProductTypeTag productType={c.productType} />
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium text-ink transition-colors group-hover:text-plum-600 md:text-xl">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-stone">{c.collectionName}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />

      {/* Full cake customiser modal */}
      {customising && (
        <CakeCustomiser
          cake={cake}
          onClose={() => setCustomising(false)}
        />
      )}
    </>
  )
}
