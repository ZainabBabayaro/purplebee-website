import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, User } from 'lucide-react'
import { navItems, primaryAction } from '../data/navigation.js'
import { site } from '../data/site.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import MobileMenu from './MobileMenu.jsx'
import { LogoLockup } from './Logo.jsx'

function Wordmark() {
  return (
    <Link to="/" className="group" aria-label={`${site.name} — home`}>
      <LogoLockup />
    </Link>
  )
}

// Animated bag button with item-count badge.
function CartButton({ scrolled }) {
  const { count, setOpen } = useCart()
  const col = scrolled ? 'text-ink' : 'text-ink'
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-plum-50 ${col}`}
      aria-label={`Open basket${count ? ` — ${count} item${count !== 1 ? 's' : ''}` : ''}`}
    >
      <ShoppingBag size={21} strokeWidth={1.6} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-plum-600 text-[0.6rem] font-semibold text-ivory">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? 'border-b border-line/70 bg-ivory/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `link-underline text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-plum-600' : 'text-ink hover:text-plum-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <CartButton scrolled={scrolled} />

          {/* Account icon */}
          <Link
            to={user ? '/account' : '/account'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-plum-50"
            aria-label={user ? `My account (${user.displayName || user.email})` : 'Sign in'}
          >
            <User size={20} strokeWidth={1.6} />
            {user && (
              <span className="absolute mt-6 ml-6 h-2.5 w-2.5 rounded-full bg-plum-500 ring-2 ring-ivory" />
            )}
          </Link>

          {/* Enquire CTA — desktop only */}
          <div className="hidden md:block ml-2">
            <Link to={primaryAction.to} className="btn btn-primary">
              {primaryAction.label}
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
