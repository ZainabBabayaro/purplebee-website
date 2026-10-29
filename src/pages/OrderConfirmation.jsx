import { useLocation, Link } from 'react-router-dom'
import { Check, Package } from 'lucide-react'
import SEO from '../components/SEO.jsx'

export default function OrderConfirmation() {
  const { state } = useLocation()
  const orderId = state?.orderId || '—'
  const name = state?.name || ''

  return (
    <>
      <SEO title="Order placed" canonicalPath="/order-confirmation" noindex />
      <section className="flex min-h-[80vh] items-center justify-center bg-ivory px-5 pt-24 pb-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-plum-100">
            <Check size={38} strokeWidth={1.5} className="text-plum-600" />
          </div>

          <h1 className="mt-8 font-display text-4xl font-medium text-ink md:text-5xl">
            Order placed{name ? `, ${name.split(' ')[0]}` : ''}!
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-stone">
            Thank you — your order has been received. We will be in touch to confirm your event date,
            flavour details and any finishing touches before we begin.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm text-ink">
            <Package size={16} strokeWidth={1.7} className="text-plum-500" />
            Order reference: <strong className="font-semibold">#{orderId.slice(-8).toUpperCase()}</strong>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/account" className="btn btn-primary">Track your order</Link>
            <Link to="/store" className="btn btn-outline">Back to store</Link>
          </div>
        </div>
      </section>
    </>
  )
}
