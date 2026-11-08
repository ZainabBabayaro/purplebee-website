import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

// Simple add-to-cart for cake slices and loaves — quantity selector + button only.
// No customisation modal. Used on product pages and collection cards.
export default function SimpleAddToCart({ product, compact = false }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const outOfStock = (product.stock ?? 1) <= 0

  const increment = () => setQty((q) => Math.min(q + 1, product.stock ?? 99))
  const decrement = () => setQty((q) => Math.max(1, q - 1))

  const handleAdd = () => {
    if (outOfStock || added) return
    add({
      id: product.slug || product.id,
      slug: product.slug || product.id,
      name: product.name,
      price: product.price,
      paletteKey: product.paletteKey,
      imageUrl: product.image || product.imageUrl || '',
      productType: product.productType,
      description: product.summary || '',
    }, qty)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setQty(1)
    }, 2500)
  }

  if (outOfStock) {
    return (
      <span className="rounded-full bg-stone/10 px-4 py-2 text-xs font-medium text-stone-light">
        Sold out
      </span>
    )
  }

  if (compact) {
    // Compact variant for collection cards — single button
    return (
      <button
        type="button"
        onClick={() => {
          add({
            id: product.slug || product.id,
            slug: product.slug || product.id,
            name: product.name,
            price: product.price,
            paletteKey: product.paletteKey,
            imageUrl: product.image || product.imageUrl || '',
            productType: product.productType,
            description: product.summary || '',
          }, 1)
          setAdded(true)
          setTimeout(() => setAdded(false), 2000)
        }}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          added
            ? 'bg-plum-100 text-plum-700'
            : 'bg-plum-600 text-ivory hover:bg-plum-700'
        }`}
        aria-label={`Add ${product.name} to basket`}
      >
        {added ? <Check size={14} strokeWidth={2} /> : <ShoppingBag size={14} strokeWidth={1.8} />}
        {added ? 'Added' : 'Add to basket'}
      </button>
    )
  }

  // Full variant for product pages — quantity selector + button
  return (
    <div className="flex flex-col gap-4">
      {/* Quantity selector */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Quantity</p>
        <div className="flex items-center gap-0 rounded-full border border-line bg-ivory w-fit">
          <button
            type="button"
            onClick={decrement}
            disabled={qty <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:text-plum-600 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus size={15} strokeWidth={2} />
          </button>
          <span className="w-10 text-center text-sm font-medium text-ink" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={increment}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:text-plum-600"
            aria-label="Increase quantity"
          >
            <Plus size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Add to basket button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={added}
        className={`btn w-full sm:w-auto transition-all ${
          added ? 'btn-outline text-plum-600' : 'btn-primary'
        }`}
      >
        {added ? (
          <>
            <Check size={17} strokeWidth={2} />
            Added to basket
          </>
        ) : (
          <>
            <ShoppingBag size={17} strokeWidth={1.8} />
            Add to basket
          </>
        )}
      </button>
    </div>
  )
}
