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
  }
}

export function bakeryLd() {
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
