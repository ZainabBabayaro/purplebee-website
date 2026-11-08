import { createContext, useEffect, useState } from 'react'
import { isFirebaseConfigured, initFirebase, ADMIN_EMAILS } from '../config/firebase.js'
import { dataApi } from '../services/db.js'
import { localdb } from '../services/localdb.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = () => {}

    if (isFirebaseConfigured) {
      // Init Firebase lazily then subscribe to auth state
      initFirebase().then(async () => {
        const { auth } = await import('../config/firebase.js')
        const { onAuthStateChanged } = await import('firebase/auth')

        unsub = onAuthStateChanged(auth, async (fbUser) => {
          if (!fbUser) {
            setUser(null)
            setIsAdmin(false)
            setLoading(false)
            return
          }
          const u = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
          }
          setUser(u)
          // Check email allowlist first — no Firestore read required.
          // The admins collection is intentionally unreadable from the client.
          const byEmail = ADMIN_EMAILS.includes((fbUser.email || '').toLowerCase())
          if (byEmail) {
            setIsAdmin(true)
            setLoading(false)
            return
          }
          // Fallback Firestore check — silently fails if rules block it.
          try {
            const adminByFirestore = await dataApi.isAdmin(fbUser.uid)
            setIsAdmin(adminByFirestore)
          } catch {
            setIsAdmin(false)
          }
          setLoading(false)
        })
      })
    } else {
      const apply = () => {
        const s = localdb.getSession()
        setUser(s)
        setIsAdmin(s ? s.isAdmin : false)
      }
      apply()
      setLoading(false)
      unsub = localdb.subscribe(apply)
    }

    return () => unsub()
  }, [])

  const signup = async ({ email, password, displayName }) => {
    if (isFirebaseConfigured) {
      await initFirebase()
      const { auth } = await import('../config/firebase.js')
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) await updateProfile(cred.user, { displayName })
      return cred.user
    }
    const s = await localdb.signup({ email, password, displayName })
    setUser(s); setIsAdmin(s.isAdmin)
    return s
  }

  const login = async ({ email, password }) => {
    if (isFirebaseConfigured) {
      await initFirebase()
      const { auth } = await import('../config/firebase.js')
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      if (!auth) throw new Error('Auth not ready — please try again.')
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return cred.user
    }
    const s = await localdb.login({ email, password })
    setUser(s); setIsAdmin(s.isAdmin)
    return s
  }

  const logout = async () => {
    if (isFirebaseConfigured) {
      await initFirebase()
      const { auth } = await import('../config/firebase.js')
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    } else {
      await localdb.logout()
      setUser(null); setIsAdmin(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
