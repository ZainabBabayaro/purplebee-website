import { Link, useLocation } from 'react-router-dom'
import { Check, Package } from 'lucide-react'
import SEO from '../components/SEO.jsx'

// /thank-you handles post-payment order confirmation AND post-enquiry success.
// Reads from router state: { orderId, name, type: 'order'|'enquiry' }
export default function ThankYou() {
  const { state } = useLocation()
  const orderId  = state?.orderId || null
  const name     = state?.name    || ''
  const type     = state?.type    || (orderId ? 'order' : 'enquiry')

  const isOrder = type === 'order' && orderId

  return (
    <>
      <SEO
        title={isOrder ? 'Order confirmed | Purple Bee Cakes' : 'Enquiry received | Purple Bee Cakes'}
        canonicalPath="/thank-you"
        noindex
      />

      <section className="flex min-h-[85vh] items-center justify-center bg-ivory px-5 pt-24 pb-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-plum-100">
            <Check size={38} strokeWidth={1.5} className="text-plum-600" />
          </div>

          {isOrder ? (
            <>
              <h1 className="mt-8 font-display text-4xl font-medium text-ink md:text-5xl">
                {name ? `Thank you, ${name.split(' ')[0]}!` : 'Order confirmed!'}
              </h1>
              <p className="mt-4 text-pretty leading-relaxed text-stone">
                Your order has been received and confirmed. We will be in touch to finalise the details of your cake and confirm your collection or delivery arrangement.
              </p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm text-ink">
                <Package size={16} strokeWidth={1.7} className="text-plum-500" />
                Order reference:&nbsp;
                <strong className="font-semibold">
                  #{orderId.slice(-8).toUpperCase()}
                </strong>
              </div>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/account" className="btn btn-primary">Track your order</Link>
                <Link to="/shop" className="btn btn-outline">Back to store</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-8 font-display text-4xl font-medium text-ink md:text-5xl">
                {name ? `Thank you, ${name.split(' ')[0]}!` : 'Enquiry received!'}
              </h1>
              <p className="mt-4 text-pretty leading-relaxed text-stone">
                We have received your cake enquiry and will be in touch within 48 hours to discuss your occasion and next steps.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/" className="btn btn-primary">Back to home</Link>
                <Link to="/our-cakes" className="btn btn-outline">Browse our cakes</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
