import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import CakeCustomiser from '../components/CakeCustomiser.jsx'

// ── Flavour data — exact copy from the approved brief ────────────────────────
const flavours = [
  {
    id: 'snickers',
    slug: 'snickers',
    name: 'Snickers',
    tagline: 'Chocolate. Caramel. Peanut. Pure indulgence.',
    description:
      'Rich chocolate sponge layered with dark chocolate ganache, homemade salted peanut caramel and peanut buttercream. A deeply indulgent combination for those who love the balance of chocolate, roasted peanuts and buttery caramel.',
    paletteKey: 'sculptural',
    image: '',
    price: 50000,
    stock: 20,
    active: true,
    summary: 'Rich chocolate sponge with dark ganache, salted peanut caramel and peanut buttercream.',
    collectionName: 'Signature Flavours',
  },
  {
    id: 'lemon-blueberry',
    slug: 'lemon-blueberry',
    name: 'Lemon Blueberry',
    tagline: 'Bright citrus. Juicy berries. Beautifully balanced.',
    description:
      'Delicate lemon sponge soaked in lemon syrup, layered with blueberry filling, cream cheese ganache and toffee lemon filling. A vibrant combination of sweet, tangy and creamy flavours.',
    paletteKey: 'painterly',
    image: '',
    price: 50000,
    stock: 20,
    active: true,
    summary: 'Lemon sponge with blueberry filling, cream cheese ganache and toffee lemon filling.',
    collectionName: 'Signature Flavours',
  },
  {
    id: 'vanilla',
    slug: 'vanilla',
    name: 'Vanilla',
    tagline: 'A classic, made anything but ordinary.',
    description:
      'Fragrant vanilla bean sponge paired with toffee caramel filling and whipped cream cheesecake. Familiar, comforting and indulgently layered.',
    paletteKey: 'quiet',
    image: '',
    price: 50000,
    stock: 20,
    active: true,
    summary: 'Vanilla bean sponge with toffee caramel filling and whipped cream cheesecake.',
    collectionName: 'Signature Flavours',
  },
]

function FlavorCard({ flavour, onOrder }) {
  return (
    <Reveal>
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ivory transition-shadow duration-500 hover:shadow-[0_20px_50px_-20px_rgba(55,42,74,0.2)]">
        {/* Image placeholder — replace with real photography */}
        <div className="relative overflow-hidden bg-cream" style={{ aspectRatio: '4 / 3' }}>
          <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-plum-900/60 via-transparent to-transparent p-6">
            <p className="font-display text-3xl font-medium text-ivory">{flavour.name}</p>
          </div>
          {/* Illustrative placeholder */}
          <div className={`h-full w-full bg-gradient-to-br ${
            flavour.id === 'snickers' ? 'from-stone to-plum-900/80' :
            flavour.id === 'lemon-blueberry' ? 'from-plum-200 to-painterly/30' :
            'from-cream to-honey-400/40'
          }`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-7">
          <div className="mb-5 h-0.5 w-10 rounded-full bg-honey-500" />
          <p className="text-sm font-medium italic text-plum-600">{flavour.tagline}</p>
          <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-stone">
            {flavour.description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onOrder(flavour)}
              className="btn btn-primary flex-1"
            >
              <ShoppingBag size={16} strokeWidth={1.8} />
              Order this flavour
            </button>
            <Link
              to="/cake-enquiry"
              className="btn btn-outline flex-1 text-center"
            >
              Custom order
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export default function SignatureFlavours() {
  const [customising, setCustomising] = useState(null)

  return (
    <>
      <SEO
        title="Signature Cake Flavours in Abuja | Purple Bee Cakes"
        description="Discover our signature cake flavours — Snickers, Lemon Blueberry and Vanilla. Beautifully crafted cakes that taste as exceptional as they look. Order online or enquire today."
        canonicalPath="/signature-flavours"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Signature Flavours', path: '/signature-flavours' },
        ])]}
      />

      <PageHero
        eyebrow="The Signature Flavour Collection"
        title="Not just another slice of cake."
        trail={[{ name: 'Home', to: '/' }, { name: 'Signature Flavours', to: '/signature-flavours' }]}
      >
        <div className="mt-6 max-w-2xl space-y-4 text-pretty leading-relaxed text-stone">
          <p>A beautiful cake should never disappoint once you cut into it.</p>
          <p>Our signature flavours are developed around the things that make a cake genuinely enjoyable: moist sponge, complementary fillings, satisfying textures and flavours that work beautifully together.</p>
        </div>
      </PageHero>

      {/* Flavour cards */}
      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {flavours.map((f, i) => (
              <FlavorCard key={f.id} flavour={f} index={i} onOrder={setCustomising} />
            ))}
          </div>

          {/* Available options note */}
          <Reveal className="mt-14 rounded-2xl bg-cream/60 border border-line p-8">
            <h2 className="font-display text-2xl font-medium text-ink">Available options</h2>
            <p className="mt-3 text-stone">
              All three signature flavours are available as full celebration cakes, individual slices and loaf cakes.
              Choose your preferred size — from 6 inch to 12 inch — and your covering: fondant, ganache or whipped cream.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['6 inch', '8 inch', '10 inch', '12 inch'].map((s) => (
                <span key={s} className="rounded-full border border-line bg-ivory px-4 py-1.5 text-sm text-stone">{s}</span>
              ))}
            </div>
          </Reveal>

          {/* Final CTA */}
          <Reveal className="mt-10 text-center">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
              Ready to order?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-stone">
              Click "Order this flavour" on any card above to choose your size, covering and place your order.
              For something bespoke, start a custom enquiry.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/shop" className="btn btn-primary">
                Shop all cakes
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <Link to="/cake-enquiry" className="btn btn-outline">
                Custom enquiry
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {customising && (
        <CakeCustomiser cake={customising} onClose={() => setCustomising(null)} />
      )}
    </>
  )
}
