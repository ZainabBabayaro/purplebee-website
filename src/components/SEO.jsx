import { Helmet } from 'react-helmet-async'
import { site } from '../data/site.js'
import { organizationLd, bakeryLd, websiteLd } from '../utils/structuredData.js'

// Re-export all structured data helpers from their own file so any page can
// import both SEO and the builders from the same path as before.
export {
  organizationLd,
  bakeryLd,
  breadcrumbLd,
  cakeProductLd,
  articleLd,
  websiteLd,
} from '../utils/structuredData.js'

function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

// Convert a possibly relative image path into an absolute URL. Social crawlers
// and Google Rich Results require absolute image URLs.
function absoluteImageUrl(image) {
  if (!image) return `${site.url}/og-image.svg`
  if (/^https?:\/\//i.test(image)) return image
  const path = String(image).startsWith('/') ? image : `/${image}`
  return new URL(path, site.url).href
}

export default function SEO({
  title,
  description,
  canonicalPath = '',
  image,
  imageAlt,
  type = 'website',
  structured = [],
  noindex = false,
}) {
  const canonical = new URL(canonicalPath || '/', site.url).href
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`
  const ogImage = absoluteImageUrl(image)

  // Global structured data included on every public page.
  const defaultStructured = [organizationLd(), bakeryLd(), websiteLd()]
  const allStructured = [...defaultStructured, ...structured]

  // defer={false} commits head tags synchronously on client navigation. The
  // default (requestAnimationFrame) is paused in background tabs, which leaves
  // the previous page's title/canonical in place until the tab is focused.
  return (
    <Helmet defer={false}>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:locale" content="en_NG" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@purplebeecakes" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}

      {allStructured.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {jsonLd(obj)}
        </script>
      ))}
    </Helmet>
  )
}
