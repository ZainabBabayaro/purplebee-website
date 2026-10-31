import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { AdminRoute } from './components/auth/Guards.jsx'

// Public pages
import Home from './pages/Home.jsx'
import OurCakes from './pages/OurCakes.jsx'
import Collections from './pages/Collections.jsx'
import CollectionDetail from './pages/CollectionDetail.jsx'
import CakeDetail from './pages/CakeDetail.jsx'
import OurStory from './pages/OurStory.jsx'
import Journal from './pages/Journal.jsx'
import JournalArticle from './pages/JournalArticle.jsx'
import Contact from './pages/Contact.jsx'
import Enquiry from './pages/Enquiry.jsx'
import Privacy from './pages/Privacy.jsx'
import NotFound from './pages/NotFound.jsx'

// Store
import Store from './pages/Store.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderConfirmation from './pages/OrderConfirmation.jsx'
import Account from './pages/Account.jsx'

// Admin
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminInventory from './pages/admin/AdminInventory.jsx'
import AdminBlog from './pages/admin/AdminBlog.jsx'
import AdminBlogEditor from './pages/admin/AdminBlogEditor.jsx'
import AdminComments from './pages/admin/AdminComments.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
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
    </>
  )
}
