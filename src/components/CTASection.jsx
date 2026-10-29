import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'

// A reusable closing CTA band used at the foot of pages.
export default function CTASection({
  eyebrow = 'Enquire',
  title = "Let's make something memorable.",
  body = 'Tell us about your celebration, the feel you are after and the cake you have in mind. We will take it from there.',
  primary = { label: 'Enquire about a cake', to: '/enquiry' },
  secondary,
}) {
  return (
    <section className="section-y bg-plum-900 text-ivory">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <p className="eyebrow text-plum-300">{eyebrow}</p>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-ivory md:text-6xl">
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-plum-200">
            {body}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={primary.to} className="btn bg-ivory text-plum-700 hover:bg-plum-50">
              {primary.label}
            </Link>
            {secondary && (
              <Link
                to={secondary.to}
                className="btn border border-plum-600 text-ivory hover:bg-plum-800"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
