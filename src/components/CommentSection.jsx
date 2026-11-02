import { useEffect, useState } from 'react'
import { MessageSquare, Send, User } from 'lucide-react'
import { dataApi } from '../services/db.js'

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Single comment ────────────────────────────────────────────────────────────
function Comment({ comment }) {
  return (
    <div className="flex gap-4">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum-100 font-display text-sm font-medium text-plum-700">
        {getInitials(comment.name || '?')}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium text-ink">{comment.name}</span>
          <span className="text-xs text-stone-light">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1.5 text-pretty leading-relaxed text-stone">{comment.body}</p>
      </div>
    </div>
  )
}

// ── Comment form ──────────────────────────────────────────────────────────────
function CommentForm({ postSlug, onSubmitted }) {
  const [values, setValues] = useState({ name: '', email: '', body: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!values.name.trim()) e.name = 'Please add your name.'
    if (!values.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email.'
    if (!values.body.trim() || values.body.trim().length < 5) e.body = 'Please write your comment.'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await dataApi.addComment({
        postSlug,
        name: values.name.trim(),
        email: values.email.trim(), // stored but never shown publicly
        body: values.body.trim(),
      })
      setDone(true)
      onSubmitted?.()
    } catch (err) {
      setErrors({ body: err.message || 'Could not submit comment — please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const baseInput = 'w-full rounded-xl border border-line bg-ivory px-4 py-2.5 text-sm text-ink placeholder:text-stone-light focus:border-plum-400 focus:outline-none transition-colors'
  const errInput = 'border-red-400'

  if (done) {
    return (
      <div className="rounded-2xl border border-plum-200 bg-plum-50 px-5 py-5 text-center">
        <p className="font-medium text-plum-700">Thank you, {values.name.split(' ')[0]}!</p>
        <p className="mt-1 text-sm text-plum-500">
          Your comment has been submitted and will appear once approved.
        </p>
        <button
          type="button"
          onClick={() => { setDone(false); setValues({ name: '', email: '', body: '' }) }}
          className="mt-4 text-sm text-plum-600 underline"
        >
          Leave another comment
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-name" className="mb-1.5 block text-sm font-medium text-ink">
            Name <span className="text-plum-500" aria-hidden="true">*</span>
          </label>
          <input
            id="comment-name"
            value={values.name}
            onChange={set('name')}
            placeholder="Your name"
            autoComplete="name"
            className={`${baseInput} ${errors.name ? errInput : ''}`}
            aria-invalid={errors.name ? 'true' : undefined}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600" role="alert">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="comment-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email <span className="text-plum-500" aria-hidden="true">*</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="your@email.com"
            autoComplete="email"
            className={`${baseInput} ${errors.email ? errInput : ''}`}
            aria-invalid={errors.email ? 'true' : undefined}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600" role="alert">{errors.email}</p>}
          <p className="mt-1 text-xs text-stone-light">Your email is never shown publicly.</p>
        </div>
      </div>

      <div>
        <label htmlFor="comment-body" className="mb-1.5 block text-sm font-medium text-ink">
          Comment <span className="text-plum-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="comment-body"
          value={values.body}
          onChange={set('body')}
          rows={4}
          placeholder="Share your thoughts…"
          className={`${baseInput} resize-y ${errors.body ? errInput : ''}`}
          aria-invalid={errors.body ? 'true' : undefined}
        />
        {errors.body && <p className="mt-1 text-xs text-red-600" role="alert">{errors.body}</p>}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-plum-700 disabled:opacity-60"
      >
        <Send size={15} strokeWidth={1.8} />
        {busy ? 'Submitting…' : 'Submit comment'}
      </button>
    </form>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CommentSection({ postSlug }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    dataApi.getComments(postSlug, false)
      .then((list) => { setComments(list); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [postSlug])

  return (
    <section className="mt-16 border-t border-line pt-12">
      <h2 className="flex items-center gap-2.5 font-display text-2xl font-medium text-ink md:text-3xl">
        <MessageSquare size={24} strokeWidth={1.5} className="text-plum-400" />
        {comments.length > 0
          ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
          : 'Comments'}
      </h2>

      {/* Comment list */}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-stone">Be the first to share your thoughts.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {comments.map((c) => (
            <Comment key={c.id} comment={c} />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="my-10 h-px bg-line" />

      {/* Form */}
      <div>
        <h3 className="mb-6 font-display text-xl font-medium text-ink">Leave a comment</h3>
        <CommentForm postSlug={postSlug} onSubmitted={load} />
      </div>
    </section>
  )
}
