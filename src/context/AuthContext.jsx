import { createContext, useContext, useEffect, useState } from 'react'
import { isFirebaseConfigured, initFirebase, ADMIN_EMAILS } from '../config/firebase.js'
import { dataApi } from '../services/db.js'
import { localdb } from '../services/localdb.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

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
          const admin =
            (await dataApi.isAdmin(fbUser.uid)) ||
            ADMIN_EMAILS.includes((fbUser.email || '').toLowerCase())
          setIsAdmin(admin)
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
