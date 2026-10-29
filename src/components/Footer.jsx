import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react'
import { navItems } from '../data/navigation.js'
import { collections } from '../data/collections.js'
import { site } from '../data/site.js'
import { LogoLockupLight } from './Logo.jsx'

const socialIcons = { Instagram, Facebook }

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-plum-900 text-plum-100">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Top */}
        <div className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <Link to="/" aria-label={`${site.name} — home`}>
              <LogoLockupLight />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-plum-200">
              {site.description}
            </p>
            <div className="mt-6 flex gap-3">
              {site.social.map((s) => {
                const Icon = socialIcons[s.label]
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-plum-700 text-plum-100 transition-colors hover:bg-plum-700"
                  >
                    {Icon ? <Icon size={18} strokeWidth={1.6} /> : <span className="text-xs">{s.label[0]}</span>}
                  </a>
                )
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-plum-300">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-plum-100 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-plum-300">Collections</p>
            <ul className="mt-5 space-y-3 text-sm">
              {collections.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/collections/${c.slug}`}
                    className="text-plum-100 transition-colors hover:text-ivory"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-plum-300">Contact</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-plum-300" />
                <a href={`mailto:${site.contact.email}`} className="text-plum-100 hover:text-ivory">
                  {site.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-plum-300" />
                <span className="text-plum-200">{site.serviceArea}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-plum-800 py-7 text-xs text-plum-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-ivory">
              Privacy Policy
            </Link>
            <Link to="/enquiry" className="hover:text-ivory">
              Enquire
            </Link>
            <Link to="/contact" className="hover:text-ivory">
              Contact
            </Link>
          </div>
        </div>

        {/* Honest development notice — remove before launch */}
        <p className="border-t border-plum-800 py-5 text-center text-[0.7rem] text-plum-400">
          Development preview. Photography, testimonials, prices and business
          details shown are placeholders pending confirmation before launch.
        </p>
      </div>
    </footer>
  )
}
