// ============================================================================
// pageLoaders — single source of truth for code-split page chunks
// ----------------------------------------------------------------------------
// App.jsx wraps each loader in React.lazy(), and main.jsx preloads the chunk for
// the current URL before hydrating prerendered HTML. Without that preload a
// lazy route suspends during the first hydration pass, React discards the
// server HTML for the Suspense boundary and re-renders it on the client.
// ============================================================================

export const pageLoaders = {
  OurCakes:          () => import('../pages/OurCakes.jsx'),
  Collections:       () => import('../pages/Collections.jsx'),
  CollectionDetail:  () => import('../pages/CollectionDetail.jsx'),
  CakeDetail:        () => import('../pages/CakeDetail.jsx'),
  OurStory:          () => import('../pages/OurStory.jsx'),
  Journal:           () => import('../pages/Journal.jsx'),
  JournalArticle:    () => import('../pages/JournalArticle.jsx'),
  Contact:           () => import('../pages/Contact.jsx'),
  Enquiry:           () => import('../pages/Enquiry.jsx'),
  Privacy:           () => import('../pages/Privacy.jsx'),
  NotFound:          () => import('../pages/NotFound.jsx'),
  Store:             () => import('../pages/Store.jsx'),
  Shop:              () => import('../pages/Shop.jsx'),
  Checkout:          () => import('../pages/Checkout.jsx'),
  OrderConfirmation: () => import('../pages/OrderConfirmation.jsx'),
  ThankYou:          () => import('../pages/ThankYou.jsx'),
  Account:           () => import('../pages/Account.jsx'),
  SignatureFlavours: () => import('../pages/SignatureFlavours.jsx'),
  CustomCakes:       () => import('../pages/CustomCakes.jsx'),
  FAQs:              () => import('../pages/FAQs.jsx'),
  CakeEnquiry:       () => import('../pages/CakeEnquiry.jsx'),

  // Admin
  AdminLogin:        () => import('../pages/admin/AdminLogin.jsx'),
  AdminLayout:       () => import('../pages/admin/AdminLayout.jsx'),
  AdminDashboard:    () => import('../pages/admin/AdminDashboard.jsx'),
  AdminOrders:       () => import('../pages/admin/AdminOrders.jsx'),
  AdminInventory:    () => import('../pages/admin/AdminInventory.jsx'),
  AdminBlog:         () => import('../pages/admin/AdminBlog.jsx'),
  AdminBlogEditor:   () => import('../pages/admin/AdminBlogEditor.jsx'),
  AdminComments:     () => import('../pages/admin/AdminComments.jsx'),
  AdminCollections:  () => import('../pages/admin/AdminCollections.jsx'),
  AdminEnquiries:    () => import('../pages/admin/AdminEnquiries.jsx'),
}

// Public route table mirroring App.jsx. `loader: null` means the page is eager
// (already in the main bundle), so there is nothing to preload.
export const routeLoaders = [
  { path: '/', loader: null },
  { path: '/our-cakes', loader: pageLoaders.OurCakes },
  { path: '/cakes', loader: pageLoaders.OurCakes },
  { path: '/collections', loader: pageLoaders.Collections },
  { path: '/collections/:slug', loader: pageLoaders.CollectionDetail },
  { path: '/cakes/:slug', loader: pageLoaders.CakeDetail },
  { path: '/product/:slug', loader: pageLoaders.CakeDetail },
  { path: '/our-story', loader: pageLoaders.OurStory },
  { path: '/journal', loader: pageLoaders.Journal },
  { path: '/journal/:slug', loader: pageLoaders.JournalArticle },
  { path: '/contact', loader: pageLoaders.Contact },
  { path: '/enquiry', loader: pageLoaders.Enquiry },
  { path: '/cake-enquiry', loader: pageLoaders.CakeEnquiry },
  { path: '/privacy', loader: pageLoaders.Privacy },
  { path: '/privacy-policy', loader: pageLoaders.Privacy },
  { path: '/faqs', loader: pageLoaders.FAQs },
  { path: '/signature-flavours', loader: pageLoaders.SignatureFlavours },
  { path: '/custom-cakes', loader: pageLoaders.CustomCakes },
  { path: '/store', loader: pageLoaders.Store },
  { path: '/shop', loader: pageLoaders.Shop },
  { path: '/checkout', loader: pageLoaders.Checkout },
  { path: '/order-confirmation', loader: pageLoaders.OrderConfirmation },
  { path: '/thank-you', loader: pageLoaders.ThankYou },
  { path: '/account', loader: pageLoaders.Account },
]

// Return the loader for a pathname, or the NotFound loader for unknown paths.
export function loaderForPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/'
  const match = routeLoaders.find((route) => matchesRoute(route.path, clean))
  return match ? match.loader : pageLoaders.NotFound
}

// Minimal matcher: exact for static paths, one dynamic segment for ':param'.
function matchesRoute(pattern, pathname) {
  if (pattern === pathname) return true
  if (!pattern.includes(':')) return false
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return false
  return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i])
}
