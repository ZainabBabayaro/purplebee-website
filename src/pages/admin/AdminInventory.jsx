import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Save, Eye, EyeOff, AlertTriangle, ImagePlus, RefreshCw, Layers, X,
  Archive, Trash2, Pencil, Package,
} from 'lucide-react'
import { dataApi } from '../../services/db.js'
import PlaceholderArt from '../../components/PlaceholderArt.jsx'
import { getPalette } from '../../utils/images.js'
import {
  cakes, buildTierVariants, purchaseTypeOptions, productTypeLabel,
  productImages, productMainImage,
} from '../../data/cakes.js'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

const PRODUCT_TYPES = [
  { value: 'cake',       label: 'Cake (full celebration cake)' },
  { value: 'cake-slice', label: 'Cake Slice (individual slice)' },
  { value: 'cake-loaf',  label: 'Cake Loaf (loaf cake)' },
]

const PALETTES = ['garden', 'painterly', 'quiet', 'sculptural']

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function TypeBadge({ productType }) {
  const styles = {
    'cake':       'bg-plum-700/60 text-plum-200',
    'cake-slice': 'bg-amber-900/40 text-amber-300',
    'cake-loaf':  'bg-plum-800 text-plum-400',
  }
  const type = productType || 'cake'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${styles[type] || styles['cake']}`}>
      {productTypeLabel[type] || type}
    </span>
  )
}

function PurchaseBadge({ purchaseType }) {
  const labels = { simple: 'Simple', configurable: 'Configurable', quotation: 'Quotation' }
  const styles = {
    simple: 'bg-emerald-900/40 text-emerald-300',
    configurable: 'bg-sky-900/40 text-sky-300',
    quotation: 'bg-amber-900/40 text-amber-300',
  }
  const t = purchaseType || 'simple'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${styles[t] || styles.simple}`}>
      {labels[t] || t}
    </span>
  )
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function normalizeVariants(list) {
  return (list || [])
    .map((v, i) => ({
      id: v.id || `tier-${i + 1}`,
      label: String(v.label || '').trim(),
      servings: String(v.servings || '').trim(),
      price: Number(v.price),
    }))
    .filter((v) => v.label && Number.isFinite(v.price) && v.price >= 0)
}

// Editor for a product's size variations (label + servings + price).
function VariantsEditor({ value = [], onChange, basePrice = 0 }) {
  const variants = value || []
  const update = (i, patch) => onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  const addRow = () => onChange([
    ...variants,
    { id: `tier-${Date.now()}`, label: '', servings: '', price: '' },
  ])
  const removeRow = (i) => onChange(variants.filter((_, idx) => idx !== i))

  const field = 'w-full rounded-lg border border-plum-700 bg-plum-950 px-2.5 py-1.5 text-xs text-ivory placeholder:text-plum-600 focus:border-plum-400 focus:outline-none'

  return (
    <div className="rounded-xl border border-plum-700 bg-plum-950/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-plum-300">
            <Layers size={13} strokeWidth={2} /> Size variations
          </p>
          <p className="mt-0.5 text-[0.65rem] text-plum-500">Each row is a selectable size with its own price.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(buildTierVariants(Number(basePrice) || 0))}
            className="rounded-full border border-plum-700 px-3 py-1 text-[0.65rem] text-plum-300 hover:border-plum-500 hover:text-ivory"
          >
            Use default tiers
          </button>
          <button
            type="button"
            onClick={addRow}
            className="rounded-full bg-plum-700 px-3 py-1 text-[0.65rem] font-medium text-ivory hover:bg-plum-600"
          >
            + Add size
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-plum-400">
          No size variations yet. Add one, or use the default 6" + 8" to 12" + 14" tiers.
        </p>
      ) : (
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.id || i} className="grid gap-2 sm:grid-cols-[1fr_8.5rem_7rem_1.75rem]">
              <input
                type="text"
                aria-label={`Size ${i + 1} label`}
                value={v.label || ''}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder='e.g. 6" 3 layers + 8" 3 layers'
                className={field}
              />
              <input
                type="text"
                aria-label={`Size ${i + 1} servings`}
                value={v.servings || ''}
                onChange={(e) => update(i, { servings: e.target.value })}
                placeholder="20–30 servings"
                className={field}
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] text-plum-500">₦</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  aria-label={`Size ${i + 1} price`}
                  value={v.price ?? ''}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder="280000"
                  className={`${field} pl-5`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label={`Remove size ${i + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:border-red-700 hover:text-red-300"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Image manager ─────────────────────────────────────────────────────────────
function ImageManager({ productId, images, onChange, onError }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setUploading(true)
    onError?.('')
    const next = [...images]
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) throw new Error('Each image must be under 5 MB.')
        let url
        try {
          // Real upload: R2 first, Firebase Storage fallback.
          url = await dataApi.uploadProductImage(productId, file)
        } catch (uploadErr) {
          // Only fall back to an inline data URL in the local (non-Firebase)
          // dev environment, never in production.
          if (dataApi.isLocal) {
            url = await fileToDataUrl(file)
          } else {
            throw uploadErr
          }
        }
        if (url) next.push({ url, alt: '', order: next.length })
      }
      onChange(next)
    } catch (err) {
      onError?.(err.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i))
  const makeMain = (i) => {
    const chosen = images[i]
    onChange([chosen, ...images.filter((_, idx) => idx !== i)])
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-plum-700 bg-plum-800">
            <img src={img.url} alt={img.alt || 'Product image'} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-plum-600 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase text-ivory">
                Main
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-plum-950/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 && (
                <button type="button" onClick={() => makeMain(i)} className="rounded px-1 text-[0.6rem] text-plum-200 hover:text-ivory" title="Set as main">
                  Main
                </button>
              )}
              <button type="button" onClick={() => remove(i)} className="rounded px-1 text-[0.6rem] text-red-300 hover:text-red-200" title="Remove image">
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-plum-600 text-plum-400 hover:border-plum-400 hover:text-ivory disabled:opacity-60"
        >
          {uploading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-plum-400 border-t-ivory" />
          ) : (
            <>
              <ImagePlus size={20} strokeWidth={1.6} />
              <span className="text-[0.6rem]">Add image</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
      />
      <p className="mt-2 text-[0.65rem] text-plum-500">
        Images upload to Cloudflare R2 (falling back to Firebase Storage). The first image is the main product image.
      </p>
    </div>
  )
}

// ── Product editor modal ──────────────────────────────────────────────────────
function ProductEditor({ initial, collections, existingIds, onClose, onSaved }) {
  const isNew = !initial?.id
  const [draft, setDraft] = useState(() => ({
    id: initial?.id || '',
    name: initial?.name || '',
    slug: initial?.slug || '',
    productType: initial?.productType || 'cake',
    purchaseType: initial?.purchaseType || 'configurable',
    price: initial?.price ?? '',
    stock: initial?.stock ?? '',
    trackStock: initial?.trackStock !== false,
    active: initial?.active !== false,
    available: initial?.available !== false,
    displayOrder: initial?.displayOrder ?? 0,
    paletteKey: initial?.paletteKey || 'garden',
    summary: initial?.summary || '',
    description: initial?.description || '',
    collectionSlugs: initial?.collectionSlugs || (initial?.collectionSlug ? [initial.collectionSlug] : []),
    images: initial ? productImages(initial).map((url, i) => ({ url, alt: '', order: i })) : [],
    variants: Array.isArray(initial?.variants) ? initial.variants.map((v) => ({ ...v })) : [],
    flavours: (initial?.config?.flavours || []).join('\n'),
    fillings: (initial?.config?.fillings || []).join('\n'),
  }))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const slug = draft.slug || slugify(draft.name)
  const productId = draft.id || slug

  const isCake = draft.productType === 'cake'
  const effectivePurchaseType = isCake ? draft.purchaseType : 'simple'

  const toggleCollection = (collectionSlug) => {
    setDraft((d) => ({
      ...d,
      collectionSlugs: d.collectionSlugs.includes(collectionSlug)
        ? d.collectionSlugs.filter((s) => s !== collectionSlug)
        : [...d.collectionSlugs, collectionSlug],
    }))
  }

  const save = async (e) => {
    e.preventDefault()
    setErr('')
    const name = draft.name.trim()
    if (!name) { setErr('Product name is required.'); return }
    if (!productId) { setErr('Product slug is required.'); return }
    const price = Number(draft.price)
    const stock = parseInt(draft.stock, 10)
    if (!Number.isFinite(price) || price < 0) { setErr('Enter a valid price.'); return }
    if (!Number.isFinite(stock) || stock < 0) { setErr('Enter a valid stock number.'); return }
    if (isNew && existingIds.includes(productId)) {
      setErr(`A product with the slug "${productId}" already exists. Choose a different name or slug.`)
      return
    }

    const variants = isCake && draft.purchaseType === 'configurable'
      ? normalizeVariants(draft.variants)
      : []
    if (isCake && draft.purchaseType === 'configurable' && draft.variants.length > 0 && variants.length === 0) {
      setErr('Each size variation needs a label and a valid price.')
      return
    }

    const primaryCollection = collections.find((c) => c.slug === draft.collectionSlugs[0])
    const config = {
      flavours: draft.flavours.split('\n').map((s) => s.trim()).filter(Boolean),
      fillings: draft.fillings.split('\n').map((s) => s.trim()).filter(Boolean),
    }

    const payload = {
      id: productId,
      slug: slug || productId,
      name,
      productType: draft.productType,
      purchaseType: effectivePurchaseType,
      price,
      stock,
      trackStock: draft.trackStock,
      active: draft.active,
      available: draft.available,
      archived: draft.active === false,
      displayOrder: Number(draft.displayOrder) || 0,
      paletteKey: draft.paletteKey,
      summary: draft.summary,
      description: draft.description,
      collectionSlugs: draft.collectionSlugs,
      collectionSlug: draft.collectionSlugs[0] || '',
      collectionName: primaryCollection?.name || '',
      images: draft.images.map((img, i) => ({ url: img.url, alt: img.alt || name, order: i })),
      image: draft.images[0]?.url || '',
      imageUrl: draft.images[0]?.url || '',
      variants,
      tiered: variants.length > 0,
      config,
    }

    setSaving(true)
    try {
      if (isNew) await dataApi.addProduct(payload)
      else await dataApi.updateProduct(initial.id, payload)
      onSaved()
    } catch (e2) {
      setErr(e2.message || 'Could not save the product.')
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory placeholder:text-plum-600 focus:border-plum-400 focus:outline-none'
  const label = 'mb-1 block text-xs text-plum-400'

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <form onSubmit={save} className="relative z-10 my-8 w-full max-w-3xl rounded-2xl border border-plum-700 bg-plum-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-plum-400">{isNew ? 'New product' : 'Edit product'}</p>
            <h2 className="mt-1 font-display text-2xl font-medium text-ivory">{isNew ? 'Add product' : draft.name}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-full text-plum-400 hover:bg-plum-800 hover:text-ivory" aria-label="Close">
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Images */}
          <div>
            <p className={label}>Product images</p>
            <ImageManager
              productId={productId || 'new-product'}
              images={draft.images}
              onChange={(images) => set({ images })}
              onError={setErr}
            />
          </div>

          {/* Basics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Product name *</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value
                  setDraft((d) => ({ ...d, name, slug: isNew ? slugify(name) : d.slug }))
                }}
                placeholder="e.g. Vanilla Slice"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Slug / URL *</label>
              <input type="text" value={draft.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} placeholder="vanilla-slice" className={field} />
              <p className="mt-1 text-[0.65rem] text-plum-500">Product URL: /cakes/{slug || '…'}</p>
            </div>
            <div>
              <label className={label}>Product type *</label>
              <select
                value={draft.productType}
                onChange={(e) => {
                  const productType = e.target.value
                  set({ productType, purchaseType: productType === 'cake' ? (draft.purchaseType === 'simple' ? 'configurable' : draft.purchaseType) : 'simple' })
                }}
                className={field}
              >
                {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className={label}>Purchase behaviour *</label>
              <select
                value={effectivePurchaseType}
                onChange={(e) => set({ purchaseType: e.target.value })}
                disabled={!isCake}
                className={`${field} disabled:opacity-60`}
              >
                {purchaseTypeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {!isCake && <p className="mt-1 text-[0.65rem] text-plum-500">Slices and loaves are always simple quantity purchases.</p>}
            </div>
            <div>
              <label className={label}>Palette / artwork</label>
              <select value={draft.paletteKey} onChange={(e) => set({ paletteKey: e.target.value })} className={field}>
                {PALETTES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className={label}>Price (₦) *</label>
              <input type="number" min="0" step="1" value={draft.price} onChange={(e) => set({ price: e.target.value })} placeholder="8000" className={field} />
            </div>
            <div>
              <label className={label}>Stock *</label>
              <input type="number" min="0" step="1" value={draft.stock} onChange={(e) => set({ stock: e.target.value })} placeholder="10" className={field} />
            </div>
            <div>
              <label className={label}>Display order</label>
              <input type="number" step="1" value={draft.displayOrder} onChange={(e) => set({ displayOrder: e.target.value })} className={field} />
              <p className="mt-1 text-[0.65rem] text-plum-500">Lower numbers appear first.</p>
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-xs text-plum-300">
                <input type="checkbox" checked={draft.trackStock} onChange={(e) => set({ trackStock: e.target.checked })} className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500" />
                Track stock for this product
              </label>
              <label className="flex items-center gap-2 text-xs text-plum-300">
                <input type="checkbox" checked={draft.available} onChange={(e) => set({ available: e.target.checked })} className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500" />
                Available to purchase
              </label>
            </div>
          </div>

          {/* Collections */}
          <div>
            <p className={label}>Collections</p>
            {collections.length === 0 ? (
              <p className="text-xs text-plum-500">No collections yet — create one under Collections.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <label key={c.slug} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${draft.collectionSlugs.includes(c.slug) ? 'border-plum-500 bg-plum-700/50 text-ivory' : 'border-plum-700 text-plum-300 hover:border-plum-500'}`}>
                    <input type="checkbox" checked={draft.collectionSlugs.includes(c.slug)} onChange={() => toggleCollection(c.slug)} className="sr-only" />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className={label}>Short summary</label>
              <input type="text" value={draft.summary} onChange={(e) => set({ summary: e.target.value })} placeholder="One-line description shown on product cards" className={field} />
            </div>
            <div>
              <label className={label}>Full description</label>
              <textarea rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder="The longer story shown on the product page" className={field} />
            </div>
          </div>

          {/* Options */}
          {isCake && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Sponge flavours (one per line)</label>
                <textarea rows={4} value={draft.flavours} onChange={(e) => set({ flavours: e.target.value })} placeholder="Vanilla bean & mascarpone&#10;Lemon & elderflower" className={field} />
                <p className="mt-1 text-[0.65rem] text-plum-500">Leave blank to use the default flavour list.</p>
              </div>
              <div>
                <label className={label}>Fillings (one per line)</label>
                <textarea rows={4} value={draft.fillings} onChange={(e) => set({ fillings: e.target.value })} placeholder="Vanilla buttercream&#10;Chocolate ganache" className={field} />
                <p className="mt-1 text-[0.65rem] text-plum-500">Leave blank to use the default filling list.</p>
              </div>
            </div>
          )}

          {/* Variants for configurable cakes */}
          {isCake && draft.purchaseType === 'configurable' && (
            <VariantsEditor value={draft.variants} onChange={(variants) => set({ variants })} basePrice={Number(draft.price) || 0} />
          )}

          {/* Publish */}
          <label className="flex items-center gap-2 text-xs text-plum-300">
            <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500" />
            Published — visible on the storefront
          </label>

          {err && <p role="alert" className="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-300">{err}</p>}

          <div className="flex items-center gap-3 border-t border-plum-800 pt-4">
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
              <Save size={14} strokeWidth={2} />
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </button>
            <button type="button" onClick={onClose} disabled={saving} className="rounded-full border border-plum-700 px-5 py-2 text-sm text-plum-300 hover:text-ivory disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminInventory() {
  const [products, setProducts] = useState(null)
  const [collections, setCollections] = useState([])
  const [editor, setEditor] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    dataApi.getInventory().then(setProducts).catch(() => setProducts([]))
    dataApi.getCollections().then((list) => setCollections(list || [])).catch(() => setCollections([]))
  }

  useEffect(() => {
    load()
    const unsub = dataApi.subscribe?.(load) || (() => {})
    return () => unsub()
  }, [])

  const existingIds = useMemo(() => (products || []).map((p) => p.id), [products])

  const seedInventory = async () => {
    if (!window.confirm(`This will add ${cakes.length} products from the catalogue. Existing products are skipped. Continue?`)) return
    setSeeding(true)
    setSeedMsg('')
    try {
      const result = await dataApi.seedInventory(cakes)
      setSeedMsg(`✓ Added ${result.added}, skipped ${result.skipped} existing.`)
      load()
    } catch (e) {
      setSeedMsg(`Error: ${e.message}`)
    } finally {
      setSeeding(false)
    }
  }

  const toggleActive = async (product) => {
    setBusyId(product.id)
    try {
      await dataApi.updateProduct(product.id, { active: !product.active })
      setProducts((prev) => prev ? prev.map((p) => p.id === product.id ? { ...p, active: !p.active } : p) : prev)
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const archive = async (product) => {
    if (!window.confirm(`Archive "${product.name}"? It will be hidden from the storefront but kept in your records.`)) return
    setBusyId(product.id)
    try {
      await dataApi.archiveProduct(product.id)
      setProducts((prev) => prev ? prev.map((p) => p.id === product.id ? { ...p, active: false, archived: true } : p) : prev)
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (product) => {
    if (!window.confirm(`Permanently delete "${product.name}"? This cannot be undone.`)) return
    setBusyId(product.id)
    try {
      await dataApi.deleteProduct(product.id)
      setProducts((prev) => prev ? prev.filter((p) => p.id !== product.id) : prev)
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const counts = (products || []).reduce((acc, p) => {
    const t = p.productType || 'cake'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const active = products?.filter((p) => p.active !== false).length ?? 0
  const outOfStock = products?.filter((p) => (p.stock ?? 0) <= 0).length ?? 0

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ivory">Products</h1>
          <p className="mt-1 text-sm text-plum-400">
            {products
              ? `${products.length} products · ${active} published · ${outOfStock} out of stock · ${counts['cake'] || 0} cakes · ${counts['cake-slice'] || 0} slices · ${counts['cake-loaf'] || 0} loaves`
              : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={seedInventory}
              disabled={seeding}
              className="flex items-center gap-2 rounded-full border border-plum-700 px-4 py-2 text-xs font-medium text-plum-300 hover:border-plum-500 hover:text-ivory disabled:opacity-60"
            >
              <RefreshCw size={13} strokeWidth={2} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding…' : 'Seed from catalogue'}
            </button>
            <button
              type="button"
              onClick={() => setEditor({})}
              className="flex items-center gap-2 rounded-full bg-plum-500 px-4 py-2 text-xs font-medium text-ivory hover:bg-plum-400"
            >
              <Plus size={14} strokeWidth={2} />
              Add product
            </button>
          </div>
          {seedMsg && <p className="text-xs text-emerald-400">{seedMsg}</p>}
        </div>
      </div>

      {products === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-plum-900 py-12 text-center">
          <Package size={32} strokeWidth={1.5} className="mx-auto text-plum-500" />
          <p className="mt-3 text-plum-400">No products yet.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={seedInventory} disabled={seeding} className="rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
              {seeding ? 'Seeding…' : 'Seed from catalogue'}
            </button>
            <button onClick={() => setEditor({})} className="rounded-full border border-plum-700 px-5 py-2 text-sm text-plum-300 hover:text-ivory">
              Add manually
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-plum-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800 bg-plum-900">
                {['Product', 'Type', 'Purchase', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-plum-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-plum-900">
              {products.map((p) => {
                const main = productMainImage(p)
                return (
                  <tr key={p.id} className={`border-b border-plum-800 ${p.active === false ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-plum-800">
                          {main ? (
                            <img src={main} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <PlaceholderArt seed={`cake-${p.slug}`} palette={getPalette(p.paletteKey || 'garden')} className="h-full w-full" label={p.name} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ivory">{p.name}</p>
                          <p className="truncate text-xs text-plum-400">{p.collectionName || (p.collectionSlugs || []).join(', ') || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TypeBadge productType={p.productType} /></td>
                    <td className="px-4 py-3"><PurchaseBadge purchaseType={p.purchaseType} /></td>
                    <td className="px-4 py-3">
                      <span className="text-ivory">{money(p.price)}</span>
                      {Array.isArray(p.variants) && p.variants.length > 0 && (
                        <p className="mt-0.5 text-[0.65rem] text-plum-400">
                          {p.variants.length} sizes · from {money(Math.min(...p.variants.map((v) => Number(v.price) || 0)))}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${p.stock <= 0 ? 'text-red-400' : p.stock <= 3 ? 'text-amber-400' : 'text-ivory'}`}>
                        {p.trackStock === false ? '—' : p.stock}
                        {p.trackStock !== false && p.stock <= 3 && p.stock > 0 && <AlertTriangle size={13} className="ml-1 inline text-amber-400" />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.active !== false ? 'bg-emerald-900/40 text-emerald-300' : 'bg-plum-800 text-plum-400'}`}>
                          {p.active !== false ? 'Published' : 'Hidden'}
                        </span>
                        {p.available === false && (
                          <span className="rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-300">Unavailable</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditor(p)}
                          className="flex items-center gap-1 rounded-full border border-plum-700 px-2.5 py-1.5 text-xs text-plum-300 hover:text-ivory"
                        >
                          <Pencil size={12} strokeWidth={2} /> Edit
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          disabled={busyId === p.id}
                          title={p.active !== false ? 'Hide from store' : 'Publish'}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:text-ivory disabled:opacity-60"
                        >
                          {p.active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => archive(p)}
                          disabled={busyId === p.id || p.archived === true}
                          title="Archive product"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:text-amber-300 disabled:opacity-40"
                        >
                          <Archive size={13} />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          title="Delete product"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:border-red-700 hover:text-red-300 disabled:opacity-60"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-plum-500">
        Products are the single source of truth for the storefront. Archive hides a product while keeping it for
        historical orders. Images upload to real storage — the first image is used as the main product image.
      </p>

      {editor && (
        <ProductEditor
          initial={editor.id ? editor : null}
          collections={collections}
          existingIds={existingIds}
          onClose={() => setEditor(null)}
          onSaved={() => { setEditor(null); load() }}
        />
      )}
    </div>
  )
}
