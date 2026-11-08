import { Helmet } from 'react-helmet-async'
import { site } from '../data/site.js'

// Re-export all structured data helpers from their own file so any page can
// import both SEO and the builders from the same path as before.
export {
  organizationLd,
  bakeryLd,
  breadcrumbLd,
  cakeProductLd,
  articleLd,
} from '../utils/structuredData.js'

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

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

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
