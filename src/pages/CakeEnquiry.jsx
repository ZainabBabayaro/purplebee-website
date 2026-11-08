import { useRef, useState } from 'react'
import { Check, Upload, ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { Input, Textarea, Select } from '../components/form/Inputs.jsx'
import { site } from '../data/site.js'
import { flavourOptions, servingGuides } from '../data/cakes.js'

// ⚠️ Set to a form-service endpoint (Formspree, Web3Forms, etc.) to enable
// real submissions. While empty, the form validates and shows a local
// confirmation without sending data.
const FORM_ENDPOINT = ''

const occasions = [
  { value: 'Birthday', label: 'Birthday' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Anniversary', label: 'Anniversary' },
  { value: 'Baby Shower', label: 'Baby Shower' },
  { value: 'Graduation', label: 'Graduation' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Other', label: 'Other' },
]

const budgets = [
  { value: 'under-50000',       label: 'Under ₦50,000' },
  { value: '50000-100000',      label: '₦50,000 – ₦100,000' },
  { value: '100000-200000',     label: '₦100,000 – ₦200,000' },
  { value: '200000-plus',       label: '₦200,000+' },
  { value: 'unsure',            label: 'Not sure yet' },
]

const guestCounts = [
  { value: 'under-20',   label: 'Under 20 guests' },
  { value: '20-50',      label: '20–50 guests' },
  { value: '50-100',     label: '50–100 guests' },
  { value: '100-200',    label: '100–200 guests' },
  { value: '200-plus',   label: '200+ guests' },
  { value: 'unsure',     label: 'Not sure yet' },
]

const processSteps = [
  {
    step: '01',
    title: 'We review your enquiry',
    body: 'We read every detail you share and consider the best approach for your occasion.',
  },
  {
    step: '02',
    title: 'We get back to you',
    body: 'We respond within 48 hours to discuss your requirements, confirm availability and answer any questions.',
  },
  {
    step: '03',
    title: 'We agree the details',
    body: 'Design direction, flavour, size, pricing and timeline are all confirmed before your order is placed.',
  },
  {
    step: '04',
    title: 'Your cake is made',
    body: 'Once your deposit is received, your cake goes into production. We update you as needed and ensure everything is ready for your day.',
  },
]

const initial = {
  name: '',
  email: '',
  whatsapp: '',
  occasion: '',
  eventDate: '',
  eventLocation: '',
  guestCount: '',
  size: '',
  flavour: '',
  designDirection: '',
  budget: '',
  message: '',
}

function validate(values) {
  const e = {}
  if (!values.name.trim()) e.name = 'Please tell us your name.'
  if (!values.email.trim()) e.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Please enter a valid email.'
  if (!values.whatsapp.trim()) e.whatsapp = 'WhatsApp number is required so we can reach you quickly.'
  else if (!/^\+?[\d\s\-()]{7,}$/.test(values.whatsapp.trim())) e.whatsapp = 'Please enter a valid number.'
  if (!values.occasion) e.occasion = 'Please tell us the occasion.'
  if (!values.eventDate) e.eventDate = 'Please add your event date.'
  else {
    const d = new Date(values.eventDate)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (Number.isNaN(d.getTime())) e.eventDate = 'Invalid date.'
    else if (d < today) e.eventDate = 'Please choose a future date.'
  }
  if (!values.designDirection.trim() || values.designDirection.trim().length < 10)
    e.designDirection = 'Please tell us a little about the cake you have in mind.'
  return e
}

export default function CakeEnquiry() {
  const [values, setValues] = useState(initial)
  const [errors, setErrors]   = useState({})
  const [fileNames, setFileNames] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [serverErr, setServerErr]   = useState('')
  const fileRef = useRef(null)
  // Prevent duplicate submissions
  const submittedRef = useRef(false)

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
    setServerErr('')
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    setFileNames(files.map((f) => f.name))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittedRef.current) return // prevent duplicate submission
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(firstKey)?.focus()
      return
    }
    submittedRef.current = true
    setSubmitting(true)
    setServerErr('')
    try {
      if (FORM_ENDPOINT) {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => fd.append(k, v))
        const files = fileRef.current?.files
        if (files) Array.from(files).forEach((f) => fd.append('reference', f))
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: fd,
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error('Submission failed')
      } else {
        await new Promise((r) => setTimeout(r, 700))
      }
      setSubmitted(true)
    } catch {
      submittedRef.current = false
      setServerErr('Something went wrong. Please email us directly or message via WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <SEO title="Enquiry received | Purple Bee Cakes" canonicalPath="/cake-enquiry" noindex />
        <section className="bg-ivory pt-32 pb-20 md:pt-40">
          <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-plum-100">
              <Check size={36} strokeWidth={1.5} className="text-plum-600" />
            </div>
            <h1 className="mt-8 font-display text-4xl font-medium text-ink md:text-5xl">
              Thank you, {values.name.split(' ')[0] || 'there'}.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-stone">
              We have received your cake enquiry. We will review the details and be in touch within 48 hours to discuss your occasion and next steps.
            </p>
            <div className="mt-10 grid gap-4 rounded-2xl border border-line bg-cream/40 p-6 text-left text-sm sm:grid-cols-2">
              <div><p className="text-stone-light">Name</p><p className="mt-0.5 font-medium text-ink">{values.name}</p></div>
              <div><p className="text-stone-light">Email</p><p className="mt-0.5 font-medium text-ink">{values.email}</p></div>
              <div><p className="text-stone-light">WhatsApp</p><p className="mt-0.5 font-medium text-ink">{values.whatsapp}</p></div>
              <div><p className="text-stone-light">Occasion</p><p className="mt-0.5 font-medium text-ink">{values.occasion}</p></div>
              {values.eventDate && <div><p className="text-stone-light">Event date</p><p className="mt-0.5 font-medium text-ink">{values.eventDate}</p></div>}
              {values.budget && <div><p className="text-stone-light">Budget</p><p className="mt-0.5 font-medium text-ink">{values.budget}</p></div>}
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Cake Enquiry | Order a Custom Cake | Purple Bee Cakes Abuja"
        description="Start your cake enquiry with Purple Bee Cakes. Tell us about your occasion, vision and preferences — we will design something made entirely for your celebration."
        canonicalPath="/cake-enquiry"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Cake Enquiry', path: '/cake-enquiry' },
        ])]}
      />

      <PageHero
        eyebrow="Cake enquiry"
        title="Let's start your cake."
        intro="Tell us about your celebration, the cake you have in mind and what matters most. The more detail you share, the better we can design something that is truly right for your occasion."
        trail={[{ name: 'Home', to: '/' }, { name: 'Cake Enquiry', to: '/cake-enquiry' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {serverErr && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverErr}</p>
                  )}

                  <h2 className="font-display text-xl font-medium text-ink">Your details</h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input id="name"     label="Full name"        required value={values.name}     onChange={update('name')}     error={errors.name}     autoComplete="name"  placeholder="Jane Doe" />
                    <Input id="email"    type="email" label="Email" required value={values.email}    onChange={update('email')}    error={errors.email}    autoComplete="email" placeholder="jane@example.com" />
                  </div>
                  <Input id="whatsapp" type="tel" label="WhatsApp number" required hint="We use WhatsApp to share design updates and confirm details quickly." value={values.whatsapp} onChange={update('whatsapp')} error={errors.whatsapp} autoComplete="tel" placeholder="+234 900 000 0000" />

                  <h2 className="font-display text-xl font-medium text-ink pt-2">Your occasion</h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select id="occasion" label="Occasion" required placeholder="Select an occasion" options={occasions} value={values.occasion} onChange={update('occasion')} error={errors.occasion} />
                    <Input  id="eventDate" type="date" label="Event date" required value={values.eventDate} onChange={update('eventDate')} error={errors.eventDate} hint="Approximate is fine." />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input  id="eventLocation" label="Event location" hint="Venue name or area in Abuja." value={values.eventLocation} onChange={update('eventLocation')} placeholder="e.g. Wuse 2, Abuja" />
                    <Select id="guestCount"    label="Guest count (optional)" placeholder="Select a range" options={guestCounts} value={values.guestCount} onChange={update('guestCount')} />
                  </div>

                  <h2 className="font-display text-xl font-medium text-ink pt-2">Your cake</h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select id="size"    label="Preferred size (optional)" placeholder="Select a size" options={servingGuides.map((s) => ({ value: s.size, label: `${s.size} — ${s.servings}` }))} value={values.size} onChange={update('size')} />
                    <Select id="flavour" label="Preferred flavour (optional)" placeholder="Open to suggestions" options={flavourOptions.map((f) => ({ value: f, label: f }))} value={values.flavour} onChange={update('flavour')} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select id="budget"  label="Estimated budget (optional)" placeholder="Select a range" options={budgets} value={values.budget} onChange={update('budget')} />
                  </div>

                  <Textarea
                    id="designDirection"
                    label="Design direction"
                    required
                    rows={5}
                    hint="Describe the look, feel and any specific elements you have in mind. Reference a colour palette, a theme or any details that matter to you."
                    value={values.designDirection}
                    onChange={update('designDirection')}
                    error={errors.designDirection}
                    placeholder="e.g. A three-tier cake with a deep burgundy and gold palette, sugar flowers and a modern finish for a 40th birthday..."
                  />

                  {/* Reference image upload */}
                  <div>
                    <label htmlFor="reference" className="text-sm font-medium text-ink">
                      Reference images (optional)
                    </label>
                    <label
                      htmlFor="reference"
                      className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-cream/40 px-4 py-4 text-sm text-stone transition-colors hover:border-plum-300 hover:bg-cream"
                    >
                      <Upload size={18} strokeWidth={1.6} className="text-plum-500 shrink-0" />
                      {fileNames.length > 0
                        ? <span className="text-ink">{fileNames.join(', ')}</span>
                        : <span>Upload inspiration images — PNG, JPG, WebP (optional)</span>
                      }
                    </label>
                    <input
                      ref={fileRef}
                      id="reference"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFiles}
                    />
                    <p className="mt-1.5 text-xs text-stone">You can upload up to 5 images. These help us understand the look you are after.</p>
                  </div>

                  <Textarea
                    id="message"
                    label="Anything else we should know? (optional)"
                    rows={3}
                    value={values.message}
                    onChange={update('message')}
                    placeholder="Dietary requirements, collection preference, special requests..."
                  />

                  <button type="submit" disabled={submitting} className="btn btn-primary w-full sm:w-auto">
                    {submitting ? 'Sending your enquiry…' : 'Send enquiry'}
                    {!submitting && <ArrowRight size={16} strokeWidth={1.8} />}
                  </button>
                </form>
              </Reveal>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 space-y-5">
                {/* What happens next */}
                <div className="rounded-2xl bg-plum-900 p-7 text-ivory">
                  <p className="eyebrow text-plum-300">What happens next</p>
                  <ol className="mt-6 space-y-6">
                    {processSteps.map((step) => (
                      <li key={step.step} className="flex gap-4">
                        <span className="font-display text-2xl font-light text-plum-500 shrink-0">{step.step}</span>
                        <div>
                          <p className="font-medium text-ivory">{step.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-plum-200">{step.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* WhatsApp */}
                {site.contact.whatsapp && (
                  <div className="rounded-2xl border border-line bg-cream/40 p-6">
                    <p className="font-medium text-ink">Prefer to chat first?</p>
                    <p className="mt-1 text-sm text-stone">Send us a message on WhatsApp and we will respond quickly.</p>
                    <a
                      href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors w-full justify-center"
                    >
                      WhatsApp us
                    </a>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  )
}
