import { useState } from 'react'
import { Mail, MapPin, Instagram, Facebook, Check, Info } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { Input, Textarea } from '../components/form/Inputs.jsx'
import { site } from '../data/site.js'

// ⚠️ NOT YET CONNECTED. Set to a form-service endpoint to enable real messages.
const FORM_ENDPOINT = ''

const socialIcons = { Instagram, Facebook }

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.name.trim()) found.name = 'Please add your name.'
    if (!values.email.trim()) found.email = 'Please add an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) found.email = 'Please enter a valid email.'
    if (!values.message.trim() || values.message.trim().length < 10) found.message = 'Please write a short message.'
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    if (FORM_ENDPOINT) {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.append(k, v))
      await fetch(FORM_ENDPOINT, { method: 'POST', body: fd })
    }
    setSent(true)
  }

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with Purple Bee Cakes — by email or with the contact form. Bespoke cake enquiries welcome for celebrations and weddings."
        canonicalPath="/contact"
        structured={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])]}
      />
      <PageHero
        eyebrow="Get in touch"
        title="Contact"
        intro="The simplest way to start is the enquiry form, but if you have a quick question, a message here or an email will reach us just as well."
        trail={[{ name: 'Home', to: '/' }, { name: 'Contact', to: '/contact' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Details */}
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="font-display text-2xl font-medium text-ink md:text-3xl">Details</h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Mail size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-plum-500" />
                    <div>
                      <p className="text-sm text-stone-light">Email</p>
                      <a href={`mailto:${site.contact.email}`} className="text-ink hover:text-plum-600">
                        {site.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-plum-500" />
                    <div>
                      <p className="text-sm text-stone-light">Service area</p>
                      <p className="text-ink">{site.serviceArea}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-sm font-medium text-ink">Follow along</p>
                  <div className="mt-3 flex gap-3">
                    {site.social.map((s) => {
                      const Icon = socialIcons[s.label]
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-plum-300 hover:text-plum-600"
                        >
                          {Icon ? <Icon size={18} strokeWidth={1.6} /> : <span className="text-xs">{s.label[0]}</span>}
                        </a>
                      )
                    })}
                  </div>
                </div>

                <p className="mt-8 rounded-xl border border-dashed border-stone-light bg-cream/40 px-5 py-4 text-xs text-stone">
                  Development preview — contact details, social handles and the
                  service area are placeholders pending confirmation before launch.
                </p>
              </Reveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal delay={120}>
                {sent ? (
                  <div className="rounded-2xl border border-line bg-cream/40 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plum-100 text-plum-600">
                      <Check size={26} strokeWidth={1.6} />
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-medium text-ink">Message received</h2>
                    <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-stone">
                      Thanks, {values.name.split(' ')[0] || 'there'}. Your message is
                      noted below for your records.
                    </p>
                    <div className="mt-7 flex items-start gap-3 rounded-xl border border-dashed border-honey-500/60 bg-honey-400/10 px-5 py-4 text-left">
                      <Info size={18} className="mt-0.5 shrink-0 text-honey-600" />
                      <p className="text-sm leading-relaxed text-ink">
                        <strong>Development preview.</strong> This form is not yet
                        connected to a submission service, so your message has not
                        been sent to {site.name}. Please email us directly for now.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSent(false)
                        setValues({ name: '', email: '', message: '' })
                      }}
                      className="btn btn-ghost mt-7"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-cream/40 p-7 md:p-9">
                    <h2 className="font-display text-2xl font-medium text-ink">Send a message</h2>
                    <p className="mt-2 text-sm text-stone">
                      For a full cake enquiry, the{' '}
                      <a href="/enquiry" className="text-plum-600 underline">enquiry form</a>{' '}
                      covers everything we need.
                    </p>
                    <div className="mt-6 space-y-5">
                      <Input
                        id="name"
                        label="Your name"
                        required
                        value={values.name}
                        onChange={update('name')}
                        error={errors.name}
                        autoComplete="name"
                      />
                      <Input
                        id="email"
                        type="email"
                        label="Email"
                        required
                        value={values.email}
                        onChange={update('email')}
                        error={errors.email}
                        autoComplete="email"
                      />
                      <Textarea
                        id="message"
                        label="Message"
                        required
                        rows={5}
                        value={values.message}
                        onChange={update('message')}
                        error={errors.message}
                        placeholder="How can we help?"
                      />
                      <button type="submit" className="btn btn-primary">Send message</button>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
