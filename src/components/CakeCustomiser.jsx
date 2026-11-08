import { useEffect, useState } from 'react'
import { X, ShoppingBag, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import OptimizedImage from './OptimizedImage.jsx'
import { Textarea } from './form/Inputs.jsx'
import {
  flavourOptions,
  fillingOptions,
  coveringOptions,
  servingGuides,
  eventTypeOptions,
  celebrantGenderOptions,
} from '../data/cakes.js'

// ── CakeCustomiser
// A modal that collects sponge flavour, filling, covering and size before
// adding the item to the cart. Tiered cakes use their own size variations
// (each with its own price); single-tier cakes use the standard size guide.
// Closes on Esc or backdrop click.

function money(n) {
  return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const EVENT_TYPES = eventTypeOptions
const GENDER_OPTIONS = celebrantGenderOptions

function SelectField({ id, label, value, onChange, options, placeholder, error, required = true }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-plum-500" aria-hidden="true">*</span>}
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
  const [form, setForm] = useState({
    flavour: '',
    filling: '',
    covering: '',
    size: '',
    eventType: '',
    celebrantGender: '',
    details: '',
  })
  const [errors, setErrors] = useState({})
  const [added, setAdded] = useState(false)

  const variants = Array.isArray(cake.variants) ? cake.variants : []
  const isTiered = variants.length > 0

  // Size choices: product-specific tier variations, or the standard single-tier
  // serving guide. Tier variations carry their own price.
  const sizeOptions = isTiered
    ? variants.map((v) => ({ value: v.id, label: `${v.label} — ${money(v.price)}` }))
    : servingGuides.map((s) => ({ value: s.size, label: `${s.size} — ${s.servings}` }))

  const selectedVariant = isTiered ? variants.find((v) => v.id === form.size) : null
  const selectedGuide = !isTiered ? servingGuides.find((s) => s.size === form.size) : null
  const selectedPrice = selectedVariant ? Number(selectedVariant.price) : cake.price
  const selectedLabel = selectedVariant?.label || form.size
  const selectedServings = selectedVariant?.servings || selectedGuide?.servings || ''

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

    const coveringLabel = coveringOptions.find((c) => c.value === form.covering)?.label || form.covering
    const lineId = `${cake.slug}-${form.size}-${form.flavour}-${form.filling}-${form.covering}`
      .toLowerCase()
      .replace(/\s+/g, '-')

    add({
      id: lineId,
      // The underlying inventory product — used for stock lookup at checkout.
      productId: cake.id || cake.slug,
      slug: cake.slug,
      name: cake.name,
      price: selectedPrice,
      paletteKey: cake.paletteKey,
      imageUrl: cake.image || '',
      productType: 'cake',
      customisation: {
        variantId: form.size,
        size: selectedLabel,
        servings: selectedServings,
        flavour: form.flavour,
        filling: form.filling,
        covering: coveringLabel,
        eventType: form.eventType,
        celebrantGender: form.celebrantGender,
        details: form.details.trim(),
      },
      // Summary shown in cart
      description: [selectedLabel, form.flavour, form.filling, coveringLabel]
        .filter(Boolean)
        .join(' · '),
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
              label={isTiered ? 'Size (tier combination)' : 'Size'}
              value={form.size}
              onChange={set('size')}
              options={sizeOptions}
              placeholder={isTiered ? 'Choose a tier combination' : 'Choose a size'}
              error={errors.size}
            />

            {/* Event / celebrant details */}
            <div className="border-t border-line pt-5">
              <p className="text-sm font-medium text-ink">Celebrant details <span className="font-normal text-stone">(optional)</span></p>
              <div className="mt-3 space-y-5">
                <SelectField
                  id="eventType"
                  label="Event / occasion"
                  value={form.eventType}
                  onChange={set('eventType')}
                  options={EVENT_TYPES}
                  placeholder="Select the occasion"
                  required={false}
                />
                <SelectField
                  id="celebrantGender"
                  label="Celebrant's gender"
                  value={form.celebrantGender}
                  onChange={set('celebrantGender')}
                  options={GENDER_OPTIONS}
                  placeholder="Select the celebrant's gender"
                  required={false}
                />
                <Textarea
                  id="details"
                  label="More details"
                  hint="Names, message on the cake, colour notes, dietary needs — anything that helps us get it right."
                  rows={3}
                  value={form.details}
                  onChange={(e) => set('details')(e.target.value)}
                  placeholder="e.g. “Happy 30th, Amaka” in gold lettering; no nuts; blush and ivory palette…"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {form.flavour && form.filling && form.covering && form.size && (
            <div className="mt-6 rounded-xl bg-plum-50 border border-plum-200 px-4 py-3 text-sm text-plum-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">Your selection</p>
                  <p className="mt-1 text-plum-600">
                    {selectedLabel}
                    {selectedServings ? ` (${selectedServings})` : ''} · {form.flavour} · {form.filling} ·{' '}
                    {coveringOptions.find((c) => c.value === form.covering)?.label || form.covering}
                  </p>
                  {form.eventType && (
                    <p className="mt-1 text-plum-600">Occasion: {form.eventType}</p>
                  )}
                  {form.celebrantGender && (
                    <p className="mt-1 text-plum-600">Celebrant: {form.celebrantGender}</p>
                  )}
                </div>
                <span className="shrink-0 font-display text-lg font-medium text-plum-800">
                  {money(selectedPrice)}
                </span>
              </div>
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
            {added ? 'Added to basket ✓' : `Add to basket${form.size ? ` — ${money(selectedPrice)}` : ''}`}
          </button>

          <p className="mt-3 text-center text-xs text-stone">
            Flavour, filling, covering and size are required. Celebrant details are optional.
          </p>
        </div>
      </div>
    </div>
  )
}
