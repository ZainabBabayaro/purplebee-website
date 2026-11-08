import { useEffect, useRef, useState } from 'react'
import { Camera, Plus, Save, Eye, EyeOff, AlertTriangle, ImagePlus, RefreshCw, Layers, X } from 'lucide-react'
import { dataApi } from '../../services/db.js'
import PlaceholderArt from '../../components/PlaceholderArt.jsx'
import { getPalette } from '../../utils/images.js'
import { cakes, buildTierVariants } from '../../data/cakes.js'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// Product type tag — matches the frontend ProductTypeTag component colours
function TypeBadge({ productType }) {
  const styles = {
    'cake':       'bg-plum-700/60 text-plum-200',
    'cake-slice': 'bg-amber-900/40 text-amber-300',
    'cake-loaf':  'bg-plum-800 text-plum-400',
  }
  const labels = {
    'cake':       'Cake',
    'cake-slice': 'Slice',
    'cake-loaf':  'Loaf',
  }
  const type = productType || 'cake'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${styles[type] || styles['cake']}`}>
      {labels[type] || type}
    </span>
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ImagePicker({ value, onChange }) {
  const inputRef = useRef(null)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { alert('Max image size is 5 MB.'); return }
    const b64 = await fileToBase64(file)
    onChange(b64)
    e.target.value = ''
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-16 w-16 cursor-pointer overflow-hidden rounded-xl border border-plum-700 bg-plum-800"
        onClick={() => inputRef.current?.click()}
        title="Click to upload image"
      >
        {value ? (
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-plum-500">
            <ImagePlus size={22} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-plum-400 hover:text-ivory">
        {value ? 'Change' : 'Add image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// Clean up variants before saving: drop blank rows and coerce prices.
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


function ImageCell({ product, onImageSaved }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(product.image || product.imageUrl || null)
  const [err, setErr] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Images only.'); return }
    if (file.size > 5 * 1024 * 1024) { setErr('Max 5 MB.'); return }
    setErr('')
    setUploading(true)
    try {
      const b64 = await fileToBase64(file)
      await dataApi.updateProduct(product.id, { image: b64, imageUrl: b64 })
      setPreview(b64)
      onImageSaved?.(product.id, b64)
    } catch (e) { setErr(e.message || 'Upload failed.') }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div className="relative h-12 w-12 shrink-0">
      <div className="h-12 w-12 overflow-hidden rounded-lg bg-plum-800">
        {preview ? (
          <img src={preview} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderArt seed={`cake-${product.slug}`} palette={getPalette(product.paletteKey || 'garden')} className="h-full w-full" label={product.name} />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-plum-900/70">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-plum-400 border-t-ivory" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload image"
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-plum-500 text-ivory shadow hover:bg-plum-400 disabled:opacity-50"
      >
        <Camera size={10} strokeWidth={2.5} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
      {err && <p className="absolute left-0 top-14 z-10 whitespace-nowrap rounded bg-red-900 px-2 py-0.5 text-[0.6rem] text-red-200">{err}</p>}
    </div>
  )
}

// Product type options for the select field
const PRODUCT_TYPES = [
  { value: 'cake',       label: 'Cake (full celebration cake)' },
  { value: 'cake-slice', label: 'Cake Slice (individual slice)' },
  { value: 'cake-loaf',  label: 'Cake Loaf (loaf cake)' },
]

function ProductRow({ product: initial, onImageSaved, onEditVariants }) {
  const [p, setP] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ price: initial.price, stock: initial.stock, productType: initial.productType || 'cake' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const toggleActive = async () => {
    setSaving(true)
    try {
      await dataApi.updateProduct(p.id, { active: !p.active })
      setP((v) => ({ ...v, active: !v.active }))
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const save = async () => {
    const price = parseFloat(draft.price)
    const stock = parseInt(draft.stock, 10)
    if (Number.isNaN(price) || price < 0) { setErr('Enter a valid price.'); return }
    if (Number.isNaN(stock) || stock < 0) { setErr('Enter a valid stock number.'); return }
    setErr('')
    setSaving(true)
    try {
      await dataApi.updateProduct(p.id, { price, stock, productType: draft.productType })
      setP((v) => ({ ...v, price, stock, productType: draft.productType }))
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <tr className={`border-b border-plum-800 ${!p.active ? 'opacity-50' : ''}`}>
      {/* Product */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageCell product={p} onImageSaved={(id, url) => { setP((v) => ({ ...v, image: url })); onImageSaved?.(id, url) }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ivory truncate">{p.name}</p>
              <TypeBadge productType={p.productType} />
            </div>
            <p className="text-xs text-plum-400 truncate">{p.collectionName}</p>
          </div>
        </div>
      </td>

      {/* Type — editable */}
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={draft.productType}
            onChange={(e) => setDraft((d) => ({ ...d, productType: e.target.value }))}
            className="rounded-lg border border-plum-600 bg-plum-900 px-2 py-1 text-xs text-ivory focus:border-plum-400 focus:outline-none"
          >
            {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        ) : (
          <TypeBadge productType={p.productType} />
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center">
            <span className="mr-1 text-plum-400">₦</span>
            <input type="number" min="0" step="1" value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} className="w-24 rounded-lg border border-plum-600 bg-plum-900 px-2 py-1 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
          </div>
        ) : (
          <div>
            <span className="text-ivory">{money(p.price)}</span>
            {Array.isArray(p.variants) && p.variants.length > 0 && (
              <p className="mt-0.5 text-[0.65rem] text-plum-400">{p.variants.length} sizes · from {money(Math.min(...p.variants.map((v) => Number(v.price) || 0)))}</p>
            )}
          </div>
        )}
      </td>

      {/* Stock */}
      <td className="px-4 py-3">
        {editing ? (
          <input type="number" min="0" step="1" value={draft.stock} onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))} className="w-20 rounded-lg border border-plum-600 bg-plum-900 px-2 py-1 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
        ) : (
          <span className={`text-sm ${p.stock <= 0 ? 'text-red-400' : p.stock <= 3 ? 'text-amber-400' : 'text-ivory'}`}>
            {p.stock}
            {p.stock <= 3 && p.stock > 0 && <AlertTriangle size={13} className="ml-1 inline text-amber-400" />}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-plum-800 text-plum-400'}`}>
          {p.active ? 'Active' : 'Hidden'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        {err && <p className="mb-1 text-xs text-red-400">{err}</p>}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-plum-500 px-3 py-1.5 text-xs font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
                <Save size={13} strokeWidth={2} />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setDraft({ price: p.price, stock: p.stock, productType: p.productType || 'cake' }); setErr('') }} className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setDraft({ price: p.price, stock: p.stock, productType: p.productType || 'cake' }); setEditing(true) }} className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory">
                {saved ? '✓ Saved' : 'Edit'}
              </button>
              {(p.productType || 'cake') === 'cake' && (
                <button
                  onClick={() => onEditVariants?.(p)}
                  title="Edit size variations"
                  className="flex items-center gap-1 rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory"
                >
                  <Layers size={12} strokeWidth={2} />
                  Sizes
                </button>
              )}
              <button onClick={toggleActive} disabled={saving} title={p.active ? 'Hide from store' : 'Show in store'} className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:text-ivory disabled:opacity-60">
                {p.active ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function AdminInventory() {
  const [products, setProducts] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', productType: 'cake', collectionName: '', occasion: '', summary: '', tiered: false })
  const [formVariants, setFormVariants] = useState([])
  const [formImage, setFormImage] = useState('')
  const [adding, setAdding] = useState(false)
  const [addErr, setAddErr] = useState('')
  const [addSaved, setAddSaved] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  // Size-variation editor modal (edit existing product)
  const [variantsFor, setVariantsFor] = useState(null)
  const [variantDraft, setVariantDraft] = useState([])
  const [variantSaving, setVariantSaving] = useState(false)
  const [variantErr, setVariantErr] = useState('')

  // Seed Firestore from the static cakes.js catalogue
  const seedInventory = async () => {
    if (!window.confirm(`This will add ${cakes.length} products from cakes.js to Firestore. Products that already exist will be skipped. Continue?`)) return
    setSeeding(true)
    setSeedMsg('')
    let added = 0, skipped = 0
    try {
      for (const cake of cakes) {
        try {
          await dataApi.addProduct({
            id: cake.slug,
            name: cake.name,
            slug: cake.slug,
            productType: cake.productType || 'cake',
            price: cake.price,
            stock: cake.stock,
            active: true,
            image: cake.image || '',
            imageUrl: cake.image || '',
            collectionSlug: cake.collectionSlug,
            collectionName: cake.collectionName,
            occasion: cake.occasion,
            summary: cake.summary,
            description: cake.description,
            paletteKey: cake.paletteKey,
            tiered: !!cake.tiered,
            variants: cake.variants || [],
          })
          added++
        } catch {
          skipped++ // already exists
        }
      }
      setSeedMsg(`✓ Added ${added}, skipped ${skipped} existing.`)
      dataApi.getInventory().then(setProducts).catch(() => {})
    } catch (e) {
      setSeedMsg(`Error: ${e.message}`)
    } finally {
      setSeeding(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddErr('')
    setAddSaved(false)
    const name = form.name.trim()
    const price = parseFloat(form.price)
    const stock = parseInt(form.stock, 10)
    if (!name) { setAddErr('Product name is required.'); return }
    if (Number.isNaN(price) || price < 0) { setAddErr('Enter a valid price.'); return }
    if (Number.isNaN(stock) || stock < 0) { setAddErr('Enter a valid stock number.'); return }

    const variants = form.productType === 'cake' && form.tiered
      ? normalizeVariants(formVariants)
      : []
    if (form.productType === 'cake' && form.tiered && variants.length === 0) {
      setAddErr('Add at least one size variation with a label and price, or turn off tiered cake.')
      return
    }

    setAdding(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      await dataApi.addProduct({
        name, slug, price, stock,
        productType: form.productType,
        collectionName: form.collectionName || '',
        occasion: form.occasion || '',
        summary: form.summary || '',
        description: '',
        paletteKey: 'garden',
        active: true,
        image: formImage || '',
        imageUrl: formImage || '',
        tiered: variants.length > 0,
        variants,
      })
      setForm({ name: '', price: '', stock: '', productType: 'cake', collectionName: '', occasion: '', summary: '', tiered: false })
      setFormVariants([])
      setFormImage('')
      setAddSaved(true)
      setTimeout(() => setAddSaved(false), 3000)
      dataApi.getInventory().then(setProducts).catch(() => {})
    } catch (e) {
      setAddErr(e.message || 'Failed to add product.')
    } finally {
      setAdding(false)
    }
  }

  useEffect(() => {
    dataApi.getInventory().then(setProducts).catch(() => setProducts([]))
    const unsub = dataApi.subscribe?.(() => { dataApi.getInventory().then(setProducts).catch(() => {}) }) || (() => {})
    return () => unsub()
  }, [])

  const handleImageSaved = (id, url) => {
    setProducts((prev) => prev ? prev.map((p) => p.id === id ? { ...p, image: url, imageUrl: url } : p) : prev)
  }

  // ---- Size variations modal ----
  const openVariants = (product) => {
    setVariantsFor(product)
    setVariantDraft((product.variants || []).map((v) => ({ ...v })))
    setVariantErr('')
  }

  const saveVariants = async () => {
    const normalized = normalizeVariants(variantDraft)
    if (variantDraft.length > 0 && normalized.length === 0) {
      setVariantErr('Each size needs a label and a valid price.')
      return
    }
    setVariantSaving(true)
    setVariantErr('')
    try {
      await dataApi.updateProduct(variantsFor.id, {
        variants: normalized,
        tiered: normalized.length > 0,
      })
      setProducts((prev) => prev
        ? prev.map((p) => p.id === variantsFor.id ? { ...p, variants: normalized, tiered: normalized.length > 0 } : p)
        : prev)
      setVariantsFor(null)
    } catch (e) {
      setVariantErr(e.message || 'Could not save size variations.')
    } finally {
      setVariantSaving(false)
    }
  }

  // Counts by type
  const counts = (products || []).reduce((acc, p) => {
    const t = p.productType || 'cake'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const active = products?.filter((p) => p.active).length ?? 0
  const outOfStock = products?.filter((p) => p.stock <= 0).length ?? 0

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ivory">Inventory</h1>
          <p className="mt-1 text-sm text-plum-400">
            {products
              ? `${products.length} products · ${active} active · ${outOfStock} out of stock · ${counts['cake'] || 0} cakes · ${counts['cake-slice'] || 0} slices · ${counts['cake-loaf'] || 0} loaves`
              : 'Loading…'}
          </p>
        </div>
        {/* Seed button — populates Firestore from cakes.js */}
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={seedInventory}
            disabled={seeding}
            className="flex items-center gap-2 rounded-full border border-plum-700 px-4 py-2 text-xs font-medium text-plum-300 hover:border-plum-500 hover:text-ivory disabled:opacity-60"
          >
            <RefreshCw size={13} strokeWidth={2} className={seeding ? 'animate-spin' : ''} />
            {seeding ? 'Seeding…' : 'Seed from catalogue'}
          </button>
          {seedMsg && <p className="text-xs text-emerald-400">{seedMsg}</p>}
        </div>
      </div>

      {/* ── Add product form ── */}
      <div className="mb-6 rounded-2xl border border-plum-800 bg-plum-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} strokeWidth={1.7} className="text-plum-300" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-ivory">Add product</h2>
        </div>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            {/* Image */}
            <div className="shrink-0">
              <label className="mb-1 block text-xs text-plum-400">Image</label>
              <ImagePicker value={formImage} onChange={setFormImage} />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="col-span-2 md:col-span-2">
                <label className="mb-1 block text-xs text-plum-400">Product name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Vanilla Slice" className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-plum-400">Product type *</label>
                <select value={form.productType} onChange={(e) => {
                  const productType = e.target.value
                  setForm((d) => ({ ...d, productType, tiered: productType === 'cake' ? d.tiered : false }))
                }} className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none">
                  {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-plum-400">Price (₦) *</label>
                <input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm((d) => ({ ...d, price: e.target.value }))} placeholder="8000" className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-plum-400">Stock *</label>
                <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm((d) => ({ ...d, stock: e.target.value }))} placeholder="10" className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-plum-400">Collection</label>
                <input type="text" value={form.collectionName} onChange={(e) => setForm((d) => ({ ...d, collectionName: e.target.value }))} placeholder="Slices & Loaves" className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="mb-1 block text-xs text-plum-400">Short description</label>
                <input type="text" value={form.summary} onChange={(e) => setForm((d) => ({ ...d, summary: e.target.value }))} placeholder="One-line description shown on product cards" className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
              </div>
            </div>
          </div>

          {form.productType === 'cake' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-plum-300">
                <input
                  type="checkbox"
                  checked={form.tiered}
                  onChange={(e) => {
                    const tiered = e.target.checked
                    setForm((d) => ({ ...d, tiered }))
                    if (tiered && formVariants.length === 0) {
                      setFormVariants(buildTierVariants(Number(form.price) || 0))
                    }
                  }}
                  className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500 focus:ring-plum-500"
                />
                Tiered cake — offer size variations with individual prices
              </label>
              {form.tiered && (
                <VariantsEditor
                  value={formVariants}
                  onChange={setFormVariants}
                  basePrice={Number(form.price) || 0}
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={adding} className="rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
              {adding ? 'Adding…' : 'Add product'}
            </button>
            {addErr && <p className="text-xs text-red-400">{addErr}</p>}
            {addSaved && <p className="text-xs text-emerald-400">Product added ✓</p>}
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      {products === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-plum-900 py-12 text-center">
          <p className="text-plum-400 mb-4">No products in inventory yet.</p>
          <button onClick={seedInventory} disabled={seeding} className="rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
            {seeding ? 'Seeding…' : 'Seed from product catalogue'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-plum-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800 bg-plum-900">
                {['Product', 'Type', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-plum-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-plum-900">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onImageSaved={handleImageSaved}
                  onEditVariants={openVariants}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-plum-500">
        "Seed from catalogue" imports all products from the codebase. Use "Edit" to update type, price and stock.
        Use "Sizes" on a cake to create tier variations. Click the <Camera size={11} strokeWidth={2} className="inline" /> icon to update a product image.
      </p>

      {/* ── Size variations modal ── */}
      {variantsFor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !variantSaving && setVariantsFor(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-plum-700 bg-plum-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-plum-400">Size variations</p>
                <h2 className="mt-1 font-display text-xl font-medium text-ivory">{variantsFor.name}</h2>
                <p className="mt-1 text-xs text-plum-400">
                  Add the tier combinations customers can choose. Each size has its own price.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantsFor(null)}
                disabled={variantSaving}
                className="flex h-8 w-8 items-center justify-center rounded-full text-plum-400 hover:bg-plum-800 hover:text-ivory"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>

            <VariantsEditor
              value={variantDraft}
              onChange={setVariantDraft}
              basePrice={variantsFor.price}
            />

            {variantErr && <p className="mt-3 text-xs text-red-400">{variantErr}</p>}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={saveVariants}
                disabled={variantSaving}
                className="flex items-center gap-1.5 rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
              >
                <Save size={14} strokeWidth={2} />
                {variantSaving ? 'Saving…' : 'Save sizes'}
              </button>
              <button
                type="button"
                onClick={() => setVariantsFor(null)}
                disabled={variantSaving}
                className="rounded-full border border-plum-700 px-5 py-2 text-sm text-plum-300 hover:text-ivory disabled:opacity-60"
              >
                Cancel
              </button>
              <p className="ml-auto text-xs text-plum-500">
                Leave empty to use single-tier sizes instead.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
