import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Link2, Twitter, Tag } from 'lucide-react'
import SEO, { articleLd, breadcrumbLd } from '../components/SEO.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import Reveal from '../components/Reveal.jsx'
import OptimizedImage from '../components/OptimizedImage.jsx'
import CTASection from '../components/CTASection.jsx'
import { getArticleBySlug, getRelatedArticles, journal } from '../data/journal.js'
import { site } from '../data/site.js'

// ── helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Reading progress bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed inset-x-0 top-0 z-[55] h-0.5 bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-plum-500 transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Table of contents ────────────────────────────────────────────────────────
function TableOfContents({ body }) {
  const headings = body.filter((b) => b.type === 'h2')
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (headings.length === 0) return
    const ids = headings.map((h) => slugify(h.text))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="hidden lg:block">
      <p className="eyebrow mb-4">In this article</p>
      <ol className="space-y-2">
        {headings.map((h) => {
          const id = slugify(h.text)
          const isActive = active === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`block border-l-2 py-1 pl-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'border-plum-500 text-plum-700 font-medium'
                    : 'border-transparent text-stone hover:border-plum-200 hover:text-ink'
                }`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ── Block renderer ────────────────────────────────────────────────────────────
function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          id={slugify(block.text)}
          className="mt-12 mb-4 scroll-mt-28 font-display text-2xl font-medium leading-snug text-ink md:text-3xl"
        >
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3
          id={slugify(block.text)}
          className="mt-8 mb-3 scroll-mt-28 font-display text-xl font-medium text-ink"
        >
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p className="my-5 text-pretty text-lg leading-[1.8] text-stone">
          {block.text}
        </p>
      )
    case 'pullquote':
      return (
        <blockquote className="my-10 border-l-4 border-plum-300 bg-plum-50 py-6 pl-7 pr-5 rounded-r-xl">
          <p className="font-display text-xl font-medium leading-snug text-plum-800 md:text-2xl">
            {block.text}
          </p>
        </blockquote>
      )
    case 'tip':
      return (
        <aside className="my-8 flex gap-4 rounded-2xl border border-honey-500/40 bg-honey-400/10 px-5 py-5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-honey-500 text-[0.7rem] font-bold text-ivory">
            ✦
          </span>
          <p className="text-pretty leading-relaxed text-ink">{block.text}</p>
        </aside>
      )
    case 'list':
      return (
        <ul className="my-6 space-y-3 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-stone">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-plum-400" />
              <span className="text-pretty leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="my-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-cream/60">
                {block.head.map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-ivory">
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-cream/40">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-5 py-3 ${j === 0 ? 'font-medium text-ink' : 'text-stone'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'divider':
      return (
        <div className="my-10 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="text-plum-300 text-xs">✦</span>
          <span className="h-px flex-1 bg-line" />
        </div>
      )
    default:
      return null
  }
}

// ── Share strip ──────────────────────────────────────────────────────────────
function ShareStrip({ title, slug }) {
  const [copied, setCopied] = useState(false)
  const url = `${site.url}/journal/${slug}`

  const copyLink = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-light">Share</p>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-stone hover:border-plum-300 hover:text-plum-600"
      >
        <Twitter size={13} strokeWidth={1.8} /> Twitter / X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-stone hover:border-plum-300 hover:text-plum-600"
      >
        <Link2 size={13} strokeWidth={1.8} />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

// ── Related card ─────────────────────────────────────────────────────────────
function RelatedCard({ article, index }) {
  return (
    <Reveal delay={index * 90}>
      <Link to={`/journal/${article.slug}`} className="group flex flex-col">
        <div className="overflow-hidden rounded-xl bg-cream">
          <OptimizedImage
            seed={`journal-${article.slug}`}
            paletteKey={article.paletteKey || 'garden'}
            alt={`${article.title} — editorial illustration`}
            aspect="3 / 2"
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="mt-4">
          <p className="eyebrow text-plum-600">{article.categoryLabel}</p>
          <h3 className="mt-2 font-display text-lg font-medium leading-snug text-ink transition-colors group-hover:text-plum-600 md:text-xl">
            {article.title}
          </h3>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-plum-600 opacity-0 transition-opacity group-hover:opacity-100">
            Read <ArrowRight size={14} strokeWidth={2} />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function JournalArticle() {
  const { slug } = useParams()
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div className="bg-ivory px-5 pt-40 pb-20 text-center">
        <h1 className="font-display text-3xl text-ink">Article not found</h1>
        <Link to="/journal" className="btn btn-outline mt-8">Back to the blog</Link>
      </div>
    )
  }

  const related = getRelatedArticles(article, 3)

  const structuredData = [
    articleLd(article),
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/journal' },
      { name: article.categoryLabel, path: '/journal' },
      { name: article.title, path: `/journal/${slug}` },
    ]),
  ]

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        canonicalPath={`/journal/${slug}`}
        type="article"
        structured={structuredData}
      />

      <ReadingProgress />

      {/* Hero image */}
      <div className="relative h-[40vh] min-h-[280px] overflow-hidden bg-plum-900 md:h-[55vh] pt-16">
        <OptimizedImage
          seed={`journal-${article.slug}`}
          paletteKey={article.paletteKey || 'garden'}
          alt={`${article.title} — editorial illustration`}
          aspect="auto"
          priority
          className="absolute inset-0 h-full w-full"
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />

        {/* Category pill floating on image */}
        <div className="absolute inset-x-0 bottom-6 mx-auto max-w-7xl px-5 md:px-8">
          <span className="inline-block rounded-full bg-ivory/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-plum-700 backdrop-blur-sm">
            {article.categoryLabel} · {article.readTime}
          </span>
        </div>
      </div>

      <article className="bg-ivory pb-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">

          {/* Article header */}
          <div className="mx-auto max-w-3xl pt-10">
            <Breadcrumbs
              trail={[
                { name: 'Home', to: '/' },
                { name: 'Blog', to: '/journal' },
                { name: article.categoryLabel, to: '/journal' },
              ]}
              className="mb-8"
            />

            <Reveal>
              <h1 className="font-display text-4xl font-medium leading-[1.06] tracking-[-0.01em] text-ink md:text-5xl lg:text-[3.2rem]">
                {article.title}
              </h1>
              <p className="mt-5 text-pretty text-xl leading-relaxed text-stone">
                {article.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-6">
                <time className="text-sm text-stone-light" dateTime={article.date}>
                  {formatDate(article.date)}
                </time>
                <span className="text-stone-light">·</span>
                <span className="text-sm text-stone-light">{article.readTime}</span>
                {article.tags?.length > 0 && (
                  <>
                    <span className="text-stone-light">·</span>
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag}
                          to="/journal"
                          state={{ tag }}
                          className="flex items-center gap-1 rounded-full border border-line bg-cream/50 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-stone hover:border-plum-300 hover:text-plum-600"
                        >
                          <Tag size={9} strokeWidth={2} />
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          {/* Two-col layout: article + ToC sidebar */}
          <div className="mt-8 grid gap-12 lg:grid-cols-12">

            {/* Body */}
            <div className="lg:col-span-8">
              <Reveal delay={80}>
                <div className="prose-article">
                  {article.body.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </Reveal>

              <ShareStrip title={article.title} slug={article.slug} />

              <div className="mt-8">
                <Link
                  to="/journal"
                  className="inline-flex items-center gap-2 text-sm font-medium text-plum-600 hover:text-plum-700"
                >
                  <ArrowLeft size={16} strokeWidth={1.8} />
                  Back to the blog
                </Link>
              </div>
            </div>

            {/* Sidebar: ToC + enquiry CTA */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-8">
                <TableOfContents body={article.body} />

                <div className="rounded-2xl bg-plum-900 p-6 text-ivory">
                  <p className="eyebrow text-plum-300">Ready to order?</p>
                  <p className="mt-3 font-display text-lg font-medium text-ivory">
                    Enquire about a bespoke cake
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-plum-200">
                    Tell us about your occasion — we'll design something around your day.
                  </p>
                  <Link to="/enquiry" className="btn mt-5 w-full bg-ivory text-plum-700 hover:bg-plum-50">
                    Start an enquiry
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="section-y bg-cream/60">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
                Continue reading
              </h2>
              <Link
                to="/journal"
                className="link-underline hidden items-center gap-2 text-sm font-medium text-plum-600 sm:inline-flex"
              >
                All articles <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {related.map((a, i) => (
                <RelatedCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        eyebrow="Planning a celebration?"
        title="Let's design your cake"
        body="Every cake is made to order, designed around your occasion. Tell us about your day and we'll take it from there."
        secondary={{ label: 'Browse the blog', to: '/journal' }}
      />
    </>
  )
}
