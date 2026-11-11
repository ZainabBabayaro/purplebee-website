import { useMemo, useState } from 'react'
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
import { Select } from '../components/form/Inputs.jsx'
import { useProduct, useCatalogue } from '../services/catalogue.js'
import {
  flavourOptions,
  fillingOptions,
  coveringOptions,
  servingGuides,
  productPriceFrom,
  productImages,
  productMainImage,
  purchaseTypeFor,
} from '../data/cakes.js'

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Full cake purchase section ────────────────────────────────────────────────
function FullCakePurchase({ cake, onCustomise }) {
  const variants = Array.isArray(cake.variants) ? cake.variants : []
  const isTiered = variants.length > 0
  const config = cake.config || {}
  const flavours = Array.isArray(config.flavours) && config.flavours.length ? config.flavours : flavourOptions
  const fillings = Array.isArray(config.fillings) && config.fillings.length ? config.fillings : fillingOptions
  const coverings = Array.isArray(config.coverings) && config.coverings.length ? config.coverings : coveringOptions

  return (
    <>
      {/* Sponge flavours */}
      <div className="mt-10 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Sponge flavours</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {flavours.map((f) => (
            <li key={f} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">{f}</li>
          ))}
        </ul>
      </div>

      {/* Fillings */}
      <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Fillings</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {fillings.map((f) => (
            <li key={f} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">{f}</li>
          ))}
        </ul>
      </div>

      {/* Coverings */}
      <div className="mt-4 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Coverings</h2>
        <ul className="mt-4 space-y-2">
          {coverings.map((c) => {
            const value = typeof c === 'string' ? c : c.value
            const label = typeof c === 'string' ? c : c.label
            return (
              <li key={value} className="text-sm text-stone">
                <span className="font-medium text-ink">{label.split('—')[0].trim()}</span>
                {label.includes('—') && <span className="text-stone"> — {label.split('—')[1].trim()}</span>}
              </li>
            )
          })}
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
        <Link to="/cake-enquiry" className="btn btn-outline">
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
          <span className="shrink-0 font-display text-2xl font-medium text-ink">
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

// ── Quotation-required section ────────────────────────────────────────────────
function QuotationPurchase({ cake }) {
  const config = cake.config || {}
  const flavourOpts = Array.isArray(config.flavours) && config.flavours.length
    ? config.flavours
    : flavourOptions.map((f) => ({ value: f, label: f }))

  const [flavour, setFlavour] = useState('')
  const enquiryLink = `/cake-enquiry?product=${encodeURIComponent(cake.slug)}${flavour ? `&flavour=${encodeURIComponent(flavour)}` : ''}`

  return (
    <>
      <div className="mt-10 rounded-2xl border border-line bg-cream/40 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Made to your brief</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone">
          This design is quoted individually. Choose a preferred flavour and tell us about your occasion
          and we will come back to you with a personal quote.
        </p>

        <div className="mt-5">
          <Select
            id="enquiry-flavour"
            label="Preferred flavour (optional)"
            placeholder="Open to suggestions"
            options={flavourOpts}
            value={flavour}
            onChange={(e) => setFlavour(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to={enquiryLink} className="btn btn-primary">
          Request a quote
          <ArrowRight size={16} strokeWidth={1.8} />
        </Link>
        <Link to="/collections" className="btn btn-outline">
          Browse collections
        </Link>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CakeDetail() {
  const { slug } = useParams()
  const { product: cake, loading } = useProduct(slug)
  const { products } = useCatalogue()
  const [customising, setCustomising] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const images = useMemo(() => (cake ? productImages(cake) : []), [cake])

  if (!cake && loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-ivory">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
      </div>
    )
  }

  if (!cake) {
    return (
      <div className="px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Product not found</h1>
        <Link to="/our-cakes" className="btn btn-outline mt-8">Back to the gallery</Link>
      </div>
    )
  }

  const purchaseType = purchaseTypeFor(cake)
  const hasVariants = Array.isArray(cake.variants) && cake.variants.length > 0
  const related = products
    .filter((c) => c.slug !== cake.slug && (
      c.collectionSlugs?.includes(cake.collectionSlugs?.[0]) ||
      c.collectionSlug === cake.collectionSlug
    ))
    .slice(0, 3)
  const relatedCakes = related.length ? related : products.filter((c) => c.slug !== cake.slug).slice(0, 3)

  const productPath = `/cakes/${cake.slug}`

  return (
    <>
      <SEO
        title={cake.name}
        description={cake.summary}
        canonicalPath={productPath}
        image={productMainImage(cake) || undefined}
        type="article"
        structured={[
          cakeProductLd(cake),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Our Cakes', path: '/our-cakes' },
            { name: cake.name, path: productPath },
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
              { name: cake.name, to: productPath },
            ]}
          />
        </div>
      </article>

      {/* Main */}
      <section className="bg-ivory pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">

            {/* Image gallery */}
            <Reveal>
              <div className="md:sticky md:top-28">
                <div className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-35px_rgba(55,42,74,0.4)]">
                  <OptimizedImage
                    src={images[activeImage] || productMainImage(cake)}
                    seed={`cake-${cake.slug}`}
                    paletteKey={cake.paletteKey}
                    alt={`${cake.name} — ${cake.summary}`}
                    aspect="4 / 5"
                  />
                </div>
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`View image ${i + 1} of ${cake.name}`}
                        aria-pressed={activeImage === i}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                          activeImage === i ? 'border-plum-500' : 'border-transparent hover:border-plum-300'
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Details */}
            <Reveal delay={120}>
              {/* Collection + product type tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow">{cake.collectionName}</span>
                <span className="text-stone-light">·</span>
                <ProductTypeTag productType={cake.productType} />
                {purchaseType === 'quotation' && (
                  <span className="inline-block rounded-full bg-honey-400/20 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-honey-600">
                    Quotation required
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
                {cake.name}
              </h1>

              {/* Price — always visible */}
              <p className="mt-4 font-display text-3xl font-medium text-ink">
                {purchaseType === 'quotation' ? (
                  <span className="text-2xl">Price on enquiry</span>
                ) : (
                  <>
                    {hasVariants && <span className="mr-2 align-middle text-sm font-normal uppercase tracking-wide text-stone">From</span>}
                    {money(productPriceFrom(cake))}
                  </>
                )}
              </p>

              <p className="mt-4 text-lg leading-relaxed text-stone">{cake.summary}</p>

              <div className="mt-6 space-y-4 text-pretty leading-relaxed text-stone">
                <p>{cake.description}</p>
              </div>

              {/* Purchase section — branches by purchase type */}
              {purchaseType === 'quotation' ? (
                <QuotationPurchase cake={cake} />
              ) : purchaseType === 'configurable' ? (
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
                  <div className="relative overflow-hidden rounded-xl bg-ivory">
                    <OptimizedImage
                      src={productMainImage(c)}
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
