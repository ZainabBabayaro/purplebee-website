// /shop redirects to /store — the store lives at /store but the nav and
// brief use /shop. This component renders a redirect so both URLs work.
import { Navigate } from 'react-router-dom'

export default function Shop() {
  return <Navigate to="/store" replace />
}
