import { useContext } from 'react'
import { AuthContext } from './AuthContext.jsx'

// Standalone hook file — keeps AuthContext.jsx Fast Refresh compatible.
// Import useAuth from here, AuthProvider from AuthContext.jsx.
export const useAuth = () => useContext(AuthContext)
