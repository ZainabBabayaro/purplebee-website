import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import PlaceholderArt from './PlaceholderArt.jsx'
import { getPalette } from '../utils/images.js'

function money(n) {
  return `£${Number(n).toFixed(2)}`
}

// Slide-in cart drawer. Opens automatically when an item is added.
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
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2 font-display text-xl text-ink">
            <ShoppingBag size={20} strokeWidth={1.6} />
            Your basket {count > 0 && <span className="text-sm text-stone">({count})</span>}
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
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <PlaceholderArt
                      seed={`cake-${item.slug}`}
                      palette={getPalette(item.paletteKey)}
                      className="h-full w-full"
                      label={`${item.name} illustration`}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-ink">{item.name}</p>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-stone-light hover:text-red-500"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} strokeWidth={1.6} />
                      </button>
                    </div>
                    <p className="text-sm text-stone">{money(item.price)}</p>
                    <div className="mt-auto flex items-center gap-3">
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

            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-stone">Subtotal</span>
                <span className="font-display text-2xl text-ink">{money(total)}</span>
              </div>
              <p className="mt-1 text-xs text-stone">
                Final pricing is confirmed before payment. Delivery calculated at checkout.
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
