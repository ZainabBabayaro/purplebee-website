import { useEffect, useState } from 'react'
import { X, ShoppingBag, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import OptimizedImage from './OptimizedImage.jsx'
import {
  flavourOptions,
  fillingOptions,
  coveringOptions,
  servingGuides,
} from '../data/cakes.js'

// ── CakeCustomiser
// A modal that collects sponge flavour, filling, covering and size before
// adding the item to the cart. Closes on Esc or backdrop click.

function SelectField({ id, label, value, onChange, options, placeholder, error }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} <span className="text-plum-500" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm bg-ivory transition-colors focus:outline-none ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-line focus:border-plum-400'
          } ${value ? 'text-ink' : 'text-stone-light'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} strokeWidth={1.8} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone" />
      </div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}

export default function CakeCustomiser({ cake, onClose }) {
  const { add } = useCart()
  const [form, setForm] = useState({ flavour: '', filling: '', covering: '', size: '' })
  const [errors, setErrors] = useState({})
  const [added, setAdded] = useState(false)

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const set = (field) => (val) => {
    setForm((f) => ({ ...f, [field]: val }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.flavour)  e.flavour  = 'Please choose a sponge flavour.'
    if (!form.filling)  e.filling  = 'Please choose a filling.'
    if (!form.covering) e.covering = 'Please choose a covering.'
    if (!form.size)     e.size     = 'Please choose a size.'
    return e
  }

  const handleAdd = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    // Find the matching size guide for price display
    const sizeGuide = servingGuides.find((s) => s.size === form.size)
    const coveringLabel = coveringOptions.find((c) => c.value === form.covering)?.label || form.covering

    add({
      id: `${cake.slug}-${form.flavour}-${form.filling}-${form.covering}-${form.size}`.toLowerCase().replace(/\s+/g, '-'),
      slug: cake.slug,
      name: cake.name,
      price: cake.price,
      paletteKey: cake.paletteKey,
      imageUrl: cake.image || '',
      customisation: {
        flavour: form.flavour,
        filling: form.filling,
        covering: coveringLabel,
        size: form.size,
        servings: sizeGuide?.servings || '',
      },
      // Summary shown in cart
      description: `${form.size} · ${form.flavour} · ${form.filling} · ${coveringLabel}`,
    }, 1)

    setAdded(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-t-3xl bg-ivory sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Customise your ${cake.name}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ivory/95 backdrop-blur px-6 py-4">
          <div>
            <p className="eyebrow text-plum-600">Customise your cake</p>
            <h2 className="mt-0.5 font-display text-xl font-medium text-ink">{cake.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-cream"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.6} />
          </button>
        </div>

        <div className="px-6 pb-8 pt-5">
          {/* Cake preview */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-cream/40 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <OptimizedImage
                src={cake.image}
                seed={`cake-${cake.slug}`}
                paletteKey={cake.paletteKey}
                alt={cake.name}
                aspect="1 / 1"
              />
            </div>
            <div>
              <p className="font-medium text-ink">{cake.name}</p>
              <p className="text-sm text-stone">{cake.summary}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <SelectField
              id="flavour"
              label="Sponge flavour"
              value={form.flavour}
              onChange={set('flavour')}
              options={flavourOptions}
              placeholder="Choose a sponge flavour"
              error={errors.flavour}
            />
            <SelectField
              id="filling"
              label="Filling"
              value={form.filling}
              onChange={set('filling')}
              options={fillingOptions}
              placeholder="Choose a filling"
              error={errors.filling}
            />
            <SelectField
              id="covering"
              label="Covering"
              value={form.covering}
              onChange={set('covering')}
              options={coveringOptions}
              placeholder="Choose a covering"
              error={errors.covering}
            />
            <SelectField
              id="size"
              label="Size"
              value={form.size}
              onChange={set('size')}
              options={servingGuides.map((s) => ({
                value: s.size,
                label: `${s.size} — ${s.servings}`,
              }))}
              placeholder="Choose a size"
              error={errors.size}
            />
          </div>

          {/* Summary */}
          {form.flavour && form.filling && form.covering && form.size && (
            <div className="mt-6 rounded-xl bg-plum-50 border border-plum-200 px-4 py-3 text-sm text-plum-700">
              <p className="font-medium">Your selection</p>
              <p className="mt-1 text-plum-600">
                {form.size} · {form.flavour} · {form.filling} ·{' '}
                {coveringOptions.find((c) => c.value === form.covering)?.label || form.covering}
              </p>
            </div>
          )}

          {/* Add to basket */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={added}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition-all ${
              added
                ? 'bg-plum-100 text-plum-700'
                : 'bg-plum-600 text-ivory hover:bg-plum-700'
            }`}
          >
            <ShoppingBag size={17} strokeWidth={1.8} />
            {added ? 'Added to basket ✓' : 'Add to basket'}
          </button>

          <p className="mt-3 text-center text-xs text-stone">
            All four options must be selected before adding to basket.
          </p>
        </div>
      </div>
    </div>
  )
}
