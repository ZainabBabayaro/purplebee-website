import Reveal from './Reveal.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'

// Inner-page hero with consistent top padding to clear the fixed header.
export default function PageHero({ eyebrow, title, intro, trail = [], children }) {
  return (
    <section className="relative overflow-hidden bg-ivory pt-32 pb-12 md:pt-40 md:pb-16">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plum-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {trail.length > 0 && (
          <Breadcrumbs trail={trail} className="mb-8" />
        )}
        <Reveal className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-5 font-display text-[2.4rem] font-medium leading-[1.08] tracking-[-0.01em] text-ink sm:text-5xl md:text-[3.4rem]">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-stone">
              {intro}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
