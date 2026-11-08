import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import Reveal from '../components/Reveal.jsx'
import CTASection from '../components/CTASection.jsx'
import CakeCustomiser from '../components/CakeCustomiser.jsx'
import SimpleAddToCart from '../components/SimpleAddToCart.jsx'
import ProductTypeTag from '../components/ProductTypeTag.jsx'
import { getCollectionBySlug } from '../data/collections.js'
import { getCakesByCollection } from '../data/cakes.js'

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Product card — branches add-to-cart action by productType.
function ProductCard({ cake, onCustomise }) {
  const outOfStock = (cake.stock ?? 1) <= 0
  const isFullCake = cake.productType === 'cake'

  return (
    <Reveal>
      <div className="group flex flex-col rounded-2xl border border-line bg-ivory overflow-hidden transition-shadow hover:shadow-lg">

        {/* Image — links to product page */}
        <Link to={`/cakes/${cake.slug}`} className="relative block overflow-hidden bg-cream">
          <OptimizedImage
            src={cake.image}
            seed={`cake-${cake.slug}`}
            paletteKey={cake.paletteKey}
            alt={`${cake.name} — ${cake.summary}`}
            aspect="4 / 4"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Product type tag on image */}
          <div className="absolute left-3 top-3">
            <ProductTypeTag productType={cake.productType} />
          </div>
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ivory/70 backdrop-blur-sm">
              <span className="rounded-full bg-stone/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-stone">Sold out</span>
            </div>
          )}
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col p-5">
          <Link to={`/cakes/${cake.slug}`}>
            <h3 className="font-display text-xl font-medium text-ink transition-colors hover:text-plum-600">
              {cake.name}
            </h3>
          </Link>
          <p className="mt-1.5 flex-1 text-sm leading-snug text-stone">{cake.summary}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-display text-xl font-medium text-ink">
              {money(cake.price)}
            </span>

            {/* Branch: full cake opens customiser; slices/loaves add directly */}
            {isFullCake ? (
              <button
                type="button"
                onClick={() => !outOfStock && onCustomise(cake)}
                disabled={outOfStock}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  outOfStock ? 'cursor-not-allowed bg-stone/10 text-stone-light' : 'bg-plum-600 text-ivory hover:bg-plum-700'
                }`}
                aria-label={`Customise ${cake.name}`}
              >
                Customise
              </button>
            ) : (
              <SimpleAddToCart product={cake} compact />
            )}
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default function CollectionDetail() {
  const { slug } = useParams()
  const collection = getCollectionBySlug(slug)
  const [customising, setCustomising] = useState(null)

  if (!collection) {
    return (
      <div className="px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Collection not found</h1>
        <Link to="/store" className="btn btn-outline mt-8">Browse all cakes</Link>
      </div>
    )
  }

  const products = getCakesByCollection(slug)

  return (
    <>
      <SEO
        title={`${collection.name} | Purple Bee Cakes`}
        description={`${collection.name} — ${collection.subtitle}. ${collection.description}`}
        canonicalPath={`/collections/${slug}`}
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: collection.name, path: `/collections/${slug}` },
        ])]}
      />

      <PageHero
        eyebrow={collection.subtitle}
        title={collection.name}
        intro={collection.description}
        trail={[
          { name: 'Home', to: '/' },
          { name: 'Collections', to: '/collections' },
          { name: collection.name, to: `/collections/${slug}` },
        ]}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {collection.occasions.map((o) => (
            <span key={o} className="rounded-full border border-line bg-cream/60 px-4 py-1.5 text-sm text-stone">{o}</span>
          ))}
        </div>
      </PageHero>

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-stone">No products in this collection yet.</p>
              <Link to="/store" className="btn btn-outline mt-6">Browse all cakes</Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-stone">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
                <Link to="/store" className="inline-flex items-center gap-1.5 text-sm font-medium text-plum-600 hover:text-plum-700">
                  Explore all <ArrowRight size={15} strokeWidth={1.8} />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.slug}
                    cake={product}
                    onCustomise={setCustomising}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTASection
        eyebrow="Something more personal?"
        title="Let's design your cake"
        body="Tell us about your occasion and what draws you to this collection. We will create something made just for your day."
        secondary={{ label: 'Explore all cakes', to: '/store' }}
      />

      {customising && (
        <CakeCustomiser cake={customising} onClose={() => setCustomising(null)} />
      )}
    </>
  )
}
