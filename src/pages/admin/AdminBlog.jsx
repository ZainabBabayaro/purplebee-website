import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { dataApi } from '../../services/db.js'
import { journal } from '../../data/journal.js'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function StatusPill({ published }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
      published
        ? 'bg-emerald-900/40 text-emerald-300'
        : 'bg-plum-800 text-plum-400'
    }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export default function AdminBlog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState(null)
  const [deleting, setDeleting] = useState(null) // slug being confirmed for delete
  const [busy, setBusy] = useState(false)

  // Merge Firestore/local posts with the static journal seed so existing
  // articles also appear in the list (admin can see everything).
  const load = async () => {
    try {
      const live = await dataApi.getPosts(true) // adminMode = all (incl. drafts)
      // Deduplicate: live posts take priority over static seed.
      const liveSlugs = new Set(live.map((p) => p.slug))
      const seed = journal.filter((a) => !liveSlugs.has(a.slug)).map((a) => ({
        ...a,
        published: true,
        source: 'static', // flag so we know it's from journal.js
      }))
      setPosts([...live, ...seed].sort((a, b) => (b.date || '').localeCompare(a.date || '')))
    } catch {
      setPosts([])
    }
  }

  useEffect(() => { load() }, [])

  const togglePublish = async (post) => {
    if (post.source === 'static') {
      alert('This article is from the static blog data file (src/data/journal.js). Edit it there to unpublish it, or create a new version via the editor.')
      return
    }
    setBusy(true)
    try {
      await dataApi.updatePost(post.slug, { published: !post.published })
      setPosts((prev) => prev.map((p) =>
        p.slug === post.slug ? { ...p, published: !p.published } : p
      ))
    } catch (e) { alert(e.message) }
    finally { setBusy(false) }
  }

  const deletePost = async (slug) => {
    setBusy(true)
    try {
      await dataApi.deletePost(slug)
      setPosts((prev) => prev.filter((p) => p.slug !== slug))
      setDeleting(null)
    } catch (e) { alert(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-full bg-plum-950 p-6 md:p-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ivory">Blog</h1>
          <p className="mt-1 text-sm text-plum-400">
            {posts ? `${posts.length} article${posts.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blog/new')}
          className="flex items-center gap-2 rounded-full bg-plum-500 px-4 py-2 text-sm font-medium text-ivory hover:bg-plum-400"
        >
          <Plus size={16} strokeWidth={2} />
          New article
        </button>
      </div>

      {posts === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-700 border-t-plum-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-plum-800 bg-plum-900 py-16 text-center">
          <p className="text-plum-400">No articles yet.</p>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="mt-4 rounded-full bg-plum-500 px-5 py-2 text-sm font-medium text-ivory hover:bg-plum-400"
          >
            Write your first article
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-plum-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-800 bg-plum-900">
                {['Title', 'Category', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-wide text-plum-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-800 bg-plum-900">
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-plum-800/40">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-ivory">{post.title}</p>
                      <p className="mt-0.5 text-xs text-plum-400">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-plum-200">{post.categoryLabel || post.category}</td>
                  <td className="px-5 py-3.5 text-plum-300">{formatDate(post.date)}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill published={post.published !== false} />
                    {post.source === 'static' && (
                      <span className="ml-2 text-[0.6rem] uppercase tracking-wide text-plum-500">static</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {deleting === post.slug ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-plum-300">Delete?</span>
                        <button
                          onClick={() => deletePost(post.slug)}
                          disabled={busy}
                          className="rounded-full bg-red-700 px-2.5 py-1 text-xs text-ivory hover:bg-red-600 disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleting(null)}
                          className="rounded-full border border-plum-700 px-2.5 py-1 text-xs text-plum-300 hover:text-ivory"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {/* Edit */}
                        {post.source !== 'static' && (
                          <Link
                            to={`/admin/blog/${post.slug}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-300 hover:text-ivory"
                            title="Edit"
                          >
                            <Edit2 size={12} strokeWidth={2} />
                          </Link>
                        )}
                        {/* View live */}
                        <a
                          href={`/journal/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-300 hover:text-ivory"
                          title="View on site"
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                        </a>
                        {/* Publish toggle */}
                        {post.source !== 'static' && (
                          <button
                            onClick={() => togglePublish(post)}
                            disabled={busy}
                            title={post.published ? 'Unpublish' : 'Publish'}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-plum-300 hover:text-ivory disabled:opacity-50"
                          >
                            {post.published ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        )}
                        {/* Delete */}
                        {post.source !== 'static' && (
                          <button
                            onClick={() => setDeleting(post.slug)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-plum-700 text-red-400 hover:border-red-700 hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={12} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-plum-500">
        Articles marked <span className="text-plum-400">static</span> come from the built-in
        journal data file and can be viewed but not edited here. New articles you write are
        saved to Firestore and can be fully managed from this page.
      </p>
    </div>
  )
}
