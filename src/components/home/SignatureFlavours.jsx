import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'
import OptimizedImage from '../OptimizedImage.jsx'

const flavours = [
  {
    slug: 'snickers',
    name: 'Snickers',
    tagline: 'Chocolate. Caramel. Peanut. Pure indulgence.',
    description:
      'Rich chocolate sponge layered with dark chocolate ganache, homemade salted peanut caramel and peanut buttercream. A deeply indulgent combination for those who love the balance of chocolate, roasted peanuts and buttery caramel.',
    image: '/images/cakes/chocolate.webp',
    paletteKey: 'sculptural',
    accentColor: '#5a3220',
    label: 'Chocolate sponge with dark ganache, salted peanut caramel and peanut buttercream layers',
  },
  {
    slug: 'lemon-blueberry',
    name: 'Lemon Blueberry',
    tagline: 'Bright citrus. Juicy berries. Beautifully balanced.',
    description:
      'Delicate lemon sponge soaked in lemon syrup, layered with blueberry filling, cream cheese ganache and toffee lemon filling. A vibrant combination of sweet, tangy and creamy flavours.',
    image: '/images/cakes/blue_lemon.webp',
    paletteKey: 'painterly',
    accentColor: '#3d5a8a',
    label: 'Lemon sponge with blueberry filling, cream cheese ganache and lemon curd layers',
  },
  {
    slug: 'vanilla',
    name: 'Vanilla',
    tagline: 'A classic, made anything but ordinary.',
    description:
      'Fragrant vanilla bean sponge paired with toffee caramel filling and whipped cream cheesecake. Familiar, comforting and indulgently layered.',
    image: '/images/cakes/exotic_vanilla.webp',
    paletteKey: 'quiet',
    accentColor: '#8a6a3a',
    label: 'Vanilla bean sponge with toffee caramel filling and whipped cream cheesecake layers',
  },
]

function FlavorCard({ flavour, index }) {
  return (
    <Reveal delay={index * 100}>
      <article className="group flex flex-col rounded-3xl overflow-hidden border border-line bg-ivory transition-shadow duration-500 hover:shadow-[0_24px_60px_-20px_rgba(55,42,74,0.18)]">

        {/* Image */}
        <div className="relative overflow-hidden bg-cream" style={{ aspectRatio: '4 / 3' }}>
          <OptimizedImage
            src={flavour.image}
            seed={`flavour-${flavour.slug}`}
            paletteKey={flavour.paletteKey}
            alt={flavour.label}
            aspect="4 / 3"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          {/* Gradient overlay for name readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-7">
          {/* Accent line */}
          <div className="mb-5 h-0.5 w-10 rounded-full bg-honey-500" />

          <h3 className="font-display text-2xl font-medium text-ink">
            {flavour.name}
          </h3>
          <p className="mt-2 text-sm font-medium italic text-plum-600">
            {flavour.tagline}
          </p>
          <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-stone">
            {flavour.description}
          </p>

          <Link
            to="/store"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-plum-600 transition-gap hover:gap-3"
            aria-label={`Order the ${flavour.name} cake`}
          >
            Order this cake
            <ArrowRight size={15} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </article>
    </Reveal>
  )
}

export default function SignatureFlavours() {
  return (
    <section className="section-y bg-cream/50">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Header */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The Signature Flavour Collection</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl lg:text-[3.2rem]">
            Not just another slice of cake.
          </h2>
          <div className="mx-auto mt-1 h-px w-16 bg-honey-500/60" />
          <p className="mt-7 text-pretty leading-relaxed text-stone">
            A beautiful cake should never disappoint once you cut into it.
          </p>
          <p className="mt-3 text-pretty leading-relaxed text-stone">
            Our signature flavours are developed around the things that make a cake genuinely enjoyable: moist sponge, complementary fillings, satisfying textures and flavours that work beautifully together.
          </p>
        </Reveal>

        {/* Flavour cards */}
        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {flavours.map((f, i) => (
            <FlavorCard key={f.slug} flavour={f} index={i} />
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={120} className="mt-14 text-center">
          <Link to="/store" className="btn btn-primary">
            Explore Our Signature Flavours
            <ArrowRight size={17} strokeWidth={1.8} />
          </Link>
        </Reveal>

      </div>
    </section>
  )
}
