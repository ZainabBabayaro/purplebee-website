import { useRef, useState } from 'react'
import { Check, Mail, Upload } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'
import { Input, Textarea, Select } from '../components/form/Inputs.jsx'
import { site, enquiryInfo } from '../data/site.js'
import { flavourOptions, servingGuides } from '../data/cakes.js'
import { dataApi } from '../services/db.js'
import { compressImage } from '../utils/files.js'
import { enquiryNotificationMail } from '../utils/mail.js'

const occasions = [
  { value: 'Birthday', label: 'Birthday' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Anniversary', label: 'Anniversary' },
  { value: 'Celebration', label: 'Celebration' },
  { value: 'Other', label: 'Other' },
]

const budgets = [
  { value: 'under-50000', label: 'Under ₦50,000' },
  { value: '50000-100000', label: '₦50,000 – ₦100,000' },
  { value: '100000-200000', label: '₦100,000 – ₦200,000' },
  { value: '200000-plus', label: '₦200,000+' },
  { value: 'unsure', label: 'Not sure yet' },
]

const deliveryOptions = [
  { value: 'Collection', label: 'Collection' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Unsure', label: 'Not sure yet' },
]

const faqs = [
  {
    q: 'How far ahead should I enquire?',
    a: enquiryInfo.leadTime,
  },
  {
    q: 'Do you make cakes for weddings as well as birthdays?',
    a: 'Yes — bespoke celebration and wedding cakes are both part of what we do. The enquiry form covers both, so tell us the occasion and we will take it from there.',
  },
  {
    q: 'Can I send reference images?',
    a: 'Absolutely. There is an optional image field in the form, and you are welcome to attach anything that shows the mood or details you have in mind.',
  },
  {
    q: 'How is pricing worked out?',
    a: 'Each cake is bespoke, so pricing depends on design, size and detail. We provide guidance once we understand what you are after, and confirm everything before you commit.',
  },
]

const initial = {
  name: '',
  email: '',
  phone: '',
  occasion: '',
  eventDate: '',
  size: '',
  flavour: '',
  description: '',
  budget: '',
  delivery: '',
}

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please tell us your name.'
  if (!values.email.trim()) {
    errors.email = 'Please add an email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (values.eventDate) {
    const d = new Date(values.eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(d.getTime())) errors.eventDate = 'Please enter a valid date.'
    else if (d < today) errors.eventDate = 'Please choose a date in the future.'
  }
  if (!values.description.trim() || values.description.trim().length < 10) {
    errors.description = 'A few sentences about your cake will help us reply well.'
  }
  return errors
}

export default function Enquiry() {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [files, setFiles] = useState([])
  const [fileNames, setFileNames] = useState([])
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const [serverErr, setServerErr] = useState('')
  const submittedRef = useRef(false)

  const update = (field) => (e) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }))
    setServerErr('')
  }

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5)
    setFiles(selected)
    setFileNames(selected.map((f) => f.name))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittedRef.current) return
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      const el = document.getElementById(firstKey)
      if (el) {
        el.focus()
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    submittedRef.current = true
    setStatus('submitting')
    setServerErr('')
    try {
      const referenceImages = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          url: await compressImage(f),
        })),
      )
      await dataApi.addEnquiry({
        ...values,
        message: values.description,
        referenceImages,
        source: 'general-enquiry',
      })
      try {
        await dataApi.addMail(enquiryNotificationMail({ ...values, message: values.description, source: 'general-enquiry' }))
      } catch (notifyErr) {
        console.error('[enquiry] Notification email failed:', notifyErr)
      }
      setStatus('done')
      setSubmitted(true)
    } catch (err) {
      submittedRef.current = false
      setStatus('idle')
      setServerErr(
        err?.message
          ? `We could not send your enquiry: ${err.message}. Please email us directly or message via WhatsApp.`
          : 'Something went wrong sending your enquiry. Please email us directly or message via WhatsApp.',
      )
    }
  }

  if (submitted) {
    return (
      <>
        <SEO
          title="Enquiry"
          description="Enquire about a bespoke cake from Purple Bee Cakes."
          canonicalPath="/enquiry"
          noindex
        />
        <section className="bg-ivory pt-32 pb-20 md:pt-40">
          <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-plum-100 text-plum-600">
              <Check size={30} strokeWidth={1.6} />
            </div>
            <h1 className="mt-7 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
              Thank you, {values.name.split(' ')[0] || 'there'}.
            </h1>
            <p className="mt-5 text-pretty leading-relaxed text-stone">
              Your enquiry has been sent to {site.name}. We will review it and get back to you as soon as we can.
            </p>

            <dl className="mt-9 grid gap-x-6 gap-y-4 rounded-2xl border border-line bg-cream/40 p-6 text-left text-sm sm:grid-cols-2">
              <div><dt className="text-stone-light">Name</dt><dd className="mt-0.5 text-ink">{values.name}</dd></div>
              <div><dt className="text-stone-light">Email</dt><dd className="mt-0.5 text-ink">{values.email}</dd></div>
              {values.phone && <div><dt className="text-stone-light">Phone</dt><dd className="mt-0.5 text-ink">{values.phone}</dd></div>}
              {values.occasion && <div><dt className="text-stone-light">Occasion</dt><dd className="mt-0.5 text-ink">{values.occasion}</dd></div>}
              {values.eventDate && <div><dt className="text-stone-light">Event date</dt><dd className="mt-0.5 text-ink">{values.eventDate}</dd></div>}
              {values.size && <div><dt className="text-stone-light">Size</dt><dd className="mt-0.5 text-ink">{values.size}</dd></div>}
              {values.budget && <div><dt className="text-stone-light">Budget</dt><dd className="mt-0.5 text-ink">{values.budget}</dd></div>}
              {values.delivery && <div><dt className="text-stone-light">Collection / delivery</dt><dd className="mt-0.5 text-ink">{values.delivery}</dd></div>}
            </dl>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href={`mailto:${site.contact.email}`} className="btn btn-primary">
                <Mail size={16} strokeWidth={1.8} />
                Email the studio instead
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setStatus('idle')
                  setValues(initial)
                  setFiles([])
                  setFileNames([])
                  submittedRef.current = false
                }}
                className="btn btn-ghost"
              >
                Start a new enquiry
              </button>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Enquire"
        description="Enquire about a bespoke cake from Purple Bee Cakes. Tell us about your occasion, the feel you are after and the cake you have in mind."
        canonicalPath="/enquiry"
        structured={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Enquire', path: '/enquiry' }])]}
      />
      <PageHero
        eyebrow="Bespoke enquiry"
        title="Enquire about a cake"
        intro="Tell us about your celebration, the feel you are after and the cake you have in mind. The more we know, the better we can reply."
        trail={[{ name: 'Home', to: '/' }, { name: 'Enquire', to: '/enquiry' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {(errors.form || serverErr) && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {serverErr || errors.form}
                    </p>
                  )}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      id="name"
                      label="Your name"
                      required
                      value={values.name}
                      onChange={update('name')}
                      error={errors.name}
                      autoComplete="name"
                      placeholder="Jane Doe"
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
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      id="phone"
                      type="tel"
                      label="Phone (optional)"
                      value={values.phone}
                      onChange={update('phone')}
                      autoComplete="tel"
                      placeholder="07123 456789"
                    />
                    <Input
                      id="eventDate"
                      type="date"
                      label="Event date (optional)"
                      value={values.eventDate}
                      onChange={update('eventDate')}
                      error={errors.eventDate}
                      hint="Approximate is fine."
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Select
                      id="occasion"
                      label="Occasion"
                      placeholder="Select an occasion"
                      options={occasions}
                      value={values.occasion}
                      onChange={update('occasion')}
                    />
                    <Select
                      id="size"
                      label="Size / servings (optional)"
                      placeholder="Select a size"
                      options={servingGuides.map((s) => ({ value: `${s.size} — ${s.servings}`, label: `${s.size} (${s.servings})` }))}
                      value={values.size}
                      onChange={update('size')}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Select
                      id="flavour"
                      label="Preferred flavour (optional)"
                      placeholder="Open to suggestions"
                      options={flavourOptions.map((f) => ({ value: f, label: f }))}
                      value={values.flavour}
                      onChange={update('flavour')}
                    />
                    <Select
                      id="budget"
                      label="Budget (optional)"
                      placeholder="Select a range"
                      options={budgets}
                      value={values.budget}
                      onChange={update('budget')}
                    />
                  </div>

                  <Select
                    id="delivery"
                    label="Collection or delivery (optional)"
                    placeholder="Select a preference"
                    options={deliveryOptions}
                    value={values.delivery}
                    onChange={update('delivery')}
                  />

                  <Textarea
                    id="description"
                    label="Tell us about the cake"
                    required
                    rows={5}
                    value={values.description}
                    onChange={update('description')}
                    error={errors.description}
                    placeholder="The occasion, the look you are after, any colours, themes or details that matter…"
                  />

                  {/* Reference image (optional, not yet wired to storage) */}
                  {/* <div>
                    <label htmlFor="reference" className="text-sm font-medium text-ink">
                      Reference image (optional)
                    </label>
                    <label
                      htmlFor="reference"
                      className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-cream/40 px-4 py-4 text-sm text-stone transition-colors hover:border-plum-300 hover:bg-cream"
                    >
                      <Upload size={18} strokeWidth={1.6} className="text-plum-500" />
                      {fileNames.length ? (
                        <span className="text-ink">{fileNames.join(', ')}</span>
                      ) : (
                        <span>Click to upload reference images (PNG, JPG)</span>
                      )}
                    </label>
                    <input
                      id="reference"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFiles}
                    />
                    <p className="mt-1.5 text-xs text-stone">
                      Optional. Filenames are stored with your enquiry so we know what to expect if you send images separately.
                    </p>
                  </div> */}

                  <div className="pt-2">
                    <button type="submit" disabled={status === 'submitting'} className="btn btn-primary w-full sm:w-auto">
                      {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
                    </button>
                  </div>
                </form>
              </Reveal>
            </div>

            {/* Aside */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <div className="rounded-2xl bg-plum-900 p-7 text-ivory">
                    <p className="eyebrow text-plum-300">What happens next</p>
                    <ol className="mt-6 space-y-6">
                      {enquiryInfo.process.map((step) => (
                        <li key={step.step} className="flex gap-4">
                          <span className="font-display text-2xl font-light text-plum-400/70">{step.step}</span>
                          <div>
                            <p className="font-medium text-ivory">{step.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-plum-200">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-7">
                    <p className="text-sm font-medium text-ink">Prefer to talk first?</p>
                    <a href={`mailto:${site.contact.email}`} className="mt-2 block text-stone hover:text-plum-600">
                      {site.contact.email}
                    </a>
                    <p className="mt-3 text-xs leading-relaxed text-stone">
                      {enquiryInfo.leadTime}
                    </p>
                  </div>
                </Reveal>
              </div>
            </aside>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl">
            <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">Before you enquire</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink marker:hidden">
                    {f.q}
                    <span className="text-plum-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-pretty leading-relaxed text-stone">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
