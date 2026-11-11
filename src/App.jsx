import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { AdminRoute } from './components/auth/Guards.jsx'
import { pageLoaders } from './routes/pageLoaders.js'

// Eagerly loaded — homepage must render fast
import Home from './pages/Home.jsx'

// Lazy-loaded pages. The loaders live in one place so main.jsx can preload the
// current route's chunk before hydrating prerendered HTML.
const OurCakes          = lazy(pageLoaders.OurCakes)
const Collections       = lazy(pageLoaders.Collections)
const CollectionDetail  = lazy(pageLoaders.CollectionDetail)
const CakeDetail        = lazy(pageLoaders.CakeDetail)
const OurStory          = lazy(pageLoaders.OurStory)
const Journal           = lazy(pageLoaders.Journal)
const JournalArticle    = lazy(pageLoaders.JournalArticle)
const Contact           = lazy(pageLoaders.Contact)
const Enquiry           = lazy(pageLoaders.Enquiry)
const Privacy           = lazy(pageLoaders.Privacy)
const NotFound          = lazy(pageLoaders.NotFound)
const Store             = lazy(pageLoaders.Store)
const Shop              = lazy(pageLoaders.Shop)
const Checkout          = lazy(pageLoaders.Checkout)
const OrderConfirmation = lazy(pageLoaders.OrderConfirmation)
const ThankYou          = lazy(pageLoaders.ThankYou)
const Account           = lazy(pageLoaders.Account)

// New pages
const SignatureFlavours = lazy(pageLoaders.SignatureFlavours)
const CustomCakes       = lazy(pageLoaders.CustomCakes)
const FAQs              = lazy(pageLoaders.FAQs)
const CakeEnquiry       = lazy(pageLoaders.CakeEnquiry)

// Admin
const AdminLogin        = lazy(pageLoaders.AdminLogin)
const AdminLayout       = lazy(pageLoaders.AdminLayout)
const AdminDashboard    = lazy(pageLoaders.AdminDashboard)
const AdminOrders       = lazy(pageLoaders.AdminOrders)
const AdminInventory    = lazy(pageLoaders.AdminInventory)
const AdminBlog         = lazy(pageLoaders.AdminBlog)
const AdminBlogEditor   = lazy(pageLoaders.AdminBlogEditor)
const AdminComments     = lazy(pageLoaders.AdminComments)
const AdminCollections  = lazy(pageLoaders.AdminCollections)
const AdminEnquiries    = lazy(pageLoaders.AdminEnquiries)

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
          {/* ---- Public site ---- */}
          <Route element={<Layout />}>
            <Route path="/"                    element={<Home />} />
            <Route path="/our-cakes"           element={<OurCakes />} />
            <Route path="/cakes"               element={<OurCakes />} />
            <Route path="/collections"         element={<Collections />} />
            <Route path="/collections/:slug"   element={<CollectionDetail />} />
            <Route path="/cakes/:slug"         element={<CakeDetail />} />
            <Route path="/product/:slug"       element={<CakeDetail />} />
            <Route path="/our-story"           element={<OurStory />} />
            <Route path="/journal"             element={<Journal />} />
            <Route path="/journal/:slug"       element={<JournalArticle />} />
            <Route path="/contact"             element={<Contact />} />
            <Route path="/enquiry"             element={<Enquiry />} />
            <Route path="/cake-enquiry"        element={<CakeEnquiry />} />
            <Route path="/privacy"             element={<Privacy />} />
            <Route path="/privacy-policy"      element={<Privacy />} />
            <Route path="/faqs"                element={<FAQs />} />
            <Route path="/signature-flavours"  element={<SignatureFlavours />} />
            <Route path="/custom-cakes"        element={<CustomCakes />} />
            <Route path="/store"               element={<Store />} />
            <Route path="/shop"                element={<Shop />} />
            <Route path="/checkout"            element={<Checkout />} />
            <Route path="/order-confirmation"  element={<OrderConfirmation />} />
            <Route path="/thank-you"           element={<ThankYou />} />
            <Route path="/account"             element={<Account />} />
            <Route path="*"                    element={<NotFound />} />
          </Route>

          {/* ---- Admin ---- */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="orders"     element={<AdminOrders />} />
            <Route path="inventory"  element={<AdminInventory />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="enquiries"  element={<AdminEnquiries />} />
            <Route path="blog"       element={<AdminBlog />} />
            <Route path="blog/new"   element={<AdminBlogEditor />} />
            <Route path="blog/:slug" element={<AdminBlogEditor />} />
            <Route path="comments"   element={<AdminComments />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
