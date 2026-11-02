import { useEffect, useState } from 'react'
import { Check, Trash2, ExternalLink, MessageSquare } from 'lucide-react'
import { dataApi } from '../../services/db.js'

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminComments() {
  const [comments, setComments] = useState(null)
  const [filter, setFilter] = useState('pending') // 'pending' | 'approved' | 'all'
  const [busy, setBusy] = useState(null)

  const load = () =>
    dataApi.getAllComments()
      .then(setComments)
      .catch(() => setComments([]))

  useEffect(() => { load() }, [])

  const filtered = (comments || []).filter((c) => {
    if (filter === 'pending') return !c.approved
    if (filter === 'approved') return c.approved
    return true
  })

  const approve = async (id, approved) => {
    setBusy(id)
    try {
      await dataApi.approveComment(id, approved)
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, approved } : c))
    } catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return
    setBusy(id)
    try {
      await dataApi.deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  const pending = (comments || []).filter((c) => !c.approved).length

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-ivory">Comments</h1>
        <p className="mt-1 text-sm text-plum-400">
          {comments
            ? `${comments.length} total · ${pending} pending approval`
            : 'Loading…'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2">
        {[
          { value: 'pending', label: `Pending (${(comments || []).filter((c) => !c.approved).length})` },
          { value: 'approved', label: `Approved (${(comments || []).filter((c) => c.approved).length})` },
          { value: 'all', label: `All (${(comments || []).length})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value ? 'bg-plum-500 text-ivory' : 'border border-plum-700 text-plum-300 hover:text-ivory'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {comments === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-plum-800 bg-plum-900 py-16 text-center">
          <MessageSquare size={32} strokeWidth={1.3} className="mx-auto mb-3 text-plum-600" />
          <p className="text-plum-400">
            {filter === 'pending' ? 'No comments pending approval.' : 'No comments here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`rounded-2xl border bg-plum-900 p-5 ${
                c.approved ? 'border-plum-800' : 'border-amber-700/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Comment info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-medium text-ivory">{c.name}</span>
                    <span className="text-plum-500 text-xs">{c.email}</span>
                    <span className="text-plum-600 text-xs">·</span>
                    <span className="text-xs text-plum-400">{timeAgo(c.createdAt)}</span>
                    {!c.approved && (
                      <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-300">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-plum-200 text-sm leading-relaxed">{c.body}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <a
                      href={`/journal/${c.postSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-plum-400 hover:text-ivory"
                    >
                      <ExternalLink size={11} strokeWidth={2} />
                      {c.postSlug}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!c.approved ? (
                    <button
                      onClick={() => approve(c.id, true)}
                      disabled={busy === c.id}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-medium text-ivory hover:bg-emerald-600 disabled:opacity-60"
                      title="Approve"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => approve(c.id, false)}
                      disabled={busy === c.id}
                      className="rounded-full border border-plum-700 px-3 py-1.5 text-xs text-plum-300 hover:text-ivory disabled:opacity-60"
                      title="Unapprove"
                    >
                      Unapprove
                    </button>
                  )}
                  <button
                    onClick={() => remove(c.id)}
                    disabled={busy === c.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-red-400 hover:border-red-700 hover:text-red-300 disabled:opacity-60"
                    title="Delete"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-plum-500">
        All new comments require your approval before appearing on the site. Pending comments are shown here first.
      </p>
    </div>
  )
}
