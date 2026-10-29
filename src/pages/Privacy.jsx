import SEO from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import { site } from '../data/site.js'

// A starter privacy policy template. It must be reviewed and finalised before
// launch to reflect the business's real data practices and legal obligations.
export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy policy for the Purple Bee Cakes website."
        canonicalPath="/privacy"
        noindex
      />
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="A starting-point privacy policy. Please review and finalise before launch."
        trail={[{ name: 'Home', to: '/' }, { name: 'Privacy Policy', to: '/privacy' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="space-y-8 leading-relaxed text-stone">
            <div>
              <h2 className="font-display text-2xl font-medium text-ink">Overview</h2>
              <p className="mt-3">
                This page explains how {site.name} handles information you share
                through this website, including the enquiry and contact forms. It
                is a template to be completed with the studio's real practices.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-medium text-ink">What we collect</h2>
              <p className="mt-3">
                When you enquire, we collect the details you provide — your name,
                contact information and the specifics of your enquiry. We also
                receive any reference images you choose to attach.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-medium text-ink">How we use it</h2>
              <p className="mt-3">
                We use the information you share only to respond to your enquiry,
                design and provide your cake, and arrange collection or delivery.
                We do not sell your information.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-medium text-ink">Cookies &amp; analytics</h2>
              <p className="mt-3">
                If analytics or conversion tracking is added, it should run with
                appropriate consent and a privacy-respecting configuration. Any
                cookies used will be documented here.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-medium text-ink">Your rights</h2>
              <p className="mt-3">
                You can ask to see, correct or delete the information we hold about
                you by contacting the studio.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-medium text-ink">Contact</h2>
              <p className="mt-3">
                For privacy questions, email{' '}
                <a href={`mailto:${site.contact.email}`} className="text-plum-600 underline">
                  {site.contact.email}
                </a>.
              </p>
            </div>

            <p className="rounded-xl border border-dashed border-stone-light bg-cream/40 px-5 py-4 text-xs text-stone">
              Development template — this privacy policy is a placeholder to be
              reviewed and finalised with the business and, where required,
              appropriate legal advice before launch.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
