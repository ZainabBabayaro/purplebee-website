// ============================================================================
// prerender.js — static site generation
// ----------------------------------------------------------------------------
// Runs after `vite build`. It uses Vite's SSR middleware to render every route
// to static HTML using the built index.html as the template, injecting the
// per-page <head> (title, meta, canonical, JSON-LD) from react-helmet-async and
// the rendered app into #root. Also emits sitemap.xml.
//
// This gives search engines fully rendered, metadata-rich pages without
// executing client JavaScript, while the SPA still hydrates for interactivity.
// ============================================================================

import { createServer } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { journal } from './src/data/journal.js'
import { site } from './src/data/site.js'
import { canonicalPath } from './src/utils/urls.js'
import { buildRedirectsFile } from './src/utils/buildRedirects.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, 'dist')

// Dynamically imported so we can set __BUILD_CATALOGUE__ on globalThis BEFORE
// any component imports src/data/cakes.js or src/data/collections.js.
async function loadCatalogue() {
  const { buildCatalogue } = await import('./src/utils/buildCatalogue.js')
  return buildCatalogue()
}

const staticRoutes = [
  '/',
  '/our-cakes/',
  '/collections/',
  '/our-story/',
  '/journal/',
  '/contact/',
  '/enquiry/',
  '/cake-enquiry/',
  '/checkout/',
  '/privacy/',
  '/privacy-policy/',
  '/faqs/',
  '/signature-flavours/',
  '/custom-cakes/',
  '/store/',
  '/shop/',
  '/account/',
  '/thank-you/',
  '/order-confirmation/',
]

// Map of URL → lastmod override (articles use their publish date).
let lastmodOverrides = new Map()

// Routes excluded from the sitemap (noindex, redirects, or not real pages).
const sitemapExcluded = new Set([
  '/privacy-policy/',
  '/404',
  '/account/',
  '/thank-you/',
  '/shop/',
  '/checkout/',
  '/order-confirmation/',
  '/enquiry/',
  '/cake-enquiry/',
])

// Legacy product slugs that must never be surfaced in the sitemap or
// prerendered, regardless of their Firestore active flag. Use the admin
// archive feature for ordinary discontinued products.
const HIDDEN_PRODUCT_SLUGS = new Set(['linen', 'alabaster'])

async function loadRoutes() {
  const { products, collections, source } = await loadCatalogue()

  const activeCollections = collections.filter((c) => c.visible !== false && c.published !== false)
  const activeProducts = products
    .filter((p) => p.active !== false && p.archived !== true && !HIDDEN_PRODUCT_SLUGS.has(p.slug))

  const collectionRoutes = activeCollections.map((c) => `/collections/${c.slug}/`)
  const cakeRoutes = activeProducts.map((c) => `/cakes/${c.slug}/`)
  const articleRoutes = journal.map((a) => `/journal/${a.slug}/`)

  lastmodOverrides = new Map(journal.map((a) => [`/journal/${a.slug}/`, a.date]))

  // Routes to render to HTML. /404 is written to 404.html for hosts that serve it.
  const renderRoutes = [...staticRoutes, ...collectionRoutes, ...cakeRoutes, ...articleRoutes, '/404']

  return { products, collections, activeProducts, activeCollections, renderRoutes, source }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]
  const urls = routes
    .filter((r) => !sitemapExcluded.has(r))
    .map((r) => {
      const loc = new URL(canonicalPath(r), site.url).href
      const lastmod = lastmodOverrides.get(r) || today
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function outFilePath(routePath) {
  if (routePath === '/') return path.join(distDir, 'index.html')
  if (routePath === '/404') return path.join(distDir, '404.html')
  const dir = path.join(distDir, routePath)
  return path.join(dir, 'index.html')
}

function injectHtml(template, appHtml, helmet) {
  let html = template

  // Remove the default title/description so the per-page ones take over.
  html = html.replace(/<title>[\s\S]*?<\/title>/, '')
  html = html.replace(/<meta\s+name="description"[^>]*>/i, '')

  const head = [
    helmet.title.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ]
    .filter(Boolean)
    .join('\n  ')

  if (html.includes('<!--app-head-->')) {
    html = html.replace('<!--app-head-->', head)
  } else {
    html = html.replace('</head>', `  ${head}\n</head>`)
  }

  if (html.includes('<!--app-html-->')) {
    html = html.replace('<!--app-html-->', appHtml)
  } else {
    html = html.replace(/(<div id="root">)[\s\S]*?(<\/div>)/, `$1${appHtml}$2`)
  }

  return html
}

// Strip eager modulepreload hints for lazy route chunks. Vite preloads every
// dynamic import it knows about, which makes the homepage download the store
// and admin bundles before they are needed. Keep only the core entry + react
// preloads; other chunks are fetched on demand when the user navigates.
function stripLazyPreloads(html) {
  return html.replace(
    /<link rel="modulepreload"[^>]*href="\/assets\/([^"]+)"[^>]*>/g,
    (match, filename) => {
      if (/^index-[a-zA-Z0-9_-]+\.js$/.test(filename)) return match
      if (/^react-[a-zA-Z0-9_-]+\.js$/.test(filename)) return match
      return ''
    }
  )
}

async function main() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('dist/index.html not found — run `vite build` before prerendering.')
  }

  const { products, collections, activeProducts, activeCollections, renderRoutes, source } = await loadRoutes()

  // Make the fetched catalogue available to SSR before any component modules
  // are loaded. This lets src/data/cakes.js and src/data/collections.js
  // render Firestore-only products and collections during prerendering.
  globalThis.__BUILD_CATALOGUE__ = { products, collections }

  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

  console.log('\n✦ Prerendering static pages…\n')
  console.log(`  Catalogue source: ${source} (${activeProducts.length} active products, ${activeCollections.length} active collections)\n`)

  // Use Vite in middleware mode to transform/resolve source for SSR.
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })

  let success = 0
  let failed = 0
  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')

    for (const route of renderRoutes) {
      try {
        const helmetContext = {}
        const appHtml = render(route, helmetContext)
        const helmet = helmetContext.helmet || {}
        const html = stripLazyPreloads(injectHtml(template, appHtml, helmet))

        const file = outFilePath(route)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
        success++
        console.log(`  ✓ ${route.padEnd(32)} → ${path.relative(distDir, file)}`)
      } catch (err) {
        failed++
        console.error(`  ✗ ${route} — ${err.message}`)
      }
    }

    // Sitemap
    const sitemap = buildSitemap(renderRoutes)
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)
    console.log(`  ✓ sitemap.xml (${renderRoutes.length - sitemapExcluded.size} URLs)`)

    // Redirects
    // Generate redirects from the full catalogue, including archived items, so
    // renamed-but-later-archived products still redirect to their final URL.
    const redirectResult = await buildRedirectsFile({ products, collections, distDir })
    console.log(`  ✓ _redirects (${redirectResult.productRules.length + redirectResult.collectionRules.length} generated, ${redirectResult.manualRules.length} manual)`)
  } finally {
    await vite.close()
  }

  console.log(`\n✦ Prerendered ${success} page(s)${failed ? `, ${failed} failed` : ''}.\n`)
  if (failed) process.exitCode = 1
}

main().catch((err) => {
  console.error('\nPrerender failed:')
  console.error(err)
  process.exitCode = 1
})
