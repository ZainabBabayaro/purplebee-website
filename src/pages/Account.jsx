import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Package, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { Input } from '../components/form/Inputs.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { dataApi } from '../services/db.js'

// ---- Auth forms ----
function AuthPanel({ onDone }) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
    setServerErr('')
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !values.name.trim()) e.name = 'Please enter your name.'
    if (!values.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email.'
    if (!values.password) e.password = 'Password is required.'
    else if (mode === 'register' && values.password.length < 8)
      e.password = 'Use at least 8 characters.'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    setServerErr('')
    try {
      if (mode === 'login') {
        await login({ email: values.email, password: values.password })
      } else {
        await signup({ email: values.email, password: values.password, displayName: values.name })
      }
      onDone?.()
    } catch (err) {
      setServerErr(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {serverErr && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverErr}
        </p>
      )}
      {mode === 'register' && (
        <Input
          id="name"
          label="Your name"
          required
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
        />
      )}
      <Input
        id="email"
        type="email"
        label="Email"
        required
        value={values.email}
        onChange={set('email')}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        id="password"
        type="password"
        label="Password"
        required
        hint={mode === 'register' ? 'At least 8 characters.' : undefined}
        value={values.password}
        onChange={set('password')}
        error={errors.password}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
      <p className="text-center text-sm text-stone">
        {mode === 'login' ? (
          <>
            No account?{' '}
            <button type="button" onClick={() => setMode('register')} className="text-plum-600 underline">
              Create one
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} className="text-plum-600 underline">
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  )
}

// ---- Order history ----
function statusPill(s) {
  const map = {
    new: 'bg-sky-100 text-sky-700',
    confirmed: 'bg-plum-100 text-plum-700',
    baking: 'bg-amber-100 text-amber-700',
    ready: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-stone/10 text-stone',
    cancelled: 'bg-red-100 text-red-700',
  }
  return map[s] || 'bg-stone/10 text-stone'
}

function money(n) {
  return `£${Number(n).toFixed(2)}`
}

function OrderHistory({ uid }) {
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    if (!uid) return
    dataApi.getMyOrders(uid).then(setOrders).catch(() => setOrders([]))
  }, [uid])

  if (!orders) return <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-200 border-t-plum-600 mx-auto" />

  if (orders.length === 0)
    return (
      <div className="py-8 text-center text-stone">
        <Package size={36} strokeWidth={1.3} className="mx-auto mb-3 text-plum-200" />
        <p>No orders yet.</p>
        <Link to="/store" className="btn btn-outline mt-5">Browse the store</Link>
      </div>
    )

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream/30 p-4">
          <div>
            <p className="text-sm font-medium text-ink">Order #{o.id.slice(-6).toUpperCase()}</p>
            <p className="mt-0.5 text-xs text-stone">
              {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}{o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}
              {' · '}{money(o.total)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusPill(o.status)}`}>
            {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ---- Page ----
export default function Account() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/account'

  const handleDone = () => navigate(from === '/account' ? '/account' : from)

  if (loading) return (
    <section className="bg-ivory pt-32 pb-20 md:pt-40">
      <SEO title="My Account" description="Sign in or create an account to track your Purple Bee Cakes orders." canonicalPath="/account" noindex />
      <div className="mx-auto max-w-xl px-5 md:px-8">
        <h1 className="font-display text-3xl font-medium text-ink">My account</h1>
      </div>
    </section>
  )

  return (
    <>
      <SEO title="My Account" description="Sign in or create an account to track your Purple Bee Cakes orders." canonicalPath="/account" noindex />

      <section className="bg-ivory pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-xl px-5 md:px-8">
          {!user ? (
            <div className="rounded-2xl border border-line bg-cream/30 p-8">
              <p className="eyebrow">Welcome</p>
              <h1 className="mt-4 font-display text-3xl font-medium text-ink">My account</h1>
              <p className="mt-2 text-sm text-stone">Sign in to view orders and manage your details.</p>
              <div className="mt-8">
                <AuthPanel onDone={handleDone} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Signed in</p>
                  <h1 className="mt-3 font-display text-3xl font-medium text-ink">
                    {user.displayName || user.email}
                  </h1>
                  <p className="mt-1 text-sm text-stone">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-stone hover:text-ink"
                >
                  <LogOut size={15} strokeWidth={1.7} />
                  Sign out
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <Link to="/store" className="flex items-center justify-between rounded-xl border border-line bg-cream/30 px-5 py-4 text-ink hover:border-plum-300">
                  <span className="font-medium">Browse the store</span>
                  <ChevronRight size={18} strokeWidth={1.6} className="text-stone" />
                </Link>
              </div>

              <div className="mt-8">
                <h2 className="font-display text-xl font-medium text-ink">Order history</h2>
                <div className="mt-5">
                  <OrderHistory uid={user.uid} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
