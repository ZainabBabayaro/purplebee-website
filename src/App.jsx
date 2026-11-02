import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { AdminRoute } from './components/auth/Guards.jsx'

// Eagerly loaded — homepage must render fast
import Home from './pages/Home.jsx'

// Lazy-loaded — download only when visited
const OurCakes = lazy(() => import('./pages/OurCakes.jsx'))
const Collections = lazy(() => import('./pages/Collections.jsx'))
const CollectionDetail = lazy(() => import('./pages/CollectionDetail.jsx'))
const CakeDetail = lazy(() => import('./pages/CakeDetail.jsx'))
const OurStory = lazy(() => import('./pages/OurStory.jsx'))
const Journal = lazy(() => import('./pages/Journal.jsx'))
const JournalArticle = lazy(() => import('./pages/JournalArticle.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Enquiry = lazy(() => import('./pages/Enquiry.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Store = lazy(() => import('./pages/Store.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))

// Admin — separate chunk, only loads when /admin is visited
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'))
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory.jsx'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog.jsx'))
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor.jsx'))
const AdminComments = lazy(() => import('./pages/admin/AdminComments.jsx'))

// Minimal fallback shown while a page chunk downloads (~100ms on fast connections)
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-ivory">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* ---- Public site with shared Layout (header + footer) ---- */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/our-cakes" element={<OurCakes />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<CollectionDetail />} />
          <Route path="/cakes/:slug" element={<CakeDetail />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Store */}
          <Route path="/store" element={<Store />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ---- Admin — no shared header/footer, own dark layout ---- */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<AdminBlogEditor />} />
          <Route path="blog/:slug" element={<AdminBlogEditor />} />
          <Route path="comments" element={<AdminComments />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  )
}
