import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import OptimizedImage from './OptimizedImage.jsx'
import ProductTypeTag from './ProductTypeTag.jsx'

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, count } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your basket"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2 font-display text-xl text-ink">
            <ShoppingBag size={20} strokeWidth={1.6} />
            Your basket
            {count > 0 && <span className="text-sm text-stone">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream"
            aria-label="Close basket"
          >
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={40} strokeWidth={1.2} className="text-plum-200 mb-4" />
            <p className="text-stone">Your basket is empty.</p>
            <Link to="/store" onClick={() => setOpen(false)} className="btn btn-outline mt-6">
              Browse the store
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-line py-4">
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <OptimizedImage
                      src={item.imageUrl || ''}
                      seed={`cake-${item.slug}`}
                      paletteKey={item.paletteKey || 'garden'}
                      alt={item.name}
                      aspect="1 / 1"
                      imgClassName="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          {item.productType && (
                            <ProductTypeTag productType={item.productType} />
                          )}
                        </div>
                        <p className="font-medium text-ink leading-snug">{item.name}</p>
                        {/* Customisation summary for full cakes */}
                        {item.customisation && (
                          <p className="text-xs text-stone-light mt-0.5 leading-snug">
                            {[
                              item.customisation.size,
                              item.customisation.flavour,
                              item.customisation.filling,
                              item.customisation.covering,
                            ].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="shrink-0 text-stone-light hover:text-red-500 mt-0.5"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} strokeWidth={1.6} />
                      </button>
                    </div>

                    <p className="text-sm text-stone mt-1">{money(item.price)}</p>

                    {/* Quantity + line total */}
                    <div className="mt-auto pt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink hover:text-plum-600"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={14} strokeWidth={2} />
                        </button>
                        <span className="w-8 text-center text-sm text-ink">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink hover:text-plum-600"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={14} strokeWidth={2} />
                        </button>
                      </div>
                      <span className="ml-auto font-medium text-ink">
                        {money(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-stone">Subtotal</span>
                <span className="font-display text-2xl text-ink">{money(total)}</span>
              </div>
              <p className="text-xs text-stone">
                Final pricing confirmed before payment. Delivery calculated at checkout.
              </p>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="btn btn-primary mt-4 w-full"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
