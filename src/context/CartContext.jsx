import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const STORAGE_KEY = 'pb_cart'

function loadCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  // Start empty so the first client render matches the prerendered HTML (the
  // cart lives only in localStorage, which the server cannot read). The saved
  // basket is applied in an effect immediately after hydration.
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setHydrated(true)
  }, [])

  // Persist only after the saved basket has been loaded. Writing before that
  // would overwrite storage with an empty cart (and StrictMode remounts the
  // effects, so the order matters).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items, hydrated])
  const add = (product, qty = 1) => {
    const lineId = product.lineId || product.id
    const safeQty = Math.max(1, parseInt(qty, 10) || 1)
    setItems((prev) => {
      const existing = prev.find((i) => i.id === lineId)
      if (existing) {
        return prev.map((i) => (i.id === lineId ? { ...i, qty: i.qty + safeQty } : i))
      }
      return [
        ...prev,
        {
          id: lineId,
          // The inventory product id (line id can include customisation).
          productId: product.productId || product.id || product.slug,
          slug: product.slug || product.id,
          name: product.name,
          price: Number(product.price) || 0,
          unitPrice: Number(product.price) || 0,
          paletteKey: product.paletteKey,
          imageUrl: product.imageUrl || product.image || '',
          description: product.description || '',
          customisation: product.customisation || null,
          productType: product.productType || 'cake',
          purchaseType: product.purchaseType || 'simple',
          variantId: product.variantId || product.customisation?.variantId || null,
          qty: safeQty,
        },
      ]
    })
    setOpen(true)
  }

  const setQty = (id, qty) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const clear = () => setItems([])

  const count = items.reduce((n, i) => n + i.qty, 0)
  const total = items.reduce((n, i) => n + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, open, setOpen, add, setQty, remove, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  )
}
