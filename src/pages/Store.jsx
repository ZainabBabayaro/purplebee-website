import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import CakeCustomiser from '../components/CakeCustomiser.jsx'
import SimpleAddToCart from '../components/SimpleAddToCart.jsx'
import ProductTypeTag from '../components/ProductTypeTag.jsx'
import { useCatalogue } from '../services/catalogue.js'
import { productPriceFrom, productMainImage, purchaseTypeFor } from '../data/cakes.js'

const OCCASIONS = ['All', 'Birthday', 'Wedding', 'Celebration']
const TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'cake', label: 'Cakes' },
  { value: 'cake-slice', label: 'Slices' },
  { value: 'cake-loaf', label: 'Loaves' },
]
const SORT_OPTS = [
  { value: 'az',         label: 'Name A–Z' },
  { value: 'price-asc',  label: 'Price: low–high' },
  { value: 'price-desc', label: 'Price: high–low' },
]

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// memo: only re-renders when the product object changes.
const StoreCard = memo(function StoreCard({ product, index, onCustomise }) {
  const outOfStock = (product.stock ?? 0) <= 0 || product.active === false || product.available === false
  const purchaseType = purchaseTypeFor(product)
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const displayPrice = productPriceFrom(product)
  const image = productMainImage(product)

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-ivory overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/cakes/${product.slug}`} className="relative block overflow-hidden bg-cream aspect-[4/4]">
        <OptimizedImage
          src={image}
          alt={product.name}
          width={400}
          height={400}
          aspect="4 / 4"
          priority={index < 2}
          paletteKey={product.paletteKey}
          seed={`cake-${product.slug}`}
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {/* Product type tag */}
        <div className="absolute left-3 top-3">
          <ProductTypeTag productType={product.productType || 'cake'} />
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ivory/70 backdrop-blur-sm">
            <span className="rounded-full bg-stone/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-stone">Sold out</span>
          </div>
        )}
        {!outOfStock && product.stock > 0 && product.stock <= 3 && (
          <span className="absolute right-3 top-3 rounded-full bg-honey-500 px-2.5 py-1 text-[0.65rem] font-semibold text-ivory">
            Only {product.stock} left
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-plum-600">{product.collectionName}</span>
        <Link to={`/cakes/${product.slug}`}>
          <h2 className="mt-1 font-display text-xl font-medium text-ink transition-colors hover:text-plum-600">{product.name}</h2>
        </Link>
        <p className="mt-1.5 flex-1 text-sm leading-snug text-stone">{product.summary}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-2xl font-medium text-ink">
            {purchaseType === 'quotation' ? (
              <span className="text-base">Price on enquiry</span>
            ) : (
              <>
                {hasVariants && <span className="mr-1 text-xs font-normal uppercase tracking-wide text-stone">From</span>}
                {money(displayPrice)}
              </>
            )}
          </span>
          {purchaseType === 'quotation' ? (
            <Link
              to={`/cake-enquiry?product=${encodeURIComponent(product.slug)}`}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-plum-600 px-3 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-plum-700"
            >
              Enquire
            </Link>
          ) : purchaseType === 'configurable' ? (
            <button
              type="button"
              onClick={() => !outOfStock && onCustomise(product)}
              disabled={outOfStock}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                outOfStock ? 'cursor-not-allowed bg-stone/10 text-stone-light' : 'bg-plum-600 text-ivory hover:bg-plum-700'
              }`}
              aria-label={`Customise and add ${product.name} to basket`}
            >
              <ShoppingBag size={16} strokeWidth={1.7} />
              {outOfStock ? 'Sold out' : 'Add to basket'}
            </button>
          ) : (
            <SimpleAddToCart product={product} compact />
          )}
        </div>
      </div>
    </div>
  )
})

export default function Store() {
  const { visibleProducts, loading } = useCatalogue()
  const [occasion, setOccasion] = useState('All')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('az')
  const [customising, setCustomising] = useState(null) // product being customised

  const filtered = useMemo(() => {
    let list = visibleProducts.filter((p) => p.active !== false && p.available !== false)
    if (occasion !== 'All') list = list.filter((p) => p.occasion === occasion)
    if (type !== 'all') list = list.filter((p) => (p.productType || 'cake') === type)
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return productPriceFrom(a) - productPriceFrom(b)
      if (sort === 'price-desc') return productPriceFrom(b) - productPriceFrom(a)
      return (a.name || '').localeCompare(b.name || '')
    })
  }, [visibleProducts, occasion, type, sort])

  return (
    <>
      <SEO
        title="Store"
        description="Order bespoke cakes from Purple Bee Cakes — browse designs, choose your size and flavour, and place your order online."
        canonicalPath="/store"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Store', path: '/store' },
        ])]}
      />

      <PageHero
        eyebrow="Order online"
        title="The store"
        intro="Browse and order from our current range of bespoke celebration cakes. Each is made to order once we confirm your event date, flavour and any design adjustments."
        trail={[{ name: 'Home', to: '/' }, { name: 'Store', to: '/store' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by occasion">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOccasion(o)}
                  aria-pressed={occasion === o}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    occasion === o
                      ? 'bg-plum-600 text-ivory'
                      : 'border border-line text-ink hover:border-plum-300'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <label htmlFor="type-select" className="sr-only">Filter by product type</label>
              <select
                id="type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-ink focus:border-plum-400 focus:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <label htmlFor="sort-select" className="sr-only">Sort by</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-ink focus:border-plum-400 focus:outline-none"
              >
                {SORT_OPTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <p className="w-full text-xs text-stone">
              Showing {filtered.length} design{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid */}
          {loading && visibleProducts.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-stone">
              No designs match this filter.{' '}
              <button
                type="button"
                onClick={() => { setOccasion('All'); setType('all') }}
                className="text-plum-600 underline"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <StoreCard key={p.id} product={p} index={i} onCustomise={setCustomising} />
              ))}
            </div>
          )}

          <p className="mt-12 rounded-xl border border-dashed border-stone-light bg-cream/40 px-5 py-4 text-xs text-stone">
            Prices shown are indicative. Final pricing confirmed on enquiry.
          </p>
        </div>
      </section>

      {/* Customiser modal */}
      {customising && (
        <CakeCustomiser
          cake={customising}
          onClose={() => setCustomising(null)}
        />
      )}
    </>
  )
}
