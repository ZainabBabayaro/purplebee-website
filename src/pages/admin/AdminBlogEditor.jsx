import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Eye
} from 'lucide-react'
import { dataApi } from '../../services/db.js'
import { categories } from '../../data/journal.js'

// ── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function estimateReadTime(body) {
  const words = body
    .flatMap((b) => {
      if (b.text) return b.text.split(/\s+/)
      if (b.items) return b.items.flatMap((i) => i.split(/\s+/))
      if (b.rows) return b.rows.flat().flatMap((c) => c.split(/\s+/))
      return []
    })
    .filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// ── Block type definitions ────────────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: 'p',         label: 'Paragraph' },
  { type: 'h2',        label: 'Heading 2' },
  { type: 'h3',        label: 'Heading 3' },
  { type: 'pullquote', label: 'Pull quote' },
  { type: 'tip',       label: 'Tip box' },
  { type: 'list',      label: 'Bullet list' },
  { type: 'table',     label: 'Table' },
  { type: 'divider',   label: 'Divider' },
]

function newBlock(type) {
  switch (type) {
    case 'list':    return { type, items: [''] }
    case 'table':   return { type, head: ['Column 1', 'Column 2'], rows: [['', '']] }
    case 'divider': return { type }
    default:        return { type, text: '' }
  }
}

// ── Block editor components ───────────────────────────────────────────────────
const inputCls = 'w-full rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm text-ivory placeholder:text-plum-600 focus:border-plum-400 focus:outline-none'
const labelCls = 'mb-1 block text-xs font-medium text-plum-400'

function BlockEditor({ block, onChange }) {
  const update = (patch) => onChange({ ...block, ...patch })

  switch (block.type) {
    case 'p':
    case 'h2':
    case 'h3':
    case 'pullquote':
    case 'tip':
      return (
        <div>
          <label className={labelCls}>
            {{ p: 'Paragraph', h2: 'Heading 2', h3: 'Heading 3', pullquote: 'Pull quote', tip: 'Tip box' }[block.type]}
          </label>
          <textarea
            value={block.text || ''}
            onChange={(e) => update({ text: e.target.value })}
            rows={block.type === 'p' ? 4 : 2}
            placeholder={block.type === 'h2' ? 'Section heading…' : block.type === 'pullquote' ? 'A standout quote…' : block.type === 'tip' ? 'A helpful tip…' : 'Write here…'}
            className={`${inputCls} resize-y`}
          />
        </div>
      )

    case 'list':
      return (
        <div>
          <label className={labelCls}>Bullet list</label>
          {(block.items || ['']).map((item, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const items = [...block.items]
                  items[i] = e.target.value
                  update({ items })
                }}
                placeholder={`Item ${i + 1}`}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => update({ items: block.items.filter((_, j) => j !== i) })}
                className="shrink-0 text-plum-500 hover:text-red-400"
                aria-label="Remove item"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ items: [...(block.items || []), ''] })}
            className="mt-1 flex items-center gap-1 text-xs text-plum-400 hover:text-ivory"
          >
            <Plus size={12} strokeWidth={2} /> Add item
          </button>
        </div>
      )

    case 'table':
      return (
        <div>
          <label className={labelCls}>Table</label>
          {/* Column headers */}
          <div className="mb-2">
            <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-plum-500">Column headers</p>
            <div className="flex gap-2">
              {(block.head || []).map((h, i) => (
                <input
                  key={i}
                  value={h}
                  onChange={(e) => {
                    const head = [...block.head]
                    head[i] = e.target.value
                    update({ head })
                  }}
                  className={inputCls}
                  placeholder={`Column ${i + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  const head = [...(block.head || []), `Column ${(block.head || []).length + 1}`]
                  const rows = (block.rows || []).map((r) => [...r, ''])
                  update({ head, rows })
                }}
                className="shrink-0 text-xs text-plum-400 hover:text-ivory"
              >+ Col</button>
            </div>
          </div>
          {/* Rows */}
          <div>
            <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-plum-500">Rows</p>
            {(block.rows || []).map((row, ri) => (
              <div key={ri} className="mb-2 flex gap-2">
                {row.map((cell, ci) => (
                  <input
                    key={ci}
                    value={cell}
                    onChange={(e) => {
                      const rows = block.rows.map((r, r2) =>
                        r2 === ri ? r.map((c, c2) => c2 === ci ? e.target.value : c) : r
                      )
                      update({ rows })
                    }}
                    className={inputCls}
                    placeholder={block.head?.[ci] || `Col ${ci + 1}`}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => update({ rows: block.rows.filter((_, j) => j !== ri) })}
                  className="shrink-0 text-plum-500 hover:text-red-400"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update({ rows: [...(block.rows || []), (block.head || []).map(() => '')] })}
              className="mt-1 flex items-center gap-1 text-xs text-plum-400 hover:text-ivory"
            >
              <Plus size={12} strokeWidth={2} /> Add row
            </button>
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="flex items-center gap-3 py-2">
          <span className="h-px flex-1 bg-plum-700" />
          <span className="text-xs text-plum-500">✦ Divider</span>
          <span className="h-px flex-1 bg-plum-700" />
        </div>
      )

    default:
      return null
  }
}

// ── Palette options ───────────────────────────────────────────────────────────
const PALETTES = [
  { value: 'garden',     label: 'Garden (lilac + cream)' },
  { value: 'painterly',  label: 'Painterly (warm tones)' },
  { value: 'quiet',      label: 'Quiet (natural whites)' },
  { value: 'sculptural', label: 'Sculptural (dark + gold)' },
]

// ── Main editor page ──────────────────────────────────────────────────────────
export default function AdminBlogEditor() {
  const { slug: editSlug } = useParams()
  const navigate = useNavigate()
  const isNew = !editSlug

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'planning',
    categoryLabel: 'Planning',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    featured: false,
    published: false,
    tags: '',
    paletteKey: 'garden',
    body: [{ type: 'p', text: '' }],
  })
  const [slugLocked, setSlugLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)

  // Load existing post when editing.
  useEffect(() => {
    if (!isNew && editSlug) {
      dataApi.getPost(editSlug).then((post) => {
        if (post) {
          setForm({
            ...post,
            tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
          })
          setSlugLocked(true)
        }
      })
    }
  }, [editSlug, isNew])

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => {
      const next = { ...f, [k]: val }
      // Auto-generate slug from title until the user edits it manually.
      if (k === 'title' && !slugLocked) next.slug = toSlug(val)
      // Keep categoryLabel in sync with category.
      if (k === 'category') {
        const cat = categories.find((c) => c.slug === val)
        if (cat) next.categoryLabel = cat.label
      }
      // Auto-update read time when body changes.
      if (k === 'body') next.readTime = estimateReadTime(val)
      return next
    })
    setErr('')
  }

  // Body block operations
  const updateBlock = (i, updated) =>
    setForm((f) => ({ ...f, body: f.body.map((b, j) => j === i ? updated : b) }))

  const addBlock = (type) =>
    setForm((f) => ({ ...f, body: [...f.body, newBlock(type)] }))

  const removeBlock = (i) =>
    setForm((f) => ({ ...f, body: f.body.filter((_, j) => j !== i) }))

  const moveBlock = (i, dir) => {
    setForm((f) => {
      const body = [...f.body]
      const j = i + dir
      if (j < 0 || j >= body.length) return f
      ;[body[i], body[j]] = [body[j], body[i]]
      return { ...f, body }
    })
  }

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.slug.trim()) return 'Slug is required.'
    if (!form.excerpt.trim()) return 'Excerpt is required.'
    if (form.body.length === 0) return 'Add at least one content block.'
    return null
  }

  const save = async (publishNow = null) => {
    const validErr = validate()
    if (validErr) { setErr(validErr); return }
    setSaving(true)
    setErr('')
    try {
      const post = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: publishNow !== null ? publishNow : form.published,
      }
      if (isNew) {
        await dataApi.addPost(post)
      } else {
        await dataApi.updatePost(editSlug, post)
      }
      setSaved(true)
      setTimeout(() => navigate('/admin/blog'), 800)
    } catch (e) {
      setErr(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-2 text-sm text-plum-400 hover:text-ivory"
          >
            <ArrowLeft size={16} strokeWidth={2} /> All articles
          </button>
          <h1 className="font-display text-2xl font-medium text-ivory">
            {isNew ? 'New article' : 'Edit article'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-full border border-plum-700 px-4 py-2 text-sm text-plum-200 hover:text-ivory disabled:opacity-60"
          >
            <Save size={14} strokeWidth={2} />
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-plum-500 px-4 py-2 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
          >
            <Eye size={14} strokeWidth={2} />
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {err && (
        <p className="mb-6 rounded-xl bg-red-900/40 px-4 py-3 text-sm text-red-300">{err}</p>
      )}
      {saved && (
        <p className="mb-6 rounded-xl bg-emerald-900/40 px-4 py-3 text-sm text-emerald-300">
          Saved ✓ — redirecting…
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-12">

        {/* ── Main content ── */}
        <div className="space-y-6 lg:col-span-8">

          {/* Title */}
          <div className="rounded-2xl border border-plum-800 bg-plum-900 p-6">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                value={form.title}
                onChange={set('title')}
                placeholder="Your article title…"
                className={`${inputCls} text-base font-medium`}
              />
            </div>
            <div className="mt-4">
              <label className={labelCls}>
                URL slug *{' '}
                <span className="text-plum-500 font-normal">
                  — /journal/{form.slug || 'url-slug-here'}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true)
                    setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))
                  }}
                  placeholder="url-slug-here"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => { setSlugLocked(false); setForm((f) => ({ ...f, slug: toSlug(f.title) })) }}
                  className="shrink-0 rounded-lg border border-plum-700 px-3 py-2 text-xs text-plum-400 hover:text-ivory"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Excerpt * — shown on the blog index and in search results</label>
              <textarea
                value={form.excerpt}
                onChange={set('excerpt')}
                rows={3}
                placeholder="A 1–2 sentence summary of this article…"
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>

          {/* Body builder */}
          <div className="rounded-2xl border border-plum-800 bg-plum-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-ivory">
                Article content
              </h2>
              <span className="text-xs text-plum-500">{form.body.length} block{form.body.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-3">
              {form.body.map((block, i) => (
                <div key={i} className="group relative rounded-xl border border-plum-800 bg-plum-950 p-4">
                  {/* Block controls */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-plum-800 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-plum-300">
                      {BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(i, -1)}
                        disabled={i === 0}
                        className="flex h-6 w-6 items-center justify-center text-plum-500 hover:text-ivory disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(i, 1)}
                        disabled={i === form.body.length - 1}
                        className="flex h-6 w-6 items-center justify-center text-plum-500 hover:text-ivory disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(i)}
                        className="flex h-6 w-6 items-center justify-center text-plum-600 hover:text-red-400"
                        aria-label="Delete block"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <BlockEditor block={block} onChange={(updated) => updateBlock(i, updated)} />
                </div>
              ))}
            </div>

            {/* Add block */}
            <div className="mt-4">
              <p className="mb-2 text-xs text-plum-500">Add a block:</p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-1.5 rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:border-plum-500 hover:text-ivory transition-colors"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar settings ── */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-5">

            {/* Publish status */}
            <div className="rounded-2xl border border-plum-800 bg-plum-900 p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-plum-400">Status</p>
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.published}
                    onChange={set('published')}
                  />
                  <div className={`h-6 w-11 rounded-full transition-colors ${form.published ? 'bg-emerald-600' : 'bg-plum-700'}`} />
                  <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : ''}`} />
                </div>
                <span className={`text-sm font-medium ${form.published ? 'text-emerald-300' : 'text-plum-400'}`}>
                  {form.published ? 'Published' : 'Draft'}
                </span>
              </label>
              <label className="mt-4 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={set('featured')}
                  className="h-4 w-4 rounded accent-plum-500"
                />
                <span className="text-sm text-plum-200">Feature this article (hero post)</span>
              </label>
            </div>

            {/* Meta */}
            <div className="rounded-2xl border border-plum-800 bg-plum-900 p-5 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-plum-400">Article details</p>

              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className={`${inputCls} appearance-none`}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Publish date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={set('date')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Read time <span className="text-plum-600 font-normal">(auto-calculated)</span>
                </label>
                <input
                  value={form.readTime}
                  onChange={set('readTime')}
                  className={inputCls}
                  placeholder="5 min read"
                />
              </div>

              <div>
                <label className={labelCls}>
                  Tags <span className="text-plum-600 font-normal">(comma separated)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="planning, cakes, weddings"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Hero image style</label>
                <select
                  value={form.paletteKey}
                  onChange={set('paletteKey')}
                  className={`${inputCls} appearance-none`}
                >
                  {PALETTES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save actions (repeat for convenience) */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => save(true)}
                disabled={saving}
                className="w-full rounded-full bg-plum-500 py-2.5 text-sm font-medium text-ivory hover:bg-plum-400 disabled:opacity-60"
              >
                {saving ? 'Publishing…' : '↑ Publish now'}
              </button>
              <button
                type="button"
                onClick={() => save(false)}
                disabled={saving}
                className="w-full rounded-full border border-plum-700 py-2.5 text-sm text-plum-300 hover:text-ivory disabled:opacity-60"
              >
                Save as draft
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
