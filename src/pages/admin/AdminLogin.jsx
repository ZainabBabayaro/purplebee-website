import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import SEO from '../../components/SEO.jsx'
import { Input } from '../../components/form/Inputs.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login, user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Already authenticated admin — redirect straight in (after render, not during).
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [loading, user, isAdmin, navigate])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
    setServerErr('')
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!values.email.trim()) errs.email = 'Email is required.'
    if (!values.password) errs.password = 'Password is required.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await login({ email: values.email, password: values.password })
      // AuthContext will update isAdmin; redirect happens on next render.
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setServerErr(err.message || 'Incorrect email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO title="Admin login" canonicalPath="/admin" noindex />
      <div className="flex min-h-screen items-center justify-center bg-plum-900 px-5">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-plum-700">
              <Lock size={24} strokeWidth={1.6} className="text-plum-200" />
            </div>
            <h1 className="font-display text-3xl font-medium text-ivory">Admin login</h1>
            <p className="mt-2 text-sm text-plum-300">Purple Bee Cakes studio portal</p>
          </div>

          <form onSubmit={submit} noValidate className="rounded-2xl bg-plum-800 p-7 space-y-5">
            {serverErr && (
              <p role="alert" className="rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">{serverErr}</p>
            )}
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium text-plum-200">Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={set('email')}
                aria-invalid={errors.email ? 'true' : undefined}
                className="mt-2 w-full rounded-xl border border-plum-700 bg-plum-900 px-4 py-3 text-ivory placeholder:text-plum-500 focus:border-plum-400 focus:outline-none"
                placeholder="you@purplebeecakes.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-plum-200">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={values.password}
                onChange={set('password')}
                aria-invalid={errors.password ? 'true' : undefined}
                className="mt-2 w-full rounded-xl border border-plum-700 bg-plum-900 px-4 py-3 text-ivory placeholder:text-plum-500 focus:border-plum-400 focus:outline-none"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
            <button type="submit" disabled={busy} className="w-full rounded-full bg-plum-500 py-3 text-sm font-medium text-ivory transition-colors hover:bg-plum-400 disabled:opacity-60">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-plum-500">
            This area is for studio use only. Unauthorised access is prohibited.
          </p>
        </div>
      </div>
    </>
  )
}
