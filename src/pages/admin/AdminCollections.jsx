import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Save, Pencil, Trash2, RefreshCw, Eye, EyeOff, X, ArrowUp, ArrowDown,
  ImagePlus, FolderPlus,
} from 'lucide-react'
import { dataApi } from '../../services/db.js'
import PlaceholderArt from '../../components/PlaceholderArt.jsx'
import { getPalette } from '../../utils/images.js'
import { productMainImage, normalizeProduct } from '../../data/cakes.js'

const PALETTES = ['garden', 'painterly', 'quiet', 'sculptural']

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function BannerUpload({ value, onChange, onError }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { onError?.('Please choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { onError?.('Max image size is 5 MB.'); return }
    setUploading(true)
    onError?.('')
    try {
      const url = await dataApi.uploadProductImage(`collection-${Date.now()}`, file)
      onChange(url)
    } catch (err) {
      onError?.(err.message || 'Banner upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-20 w-32 overflow-hidden rounded-xl border border-plum-700 bg-plum-800">
          {value ? (
            <img src={value} alt="Collection banner preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-plum-500">
              <ImagePlus size={22} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:border-plum-500 hover:text-ivory disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : value ? 'Change banner' : 'Add banner'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-left text-xs text-red-300 hover:text-red-200">
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function CollectionEditor({ initial, products, onClose, onSaved }) {
  const isNew = !initial?.id
  const [draft, setDraft] = useState(() => ({
    id: initial?.id || '',
    name: initial?.name || '',
    slug: initial?.slug || '',
    subtitle: initial?.subtitle || '',
    description: initial?.description || '',
    intro: initial?.intro || '',
    occasions: (initial?.occasions || []).join(', '),
    paletteKey: initial?.paletteKey || 'quiet',
    icon: initial?.icon || '◇',
    bannerImage: initial?.bannerImage || '',
    visible: initial?.visible !== false,
    published: initial?.published !== false,
    displayOrder: initial?.displayOrder ?? 0,
    productIds: initial?.productIds || [],
  }))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const slug = draft.slug || slugify(draft.name)
  const collectionId = draft.id || slug

  const assigned = useMemo(
    () => draft.productIds.map((id) => products.find((p) => p.id === id || p.slug === id)).filter(Boolean),
    [draft.productIds, products],
  )
  const unassigned = useMemo(
    () => products.filter((p) => !draft.productIds.includes(p.id) && !draft.productIds.includes(p.slug)),
    [products, draft.productIds],
  )

  const addProduct = (id) => set({ productIds: [...draft.productIds, id] })
  const removeProduct = (id) => set({ productIds: draft.productIds.filter((x) => x !== id) })
  const move = (index, dir) => {
    const next = [...draft.productIds]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    set({ productIds: next })
  }

  const save = async (e) => {
    e.preventDefault()
    setErr('')
    const name = draft.name.trim()
    if (!name) { setErr('Collection name is required.'); return }
    if (!collectionId) { setErr('Collection slug is required.'); return }

    const payload = {
      id: collectionId,
      slug: slug || collectionId,
      name,
      subtitle: draft.subtitle,
      description: draft.description,
      intro: draft.intro,
      occasions: draft.occasions.split(',').map((s) => s.trim()).filter(Boolean),
      paletteKey: draft.paletteKey,
      icon: draft.icon,
      bannerImage: draft.bannerImage,
      visible: draft.visible,
      published: draft.published,
      displayOrder: Number(draft.displayOrder) || 0,
      productIds: draft.productIds,
    }

    setSaving(true)
    try {
      if (isNew) await dataApi.addCollection(payload)
      else await dataApi.updateCollection(initial.id, payload)

      // Keep product-side membership in sync so the storefront and admin agree.
      const newSlug = payload.slug
      const oldSlug = initial?.slug
      for (const p of products) {
        const shouldInclude = draft.productIds.includes(p.id) || draft.productIds.includes(p.slug)
        const current = Array.isArray(p.collectionSlugs) ? p.collectionSlugs : []
        let next = current.filter((s) => s !== oldSlug && s !== newSlug)
        if (shouldInclude) next.push(newSlug)
        if (next.length !== current.length || next.some((s, i) => s !== current[i])) {
          await dataApi.updateProduct(p.id, {
            collectionSlugs: next,
            collectionSlug: next[0] || '',
          })
        }
      }

      onSaved()
    } catch (e2) {
      setErr(e2.message || 'Could not save the collection.')
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
            <p className="text-xs uppercase tracking-wide text-plum-400">{isNew ? 'New collection' : 'Edit collection'}</p>
            <h2 className="mt-1 font-display text-2xl font-medium text-ivory">{isNew ? 'Create collection' : draft.name}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-full text-plum-400 hover:bg-plum-800 hover:text-ivory" aria-label="Close">
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className={label}>Banner image</p>
            <BannerUpload value={draft.bannerImage} onChange={(bannerImage) => set({ bannerImage })} onError={setErr} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Collection name *</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value
                  setDraft((d) => ({ ...d, name, slug: isNew ? slugify(name) : d.slug }))
                }}
                placeholder="e.g. Celebration Cakes"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Slug / URL *</label>
              <input type="text" value={draft.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} className={field} />
              <p className="mt-1 text-[0.65rem] text-plum-500">URL: /collections/{slug || '…'}</p>
            </div>
            <div>
              <label className={label}>Display order</label>
              <input type="number" step="1" value={draft.displayOrder} onChange={(e) => set({ displayOrder: e.target.value })} className={field} />
            </div>
            <div>
              <label className={label}>Subtitle</label>
              <input type="text" value={draft.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder="For every milestone worth making unforgettable." className={field} />
            </div>
            <div>
              <label className={label}>Palette / artwork</label>
              <select value={draft.paletteKey} onChange={(e) => set({ paletteKey: e.target.value })} className={field}>
                {PALETTES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Icon</label>
              <input type="text" value={draft.icon} onChange={(e) => set({ icon: e.target.value })} maxLength={4} className={field} />
            </div>
            <div>
              <label className={label}>Occasions (comma separated)</label>
              <input type="text" value={draft.occasions} onChange={(e) => set({ occasions: e.target.value })} placeholder="Birthdays, Anniversaries" className={field} />
            </div>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Intro line</label>
            <input type="text" value={draft.intro} onChange={(e) => set({ intro: e.target.value })} className={field} />
          </div>

          {/* Products */}
          <div className="rounded-xl border border-plum-700 bg-plum-950/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-plum-300">Products in this collection</p>
            <p className="mt-0.5 text-[0.65rem] text-plum-500">Order controls how products appear on the collection page.</p>

            {assigned.length === 0 ? (
              <p className="mt-3 text-xs text-plum-400">No products assigned yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {assigned.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-lg bg-plum-900 px-3 py-2">
                    <span className="w-5 text-center text-[0.65rem] text-plum-500">{i + 1}</span>
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-plum-800">
                      {productMainImage(p) ? (
                        <img src={productMainImage(p)} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <PlaceholderArt seed={`cake-${p.slug}`} palette={getPalette(p.paletteKey)} className="h-full w-full" label={p.name} />
                      )}
                    </div>
                    <span className="flex-1 truncate text-sm text-ivory">{p.name}</span>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-plum-400 hover:text-ivory disabled:opacity-30" aria-label={`Move ${p.name} up`}>
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === assigned.length - 1} className="text-plum-400 hover:text-ivory disabled:opacity-30" aria-label={`Move ${p.name} down`}>
                      <ArrowDown size={14} />
                    </button>
                    <button type="button" onClick={() => removeProduct(p.id)} className="text-red-300 hover:text-red-200" aria-label={`Remove ${p.name}`}>
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {unassigned.length > 0 && (
              <div className="mt-4">
                <p className="text-[0.65rem] uppercase tracking-wide text-plum-500">Add products</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unassigned.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p.id)}
                      className="flex items-center gap-1 rounded-full border border-plum-700 px-3 py-1 text-xs text-plum-300 hover:border-plum-500 hover:text-ivory"
                    >
                      <Plus size={11} /> {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs text-plum-300">
              <input type="checkbox" checked={draft.published} onChange={(e) => set({ published: e.target.checked })} className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500" />
              Published
            </label>
            <label className="flex items-center gap-2 text-xs text-plum-300">
              <input type="checkbox" checked={draft.visible} onChange={(e) => set({ visible: e.target.checked })} className="h-4 w-4 rounded border-plum-600 bg-plum-950 text-plum-500" />
              Visible on storefront
            </label>
          </div>

          {err && <p role="alert" className="rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-300">{err}</p>}

          <div className="flex items-center gap-3 border-t border-plum-800 pt-4">
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
              <Save size={14} strokeWidth={2} />
              {saving ? 'Saving…' : isNew ? 'Create collection' : 'Save changes'}
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

export default function AdminCollections() {
  const [collections, setCollections] = useState(null)
  const [products, setProducts] = useState([])
  const [editor, setEditor] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    dataApi.getCollections().then(setCollections).catch(() => setCollections([]))
    dataApi.getInventory().then((list) => setProducts((list || []).map(normalizeProduct))).catch(() => setProducts([]))
  }

  useEffect(() => {
    load()
    const unsub = dataApi.subscribe?.(load) || (() => {})
    return () => unsub()
  }, [])

  const seed = async () => {
    if (!window.confirm('Add the default collections from the catalogue? Existing collections are skipped.')) return
    setSeeding(true)
    setSeedMsg('')
    try {
      const result = await dataApi.seedCollections()
      setSeedMsg(`✓ Added ${result.added}, skipped ${result.skipped} existing.`)
      load()
    } catch (e) {
      setSeedMsg(`Error: ${e.message}`)
    } finally {
      setSeeding(false)
    }
  }

  const toggleVisible = async (collection) => {
    setBusyId(collection.id)
    try {
      await dataApi.updateCollection(collection.id, { visible: collection.visible === false, published: collection.visible === false })
      setCollections((prev) => prev ? prev.map((c) => c.id === collection.id ? { ...c, visible: c.visible === false, published: c.visible === false } : c) : prev)
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (collection) => {
    if (!window.confirm(`Delete the "${collection.name}" collection? Products stay in the catalogue but lose this grouping.`)) return
    setBusyId(collection.id)
    try {
      await dataApi.deleteCollection(collection.id)
      // Remove membership from products.
      for (const p of products) {
        if ((p.collectionSlugs || []).includes(collection.slug)) {
          const next = p.collectionSlugs.filter((s) => s !== collection.slug)
          await dataApi.updateProduct(p.id, { collectionSlugs: next, collectionSlug: next[0] || '' })
        }
      }
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ivory">Collections</h1>
          <p className="mt-1 text-sm text-plum-400">
            {collections ? `${collections.length} collection${collections.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={seed}
              disabled={seeding}
              className="flex items-center gap-2 rounded-full border border-plum-700 px-4 py-2 text-xs font-medium text-plum-300 hover:border-plum-500 hover:text-ivory disabled:opacity-60"
            >
              <RefreshCw size={13} strokeWidth={2} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding…' : 'Seed collections'}
            </button>
            <button
              type="button"
              onClick={() => setEditor({})}
              className="flex items-center gap-2 rounded-full bg-plum-500 px-4 py-2 text-xs font-medium text-ivory hover:bg-plum-400"
            >
              <Plus size={14} strokeWidth={2} />
              New collection
            </button>
          </div>
          {seedMsg && <p className="text-xs text-emerald-400">{seedMsg}</p>}
        </div>
      </div>

      {collections === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl bg-plum-900 py-12 text-center">
          <FolderPlus size={32} strokeWidth={1.5} className="mx-auto text-plum-500" />
          <p className="mt-3 text-plum-400">No collections yet.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={seed} disabled={seeding} className="rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60">
              {seeding ? 'Seeding…' : 'Seed collections'}
            </button>
            <button onClick={() => setEditor({})} className="rounded-full border border-plum-700 px-5 py-2 text-sm text-plum-300 hover:text-ivory">
              Create manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <div key={c.id} className={`overflow-hidden rounded-2xl border border-plum-800 bg-plum-900 ${c.visible === false ? 'opacity-60' : ''}`}>
              <div className="h-28 overflow-hidden bg-plum-800">
                {c.bannerImage ? (
                  <img src={c.bannerImage} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <PlaceholderArt seed={`collection-${c.slug}`} palette={getPalette(c.paletteKey)} className="h-full w-full" label={c.name} />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-medium text-ivory">{c.name}</h2>
                    <p className="truncate text-xs text-plum-400">{c.subtitle || '—'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${c.visible !== false ? 'bg-emerald-900/40 text-emerald-300' : 'bg-plum-800 text-plum-400'}`}>
                    {c.visible !== false ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-plum-400">
                  {(c.productIds || []).length} product{(c.productIds || []).length !== 1 ? 's' : ''} · order {c.displayOrder ?? 0}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <button onClick={() => setEditor(c)} className="flex items-center gap-1 rounded-full border border-plum-700 px-2.5 py-1.5 text-xs text-plum-300 hover:text-ivory">
                    <Pencil size={12} strokeWidth={2} /> Edit
                  </button>
                  <button onClick={() => toggleVisible(c)} disabled={busyId === c.id} title={c.visible !== false ? 'Hide collection' : 'Show collection'} className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:text-ivory disabled:opacity-60">
                    {c.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => remove(c)} disabled={busyId === c.id} title="Delete collection" className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-400 hover:border-red-700 hover:text-red-300 disabled:opacity-60">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-plum-500">
        Collections control how products are grouped on the storefront. Reorder products inside a collection to
        control their display order.
      </p>

      {editor && (
        <CollectionEditor
          initial={editor.id ? editor : null}
          products={products}
          onClose={() => setEditor(null)}
          onSaved={() => { setEditor(null); load() }}
        />
      )}
    </div>
  )
}
