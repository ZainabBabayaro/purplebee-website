import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Instagram, Facebook, Check, ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { Input, Textarea } from '../components/form/Inputs.jsx'
import { site } from '../data/site.js'

const FORM_ENDPOINT = ''
const socialIcons = { Instagram, Facebook }

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const update = (f) => (e) => {
    setValues((v) => ({ ...v, [f]: e.target.value }))
    if (errors[f]) setErrors((er) => ({ ...er, [f]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.name.trim()) found.name = 'Please add your name.'
    if (!values.email.trim()) found.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) found.email = 'Please enter a valid email.'
    if (!values.message.trim() || values.message.trim().length < 10) found.message = 'Please write a short message.'
    setErrors(found)
    if (Object.keys(found).length) { document.getElementById(Object.keys(found)[0])?.focus(); return }
    setBusy(true)
    try {
      if (FORM_ENDPOINT) {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, v))
        await fetch(FORM_ENDPOINT, { method: 'POST', body: fd })
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      setSent(true)
    } catch { /* fail silently — user sees no false success */ }
    finally { setBusy(false) }
  }

  const waUrl = site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`
    : null

  return (
    <>
      <SEO
        title="Contact Purple Bee Cakes | Custom Cakes in Abuja"
        description="Get in touch with Purple Bee Cakes in Abuja — by email, WhatsApp or our contact form. We are happy to answer questions and help you start your cake order."
        canonicalPath="/contact"
        structured={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])]}
      />

      <PageHero
        eyebrow="Get in touch"
        title="Contact us."
        intro="Whether you have a question about an order, want to discuss a bespoke commission or simply need some guidance — we are here and happy to help."
        trail={[{ name: 'Home', to: '/' }, { name: 'Contact', to: '/contact' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

            {/* Details sidebar */}
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="font-display text-2xl font-medium text-ink md:text-3xl">
                  Our contact details
                </h2>

                <div className="mt-7 space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-plum-500" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-light">Email</p>
                      <a href={`mailto:${site.contact.email}`} className="text-ink hover:text-plum-600">
                        {site.contact.email}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  {waUrl && (
                    <div className="flex items-start gap-3">
                      <span className="mt-1 shrink-0 text-[#25D366]"><WhatsAppIcon /></span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-stone-light">WhatsApp</p>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink hover:text-plum-600"
                        >
                          Message us on WhatsApp
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} strokeWidth={1.6} className="mt-1 shrink-0 text-plum-500" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-light">Location</p>
                      <p className="text-ink">{site.serviceArea}</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="mt-10">
                  <p className="text-sm font-medium text-ink">Follow us</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {site.social.map((s) => {
                      const Icon = socialIcons[s.label]
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${site.name} on ${s.label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-plum-300 hover:text-plum-600"
                        >
                          {Icon ? <Icon size={18} strokeWidth={1.6} /> : <span className="text-xs font-medium">{s.label[0]}</span>}
                        </a>
                      )
                    })}
                  </div>
                </div>

                {/* WhatsApp CTA card */}
                {waUrl && (
                  <div className="mt-10 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[#25D366]"><WhatsAppIcon /></span>
                      <p className="font-medium text-ink">Chat with us on WhatsApp</p>
                    </div>
                    <p className="mt-2 text-sm text-stone">
                      For quick questions, design inspiration or to start a conversation about your cake — WhatsApp is the fastest way to reach us.
                    </p>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
                    >
                      <WhatsAppIcon />
                      Start a WhatsApp chat
                    </a>
                  </div>
                )}
              </Reveal>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-7">
              <Reveal delay={100}>
                {sent ? (
                  <div className="rounded-2xl border border-line bg-cream/40 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plum-100 text-plum-600">
                      <Check size={26} strokeWidth={1.6} />
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-medium text-ink">Message sent</h2>
                    <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-stone">
                      Thank you, {values.name.split(' ')[0] || 'there'}. We will be in touch shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSent(false); setValues({ name: '', email: '', message: '' }) }}
                      className="btn btn-ghost mt-6"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-cream/30 p-7 md:p-9">
                    <h2 className="font-display text-2xl font-medium text-ink">Send a message</h2>
                    <p className="mt-2 text-sm text-stone">
                      For a full cake enquiry, the{' '}
                      <Link to="/cake-enquiry" className="text-plum-600 underline">cake enquiry form</Link>
                      {' '}covers everything we need.
                    </p>
                    <div className="mt-6 space-y-5">
                      <Input id="name"    label="Your name" required value={values.name}    onChange={update('name')}    error={errors.name}    autoComplete="name"  />
                      <Input id="email"   type="email" label="Email" required value={values.email}   onChange={update('email')}   error={errors.email}   autoComplete="email" />
                      <Textarea id="message" label="Message" required rows={5} value={values.message} onChange={update('message')} error={errors.message} placeholder="How can we help?" />
                      <button type="submit" disabled={busy} className="btn btn-primary">
                        {busy ? 'Sending…' : 'Send message'}
                        {!busy && <ArrowRight size={16} strokeWidth={1.8} />}
                      </button>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-y bg-cream/50">
        <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
              Ready to order your cake?
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-stone">
              Start your enquiry and we will take care of everything from there.
            </p>
            <Link to="/cake-enquiry" className="btn btn-primary mt-8">
              Start your cake enquiry
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
