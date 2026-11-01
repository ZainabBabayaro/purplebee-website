import { useEffect, useRef, useState } from 'react'
import { Camera, Plus, Save, Eye, EyeOff, AlertTriangle, X } from 'lucide-react'
import { dataApi } from '../../services/db.js'
import PlaceholderArt from '../../components/PlaceholderArt.jsx'
import { getPalette } from '../../utils/images.js'

function money(n) { return `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// ── Image upload cell ────────────────────────────────────────────────────────
function ImageCell({ product, onImageSaved }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(product.imageUrl || null)
  const [err, setErr] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type + size (max 5 MB)
    if (!file.type.startsWith('image/')) { setErr('Images only.'); return }
    if (file.size > 5 * 1024 * 1024) { setErr('Max 5 MB.'); return }

    setErr('')
    // Show instant local preview while uploading
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const savedUrl = await dataApi.uploadProductImage(product.id, file)
      setPreview(savedUrl)
      onImageSaved(product.id, savedUrl)
    } catch (e) {
      setErr(e.message || 'Upload failed.')
      setPreview(product.imageUrl || null)
    } finally {
      setUploading(false)
      // Reset so the same file can be re-selected if needed
      e.target.value = ''
    }
  }

  const removeImage = async () => {
    setPreview(null)
    await dataApi.updateProduct(product.id, { imageUrl: '' })
    onImageSaved(product.id, '')
  }

  return (
    <div className="relative h-14 w-14 shrink-0">
      {/* Thumbnail */}
      <div className="h-14 w-14 overflow-hidden rounded-lg bg-plum-800">
        {preview ? (
          <img
            src={preview}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <PlaceholderArt
            seed={`cake-${product.slug}`}
            palette={getPalette(product.paletteKey || 'garden')}
            className="h-full w-full"
            label={product.name}
          />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-plum-900/70">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-plum-400 border-t-ivory" />
          </div>
        )}
      </div>

      {/* Camera button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload image"
        className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-plum-500 text-ivory shadow hover:bg-plum-400 disabled:opacity-50"
      >
        <Camera size={10} strokeWidth={2.5} />
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />

      {/* Error */}
      {err && (
        <p className="absolute left-0 top-16 z-10 whitespace-nowrap rounded bg-red-900 px-2 py-0.5 text-[0.6rem] text-red-200">
          {err}
        </p>
      )}
    </div>
  )
}

// ── Product row ──────────────────────────────────────────────────────────────
function ProductRow({ product: initial, onImageSaved }) {
  const [p, setP] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ price: initial.price, stock: initial.stock })
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
      await dataApi.updateProduct(p.id, { price, stock })
      setP((v) => ({ ...v, price, stock }))
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const handleImageSaved = (id, url) => {
    setP((v) => ({ ...v, imageUrl: url }))
    onImageSaved?.(id, url)
  }

  return (
    <tr className={`border-b border-plum-800 ${!p.active ? 'opacity-50' : ''}`}>
      {/* Product col */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <ImageCell product={p} onImageSaved={handleImageSaved} />
          <div>
            <p className="font-medium text-ivory">{p.name}</p>
            <p className="text-xs text-plum-400">{p.collectionName} · {p.occasion}</p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-4">
        {editing ? (
          <div className="flex items-center">
            <span className="mr-1 text-plum-400">₦</span>
            <input
              type="number" min="0" step="0.01"
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              className="w-24 rounded-lg border border-plum-600 bg-plum-900 px-2 py-1 text-sm text-ivory focus:border-plum-400 focus:outline-none"
            />
          </div>
        ) : (
          <span className="text-ivory">{money(p.price)}</span>
        )}
      </td>

      {/* Stock */}
      <td className="px-4 py-4">
        {editing ? (
          <input
            type="number" min="0" step="1"
            value={draft.stock}
            onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
            className="w-20 rounded-lg border border-plum-600 bg-plum-900 px-2 py-1 text-sm text-ivory focus:border-plum-400 focus:outline-none"
          />
        ) : (
          <span className={`text-sm ${p.stock <= 0 ? 'text-red-400' : p.stock <= 3 ? 'text-amber-400' : 'text-ivory'}`}>
            {p.stock}
            {p.stock <= 3 && p.stock > 0 && <AlertTriangle size={13} className="ml-1 inline text-amber-400" />}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-plum-800 text-plum-400'}`}>
          {p.active ? 'Active' : 'Hidden'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        {err && <p className="mb-1 text-xs text-red-400">{err}</p>}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={save} disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-plum-500 px-3 py-1.5 text-xs font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
              >
                <Save size={13} strokeWidth={2} />
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setDraft({ price: p.price, stock: p.stock }); setErr('') }}
                className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setDraft({ price: p.price, stock: p.stock }); setEditing(true) }}
                className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory"
              >
                {saved ? '✓ Saved' : 'Edit'}
              </button>
              <button
                onClick={toggleActive} disabled={saving}
                title={p.active ? 'Hide from store' : 'Show in store'}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:text-ivory disabled:opacity-60"
              >
                {p.active ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminInventory() {
  const [products, setProducts] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '' })
  const [adding, setAdding] = useState(false)
  const [addErr, setAddErr] = useState('')
  const [addSaved, setAddSaved] = useState(false)

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
    setAdding(true)
    try {
      await dataApi.addProduct({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        price, stock, active: true,
        occasion: '', collectionName: '', summary: '',
        description: '', paletteKey: 'garden', imageUrl: '',
      })
      setForm({ name: '', price: '', stock: '' })
      setAddSaved(true)
      setTimeout(() => setAddSaved(false), 2500)
      dataApi.getInventory().then(setProducts).catch(() => {})
    } catch (e) {
      setAddErr(e.message || 'Failed to add product.')
    } finally {
      setAdding(false)
    }
  }

  useEffect(() => {
    dataApi.getInventory().then(setProducts).catch(() => setProducts([]))
    const unsub = dataApi.subscribe?.(() => {
      dataApi.getInventory().then(setProducts).catch(() => {})
    }) || (() => {})
    return () => unsub()
  }, [])

  // When an image is saved, update the local products list so the row re-renders.
  const handleImageSaved = (id, url) => {
    setProducts((prev) =>
      prev ? prev.map((p) => p.id === id ? { ...p, imageUrl: url } : p) : prev
    )
  }

  const active = products?.filter((p) => p.active).length ?? 0
  const outOfStock = products?.filter((p) => p.stock <= 0).length ?? 0

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ivory">Inventory</h1>
        <p className="mt-1 text-sm text-plum-400">
          {products
            ? `${products.length} products · ${active} active · ${outOfStock} out of stock`
            : 'Loading…'}
        </p>
      </div>

      {/* Add product */}
      <div className="mb-6 rounded-2xl border border-plum-800 bg-plum-900 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={18} strokeWidth={1.7} className="text-plum-300" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-ivory">Add product</h2>
        </div>
        <form onSubmit={handleAdd} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-plum-400">Product name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Iris"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-plum-400">Price (₦)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((d) => ({ ...d, price: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-plum-400">Stock</label>
            <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm((d) => ({ ...d, stock: e.target.value }))}
              placeholder="0"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={adding}
            className="rounded-full bg-plum-500 px-4 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
            {adding ? 'Adding…' : 'Add product'}
          </button>
          {addErr && <p className="col-span-full text-xs text-red-400">{addErr}</p>}
          {addSaved && <p className="col-span-full text-xs text-emerald-400">Product added ✓ — upload an image using the camera icon</p>}
        </form>
      </div>

      {/* Table */}
      {products === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-plum-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800 bg-plum-900">
                {['Product', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-plum-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-plum-900">
              {products.map((p) => (
                <ProductRow key={p.id} product={p} onImageSaved={handleImageSaved} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-xs text-plum-500">
        Click the <Camera size={11} strokeWidth={2} className="inline" /> camera icon on any product to upload a photo. Images are stored and shown live on the store immediately.
      </p>
    </div>
  )
}
