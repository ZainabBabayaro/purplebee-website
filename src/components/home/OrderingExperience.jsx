import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'

const steps = [
  {
    number: '01',
    title: 'Explore',
    body: 'Browse our cake designs, collections and signature flavours to discover what you love.',
  },
  {
    number: '02',
    title: 'Tell us what you need',
    body: 'Choose your preferred cake or share your occasion, guest count, preferred flavour and design inspiration.',
  },
  {
    number: '03',
    title: 'Confirm your order',
    body: 'We\'ll discuss availability, pricing and the details of your cake. Your order is confirmed once the agreed payment and booking requirements are completed.',
  },
  {
    number: '04',
    title: 'Enjoy the moment',
    body: 'Your cake is prepared for your agreed collection or delivery arrangement, ready to become part of your celebration.',
  },
]

export default function OrderingExperience() {
  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Header */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">The Experience</p>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl lg:text-[3.2rem]">
            From your first idea to the first slice.
          </h2>
          <div className="mx-auto mt-1 h-px w-16 bg-honey-500/60" />
          <p className="mt-7 text-pretty leading-relaxed text-stone">
            Ordering a beautiful cake should feel exciting, not complicated.
          </p>
        </Reveal>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="mt-16 grid gap-0 md:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100} className="relative">
              {/* Connector line — desktop only, between steps */}
              {i < steps.length - 1 && (
                <div
                  className="absolute right-0 top-[2.6rem] hidden h-px w-1/2 bg-gradient-to-r from-plum-200 to-transparent md:block"
                  aria-hidden="true"
                />
              )}
              {i > 0 && (
                <div
                  className="absolute left-0 top-[2.6rem] hidden h-px w-1/2 bg-gradient-to-r from-transparent to-plum-200 md:block"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex flex-col px-6 pb-10 md:pb-0 md:px-5 lg:px-8">
                {/* Number with dot */}
                <div className="flex items-center gap-3">
                  <div className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border-2 border-plum-200 bg-ivory">
                    <span className="font-display text-xl font-medium text-plum-600">
                      {step.number}
                    </span>
                  </div>
                  {/* Mobile connector */}
                  {i < steps.length - 1 && (
                    <div className="h-px flex-1 bg-plum-100 md:hidden" aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="mt-6">
                  <h3 className="font-display text-xl font-medium text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    {step.body}
                  </p>
                </div>

                {/* Mobile vertical connector */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute bottom-0 left-[2.625rem] top-[3.25rem] w-px bg-plum-100 md:hidden"
                    aria-hidden="true"
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={200} className="mt-14 flex flex-col items-center gap-4 border-t border-line pt-12 text-center">
          <p className="max-w-md text-pretty text-stone">
            Ready to begin? Browse our collections, choose your cake and place your order.
          </p>
          <Link to="/our-cakes" className="btn btn-primary">
            Start Your Order
            <ArrowRight size={17} strokeWidth={1.8} />
          </Link>
        </Reveal>

      </div>
    </section>
  )
}
