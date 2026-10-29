import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems, primaryAction } from '../data/navigation.js'
import { site } from '../data/site.js'
import { LogoLockup } from './Logo.jsx'

// Full-screen mobile navigation overlay. Focuses the close button on open,
// traps Tab within the panel, and closes on Escape or route change.
export default function MobileMenu({ open, onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-[84%] max-w-sm bg-ivory shadow-2xl transition-transform duration-500 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <LogoLockup />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="flex flex-col px-6 pt-4" aria-label="Mobile">
          {navItems.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={{ transitionDelay: `${open ? 80 + i * 40 : 0}ms` }}
              className={({ isActive }) =>
                `border-b border-line py-4 font-display text-2xl transition-colors duration-300 ${
                  open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                } ${isActive ? 'text-plum-600' : 'text-ink hover:text-plum-600'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 pt-8">
          <Link to={primaryAction.to} onClick={onClose} className="btn btn-primary w-full">
            {primaryAction.label}
          </Link>
        </div>

        <div className="px-6 pt-8 text-sm text-stone">
          <p className="font-medium text-ink">Get in touch</p>
          <a
            href={`mailto:${site.contact.email}`}
            className="mt-1 block text-stone hover:text-plum-600"
          >
            {site.contact.email}
          </a>
          {site.social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-stone hover:text-plum-600"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
