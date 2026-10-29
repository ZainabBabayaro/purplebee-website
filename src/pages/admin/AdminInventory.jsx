import { useEffect, useState } from 'react'
import { Plus, Save, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { dataApi } from '../../services/db.js'
import PlaceholderArt from '../../components/PlaceholderArt.jsx'
import { getPalette } from '../../utils/images.js'

function money(n) { return `£${Number(n).toFixed(2)}` }

function ProductRow({ product: initial }) {
  const [p, setP] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ price: initial.price, stock: initial.stock })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const toggleActive = async () => {
    const next = !p.active
    setSaving(true)
    try {
      await dataApi.updateProduct(p.id, { active: next })
      setP((v) => ({ ...v, active: next }))
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
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
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className={`border-b border-plum-800 ${!p.active ? 'opacity-50' : ''}`}>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-plum-800">
            <PlaceholderArt
              seed={`cake-${p.slug}`}
              palette={getPalette(p.paletteKey)}
              className="h-full w-full"
              label={p.name}
            />
          </div>
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
            <span className="mr-1 text-plum-400">£</span>
            <input
              type="number"
              min="0"
              step="0.01"
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
            type="number"
            min="0"
            step="1"
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
                onClick={save}
                disabled={saving}
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
                onClick={toggleActive}
                disabled={saving}
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
        price,
        stock,
        active: true,
        occasion: '',
        collectionName: '',
        summary: '',
        description: '',
        paletteKey: 'garden',
      })
      setForm({ name: '', price: '', stock: '' })
      setAddSaved(true)
      setTimeout(() => setAddSaved(false), 2500)
      // Refresh inventory list
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

      {/* ---- Add product form ---- */}
      <div className="mb-6 rounded-2xl border border-plum-800 bg-plum-900 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={18} strokeWidth={1.7} />
          <h2 className="text-sm font-medium text-ivory uppercase tracking-wide">Add product</h2>
        </div>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" noValidate>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-plum-400 mb-1">Product name</label>
            <input
              type="text"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Iris"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-xs text-plum-400 mb-1">Price (£)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((d) => ({ ...d, price: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-xs text-plum-400 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm((d) => ({ ...d, stock: e.target.value }))}
              placeholder="0"
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory focus:border-plum-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full md:w-auto rounded-full bg-plum-500 px-4 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add product'}
          </button>
          {addErr && <p className="col-span-full mt-2 text-xs text-red-400">{addErr}</p>}
          {addSaved && <p className="col-span-full mt-2 text-xs text-emerald-400">Added ✓</p>}
        </form>
      </div>

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
                <ProductRow key={p.id} product={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-8 text-xs text-plum-500">
        Changes to price and stock take effect immediately. Hiding a product removes it from the store without deleting data.
      </p>
    </div>
  )
}
