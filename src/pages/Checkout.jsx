import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Lock } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import Reveal from '../components/Reveal.jsx'
import { Input, Select, Textarea } from '../components/form/Inputs.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { dataApi } from '../services/db.js'
import PlaceholderArt from '../components/PlaceholderArt.jsx'
import { getPalette } from '../utils/images.js'
import { site } from '../data/site.js'

// ⚠️ Replace with your Paystack PUBLIC key (pk_live_... or pk_test_...)
const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const DELIVERY_OPTIONS = [
  { value: 'collection', label: 'Collection (free)' },
  { value: 'delivery', label: 'Local delivery (to be confirmed)' },
]

const FLAVOUR_OPTS = [
  'Vanilla bean & mascarpone', 'Lemon & elderflower', 'Dark chocolate & salted caramel',
  'Almond & raspberry', 'Earl grey & honey', 'Coconut & lime',
].map((f) => ({ value: f, label: f }))

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    eventDate: '',
    delivery: 'collection',
    flavour: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
    setServerErr('')
  }

  const validate = () => {
    const e = {}
    if (!values.name.trim()) e.name = 'Please add your name.'
    if (!values.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email.'
    if (!values.phone.trim()) e.phone = 'Phone number is required.'
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(values.phone.trim())) e.phone = 'Enter a valid phone number.'
    if (!values.eventDate) {
      e.eventDate = 'Please add your event date.'
    } else {
      const d = new Date(values.eventDate)
      if (Number.isNaN(d.getTime())) e.eventDate = 'Invalid date.'
      else if (d < new Date()) e.eventDate = 'Choose a future date.'
    }
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      document.getElementById(first)?.focus()
      return
    }
    setBusy(true)
    setServerErr('')
    try {
      // Step 1 — Save the order to Firestore with status 'pending_payment'.
      // The webhook will update it to 'confirmed' once Paystack confirms payment.
      const order = {
        uid: user?.uid || 'guest',
        customerName: values.name,
        customerEmail: values.email,
        customerPhone: values.phone,
        eventDate: values.eventDate,
        delivery: values.delivery,
        flavour: values.flavour,
        notes: values.notes,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        total,
        status: 'pending_payment',
      }
      const { id: orderId } = await dataApi.createOrder(order)

      // Step 2 — Open Paystack popup with the order ID in metadata.
      if (PAYSTACK_PUBLIC_KEY.startsWith('pk_test_YOUR') || !window.PaystackPop) {
        // Paystack not configured — skip payment and go straight to confirmation.
        clear()
        navigate('/order-confirmation', { state: { orderId, name: values.name } })
        return
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: values.email,
        amount: Math.round(total * 100), // Paystack uses kobo (smallest unit)
        currency: 'NGN',
        ref: `PBC-${orderId}-${Date.now()}`,
        metadata: {
          orderId,
          customerName: values.name,
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
            { display_name: 'Customer', variable_name: 'customer', value: values.name },
          ],
        },
        callback: (response) => {
          // Payment successful — clear cart and redirect.
          clear()
          navigate('/order-confirmation', { state: { orderId, name: values.name, paystackRef: response.reference } })
        },
        onClose: () => {
          // Customer closed the popup without paying — order stays as pending_payment.
          setBusy(false)
          setServerErr('Payment was not completed. Your order has been saved — you can try again.')
        },
      })
      handler.openIframe()
    } catch (err) {
      setBusy(false)
      setServerErr(err.message || 'There was a problem placing your order.')
    }
  }

  if (items.length === 0) {
    return (
      <section className="bg-ivory pt-32 pb-20 text-center">
        <SEO title="Checkout" canonicalPath="/checkout" noindex />
        <h1 className="font-display text-3xl text-ink">Your basket is empty</h1>
        <Link to="/store" className="btn btn-primary mt-8">Browse the store</Link>
      </section>
    )
  }

  return (
    <>
      <SEO title="Checkout" canonicalPath="/checkout" noindex />

      <section className="bg-ivory pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mb-10">
            <p className="eyebrow">Almost there</p>
            <h1 className="mt-4 font-display text-4xl font-medium text-ink md:text-5xl">Checkout</h1>
            <p className="mt-3 text-stone">
              Complete your details below. We will confirm your order by email and finalise any design details with you before your cake is made.
            </p>
          </Reveal>

          <form onSubmit={submit} noValidate>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">

              {/* Details */}
              <div className="space-y-5 lg:col-span-7">
                {serverErr && (
                  <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverErr}</p>
                )}

                <h2 className="font-display text-xl font-medium text-ink">Your details</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input id="name" label="Full name" required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                  <Input id="email" type="email" label="Email" required value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input id="phone" type="tel" label="Phone" required value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" />
                  <Input id="eventDate" type="date" label="Event date" required value={values.eventDate} onChange={set('eventDate')} error={errors.eventDate} hint="Approximate is fine." />
                </div>

                <Select
                  id="delivery"
                  label="Collection or delivery"
                  required
                  options={DELIVERY_OPTIONS}
                  value={values.delivery}
                  onChange={set('delivery')}
                />

                <Select
                  id="flavour"
                  label="Preferred flavour (optional)"
                  placeholder="Open to suggestions"
                  options={FLAVOUR_OPTS}
                  value={values.flavour}
                  onChange={set('flavour')}
                />

                <Textarea
                  id="notes"
                  label="Design notes or special requests (optional)"
                  rows={3}
                  value={values.notes}
                  onChange={set('notes')}
                  placeholder="Colour preferences, dietary requirements, anything else…"
                />

                {!user && (
                  <div className="rounded-xl border border-plum-200 bg-plum-50 px-5 py-4 text-sm text-plum-700">
                    <Link to="/account" className="font-medium underline">Sign in</Link> to track this order in your account, or continue as a guest.
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 rounded-2xl border border-line bg-cream/40 p-6">
                  <h2 className="font-display text-xl font-medium text-ink">Order summary</h2>

                  <ul className="mt-5 divide-y divide-line">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                          <PlaceholderArt
                            seed={`cake-${item.slug}`}
                            palette={getPalette(item.paletteKey)}
                            className="h-full w-full"
                            label={`${item.name} illustration`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                          <p className="text-xs text-stone">Qty: {item.qty}</p>
                        </div>
                        <span className="text-sm text-ink">{money(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-stone">Subtotal</span>
                    <span className="font-display text-2xl text-ink">{money(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone">Delivery cost (if applicable) confirmed separately. No payment taken now.</p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-stone">
                    <Lock size={13} strokeWidth={1.8} />
                    Your details are handled securely.
                  </div>

                  <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full">
                    {busy ? 'Placing order…' : 'Place order'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
