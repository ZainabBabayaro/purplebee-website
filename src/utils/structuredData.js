// ============================================================================
// Structured data builders — plain JS, no React.
// Kept separate from SEO.jsx so Vite Fast Refresh works correctly.
// Import from here instead of from SEO.jsx.
// ============================================================================
import { site } from '../data/site.js'

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.description,
    logo: `${site.url}/og-image.svg`,
    sameAs: site.social.map((s) => s.href).filter(Boolean),
  }
}

export function bakeryLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${site.url}/#bakery`,
    name: site.name,
    url: site.url,
    image: `${site.url}/og-image.svg`,
    description: site.description,
    email: site.contact.email,
    telephone: site.contact.phone || undefined,
    priceRange: site.startingPrice === 'POA' ? '₦₦₦' : `₦${site.startingPrice}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Abuja',
      addressCountry: 'NG',
    },
    areaServed: {
      '@type': 'City',
      name: site.serviceArea || 'Abuja, Nigeria',
    },
  }
}

export function breadcrumbLd(trail = []) {
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
  const image = cake.images?.[0]?.url || cake.image || `${site.url}/og-image.svg`
  const price = Number(cake.price)
  const hasValidPrice = Number.isFinite(price) && price > 0
  const purchaseType = cake.purchaseType || (cake.productType === 'cake' ? 'configurable' : 'simple')
  const isQuotation = purchaseType === 'quotation'

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cake.name,
    description: cake.summary || cake.description,
    brand: { '@type': 'Brand', name: site.name },
    category: cake.occasion ? `${cake.occasion} cake` : 'Cake',
    url: `${site.url}/cakes/${cake.slug}`,
    image,
  }

  if (hasValidPrice && !isQuotation) {
    product.offers = {
      '@type': 'Offer',
      url: `${site.url}/cakes/${cake.slug}`,
      priceCurrency: 'NGN',
      price: String(price),
      availability: cake.available !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    }
  }

  return product
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

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site.url}/store?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
