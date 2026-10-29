import { Helmet } from 'react-helmet-async'
import { site } from '../data/site.js'

// ============================================================================
// SEO — per-page metadata + structured data via react-helmet-async.
// ----------------------------------------------------------------------------
// Structured data only ever reflects information we actually have. We never
// emit fabricated reviews, ratings, prices, addresses or telephone numbers.
// `canonicalPath` is the route-relative path; the full canonical URL is built
// from the configured site.url (a placeholder until the live domain is set).
// ============================================================================

function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

export default function SEO({
  title,
  description,
  canonicalPath = '',
  image,
  type = 'website',
  structured = [],
  noindex = false,
}) {
  const canonical = new URL(canonicalPath || '/', site.url).href
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`
  const ogImage = image || `${site.url}/og-image.svg`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {structured.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {jsonLd(obj)}
        </script>
      ))}
    </Helmet>
  )
}

// ---- Structured-data builders (honest: only known fields are included) ----

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.description,
    logo: `${site.url}/og-image.svg`,
  }
}

export function bakeryLd() {
  // LocalBusiness/Bakery with only confirmed fields. Address, telephone and
  // geo are intentionally omitted until verified business details are supplied.
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: site.name,
    url: site.url,
    image: `${site.url}/og-image.svg`,
    description: site.description,
  }
}

export function breadcrumbLd(trail = []) {
  // trail: [{ name, path }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.path || '/', site.url).href,
    })),
  }
}

export function cakeProductLd(cake) {
  // Product for a cake design page. No offers, price or ratings — these are
  // bespoke commissions and pricing is confirmed per enquiry, not published.
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cake.name,
    description: cake.summary || cake.description,
    brand: { '@type': 'Brand', name: site.name },
    category: cake.occasion ? `${cake.occasion} cake` : 'Cake',
    url: `${site.url}/cakes/${cake.slug}`,
  }
}

export function articleLd(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    keywords: (article.tags || []).join(', '),
    articleSection: article.categoryLabel || article.category,
    author: { '@type': 'Organization', name: site.name },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/og-image.svg` },
    },
    mainEntityOfPage: `${site.url}/journal/${article.slug}`,
  }
}
