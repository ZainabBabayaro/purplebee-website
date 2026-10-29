import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { enquiryInfo } from '../../data/site.js'
import Reveal from '../Reveal.jsx'

// Bespoke enquiry — the commissioning journey, in three calm steps.
export default function BespokeEnquiry() {
  return (
    <section className="section-y bg-plum-900 text-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow text-plum-300">Bespoke commissions</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ivory md:text-5xl">
              Your occasion, designed around you
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-plum-200">
              Commissioning a cake should feel personal and straightforward. Here
              is how it works from the first conversation to the finished cake.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {enquiryInfo.process.map((step, i) => (
            <Reveal key={step.step} delay={i * 120}>
              <div className="flex flex-col">
                <span className="font-display text-5xl font-light text-plum-400/70">
                  {step.step}
                </span>
                <h3 className="mt-4 font-display text-xl font-medium text-ivory">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-plum-200">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-14">
          <div className="flex flex-col items-start gap-5 border-t border-plum-800 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-plum-200">
              {enquiryInfo.leadTime}
            </p>
            <Link
              to="/enquiry"
              className="btn shrink-0 bg-ivory text-plum-700 hover:bg-plum-50"
            >
              Start an enquiry
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
