import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'

// Hero — full cake left, three detail shots mosaic right.
// All four images are real photography of the same cake.
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory pt-28 md:pt-36">
      {/* Soft background washes */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-plum-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cream/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 md:grid-cols-12 md:gap-8 md:px-8 md:pb-28">

        {/* ── Text ── */}
        <div className="order-2 md:order-1 md:col-span-5 md:pr-6">
          <Reveal>
            <p className="eyebrow">Purplebee Cakes · Abuja, Nigeria</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl md:text-[4rem]">
              A cake that looks
              <br />
              as extraordinary as it{' '}
              <span className="italic text-plum-600">tastes.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-stone">
            Beautifully designed cakes.     </p>
            
            <p  className="py-2 max-w-md text-pretty text-lg leading-relaxed text-stone">
                          Indulgent, carefully developed flavours. Every detail considered, from the first look to the last bite.

            </p>

<p className=' max-w-md text-pretty text-lg leading-relaxed text-stone'>
  Whether you're celebrating someone special or treating yourself to something exceptional, discover cakes made to make the moment even sweeter.

  </p>
        
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/enquiry" className="btn btn-primary">
              Order a Cake
                
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>
              <Link to="/our-cakes" className="btn btn-ghost">
               Explore our cakes
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-10 text-xs uppercase tracking-[0.2em] text-stone-light">
              Bespoke celebration &amp; wedding cakes
            </p>
          </Reveal>
        </div>

        {/* ── Image mosaic ── */}
        <Reveal delay={160} className="order-1 md:order-2 md:col-span-7">
          <div className="grid grid-cols-12 grid-rows-2 gap-3 md:gap-4">

            {/* Main full-cake image — spans 7 cols, both rows */}
            <div className="col-span-7 row-span-2 overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(55,42,74,0.35)]">
              <picture>
                <source srcSet="/images/hero/img-6550-2.webp" type="image/webp" />
                <img
                  src="/images/hero/img-6550-2.jpg"
                  alt="Three-tier wedding cake with crimson lace texture, hand-crafted sugar flowers in sage and burgundy, and gold leaf detail"
                  width={880}
                  height={1120}
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>
            </div>

            {/* Detail 1 — lace embossing on top tier */}
            <div className="col-span-5 row-span-1 overflow-hidden rounded-xl shadow-md">
              <picture>
                <source srcSet="/images/hero/img-6565.webp" type="image/webp" />
                <img
                  src="/images/hero/img-6565.jpg"
                  alt="Close-up of ivory lace embossing on the top tier with crimson sugar flowers"
                  width={540}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                />
              </picture>
            </div>

            {/* Detail 2 — sugar flowers and lace collar */}
            <div className="col-span-5 row-span-1 overflow-hidden rounded-xl shadow-md">
              <picture>
                <source srcSet="/images/hero/img-6564.webp" type="image/webp" />
                <img
                  src="/images/hero/img-6564.jpg"
                  alt="Hand-crafted sage and burgundy sugar flowers with delicate lace collar detail"
                  width={540}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              </picture>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  )
}
