import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Tag } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import Reveal from '../components/Reveal.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import { journal, categories, allTags } from '../data/journal.js'
import { dataApi } from '../services/db.js'

// ---- helpers ---------------------------------------------------------------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const PALETTE_MAP = { garden: 'garden', painterly: 'painterly', quiet: 'quiet', sculptural: 'sculptural' }

// ---- ArticleCard -----------------------------------------------------------
function ArticleCard({ article, large = false, index = 0 }) {
  const palette = PALETTE_MAP[article.paletteKey] || 'garden'
  return (
    <Reveal delay={index * 80}>
      <Link to={`/journal/${article.slug}`} className="group flex flex-col">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-cream">
          <OptimizedImage
            seed={`journal-${article.slug}`}
            paletteKey={palette}
            alt={`${article.title} — editorial illustration`}
            aspect={large ? '16 / 9' : '3 / 2'}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-col flex-1">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-plum-600">{article.categoryLabel}</span>
            <span className="text-stone-light text-[0.7rem]">·</span>
            <span className="text-[0.7rem] uppercase tracking-[0.14em] text-stone-light">
              {article.readTime}
            </span>
          </div>

          <h2
            className={`mt-3 font-display font-medium leading-tight text-ink transition-colors group-hover:text-plum-600 ${
              large ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
            }`}
          >
            {article.title}
          </h2>

          <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-stone md:text-base">
            {article.excerpt}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <time className="text-xs text-stone-light" dateTime={article.date}>
              {formatDate(article.date)}
            </time>
            <span className="link-underline inline-flex items-center gap-1.5 text-sm font-medium text-plum-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Read <ArrowRight size={14} strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

// ---- FeaturedHero ----------------------------------------------------------
function FeaturedHero({ article }) {
  const palette = PALETTE_MAP[article.paletteKey] || 'garden'
  return (
    <Reveal>
      <Link to={`/journal/${article.slug}`} className="group grid items-stretch gap-0 overflow-hidden rounded-3xl bg-ink md:grid-cols-2">
        {/* Image side */}
        <div className="relative overflow-hidden">
          <OptimizedImage
            seed={`journal-${article.slug}`}
            paletteKey={palette}
            alt={`${article.title} — editorial illustration`}
            aspect="4 / 3"
            className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-ink/20" />
        </div>

        {/* Text side */}
        <div className="flex flex-col justify-center bg-plum-900 p-8 md:p-12">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-plum-700 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-plum-200">
              Featured
            </span>
            <span className="eyebrow text-plum-400">{article.categoryLabel}</span>
          </div>

          <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ivory transition-colors group-hover:text-honey-400 md:text-4xl">
            {article.title}
          </h2>

          <p className="mt-5 text-pretty leading-relaxed text-plum-200">
            {article.excerpt}
          </p>

          <div className="mt-8 flex items-center justify-between">
            <time className="text-xs text-plum-400" dateTime={article.date}>
              {formatDate(article.date)}
            </time>
            <span className="flex items-center gap-2 text-sm font-medium text-honey-400 transition-gap group-hover:gap-3">
              Read the article
              <ArrowRight size={16} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

// ---- Page ------------------------------------------------------------------
export default function Journal() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTag, setActiveTag] = useState(null)
  // Seed with static data so SSG/prerender works; replace with live Firestore posts after hydration.
  const [posts, setPosts] = useState(journal)

  useEffect(() => {
    dataApi.getPosts(false)
      .then((live) => {
        if (live && live.length > 0) {
          // Merge: live Firestore posts + static posts not yet in Firestore
          const liveSlugs = new Set(live.map((p) => p.slug))
          const staticOnly = journal.filter((a) => !liveSlugs.has(a.slug))
          setPosts([...live, ...staticOnly].sort((a, b) => (b.date || '').localeCompare(a.date || '')))
        }
      })
      .catch(() => {}) // fail silently — static data stays
  }, [])

  const featured = posts.find((a) => a.featured) || posts[0]

  const filtered = useMemo(() => {
    return posts.filter((a) => {
      if (a.slug === featured?.slug && activeCategory === 'all' && !activeTag) return false
      const matchCat = activeCategory === 'all' || a.category === activeCategory
      const matchTag = !activeTag || (a.tags || []).includes(activeTag)
      return matchCat && matchTag
    })
  }, [posts, activeCategory, activeTag, featured?.slug])

  return (
    <>
      <SEO
        title="Blog"
        description="Guides and notes from the Purple Bee Cakes studio — practical advice on flavours, planning timelines, design directions, and what to expect when commissioning a bespoke cake."
        canonicalPath="/journal"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/journal' },
        ])]}
      />

      {/* Page header */}
      <section className="relative overflow-hidden bg-ivory pt-32 pb-10 md:pt-40 md:pb-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-plum-100/50 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="eyebrow">Notes from the studio</p>
            <h1 className="mt-5 font-display text-[2.6rem] font-medium leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
              Blog
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-stone">
              Practical guides and considered perspectives on flavour, design, planning and the craft of celebration cakes — written to be genuinely useful before you order.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured hero */}
      <section className="bg-ivory pb-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <FeaturedHero article={featured} />
        </div>
      </section>

      {/* Category filter + tag sidebar layout */}
      <section className="section-y bg-ivory pt-14">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12">

            {/* Main column */}
            <div className="lg:col-span-8">
              {/* Category tabs */}
              <div
                className="flex flex-wrap gap-2 border-b border-line pb-5"
                role="tablist"
                aria-label="Filter by category"
              >
                <button
                  role="tab"
                  aria-selected={activeCategory === 'all'}
                  onClick={() => { setActiveCategory('all'); setActiveTag(null) }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === 'all' && !activeTag
                      ? 'bg-plum-600 text-ivory'
                      : 'border border-line text-ink hover:border-plum-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    role="tab"
                    aria-selected={activeCategory === cat.slug}
                    onClick={() => { setActiveCategory(cat.slug); setActiveTag(null) }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeCategory === cat.slug
                        ? 'bg-plum-600 text-ivory'
                        : 'border border-line text-ink hover:border-plum-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Active tag indicator */}
              {activeTag && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-stone">Filtered by:</span>
                  <button
                    onClick={() => setActiveTag(null)}
                    className="flex items-center gap-1.5 rounded-full bg-plum-100 px-3 py-1 text-xs font-medium text-plum-700 hover:bg-plum-200"
                  >
                    <Tag size={11} strokeWidth={2} />
                    {activeTag}
                    <span className="ml-1 text-plum-400">×</span>
                  </button>
                </div>
              )}

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="py-16 text-center text-stone">
                  No articles in this category yet.{' '}
                  <button
                    onClick={() => { setActiveCategory('all'); setActiveTag(null) }}
                    className="text-plum-600 underline"
                  >
                    Show all
                  </button>
                </div>
              ) : (
                <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2">
                  {filtered.map((article, i) => (
                    <ArticleCard key={article.slug} article={article} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-10">
                {/* Tag cloud */}
                <div>
                  <p className="eyebrow mb-4">Browse by topic</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setActiveTag(activeTag === tag ? null : tag)
                          setActiveCategory('all')
                        }}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeTag === tag
                            ? 'bg-plum-600 text-ivory'
                            : 'border border-line text-stone hover:border-plum-300 hover:text-plum-600'
                        }`}
                      >
                        <Tag size={10} strokeWidth={2} />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All articles list (quick nav) */}
                <div>
                  <p className="eyebrow mb-4">All articles</p>
                  <ul className="space-y-3">
                    {posts.map((a) => (
                      <li key={a.slug}>
                        <Link
                          to={`/journal/${a.slug}`}
                          className="group flex items-start gap-3 text-sm"
                        >
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-plum-300 transition-colors group-hover:bg-plum-600" />
                          <span className="text-stone transition-colors group-hover:text-ink">
                            {a.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Newsletter / enquiry CTA */}
                <div className="rounded-2xl bg-plum-900 p-6 text-ivory">
                  <p className="eyebrow text-plum-300">Order a cake</p>
                  <h3 className="mt-3 font-display text-xl font-medium text-ivory">
                    Ready to start?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-plum-200">
                    Tell us about your occasion and we'll design something around your day.
                  </p>
                  <Link to="/enquiry" className="btn mt-5 w-full bg-ivory text-plum-700 hover:bg-plum-50">
                    Enquire now
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  )
}
