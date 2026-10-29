import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// A small, brand-aligned loading state used by guards.
function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-ivory pt-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600" />
    </div>
  )
}

// Requires a signed-in customer.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loading />
  if (!user) {
    return <Navigate to="/account" state={{ from: location.pathname }} replace />
  }
  return children
}

// Requires an authenticated admin (admins/{uid} or allowlist).
// The actual data access is still gated by Firestore rules server-side.
export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Loading />
  if (!user || !isAdmin) return <Navigate to="/admin" replace />
  return children
}
