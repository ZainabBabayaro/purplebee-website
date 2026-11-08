import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react'
import { navItems } from '../data/navigation.js'
import { site } from '../data/site.js'
import { LogoLockupLight } from './Logo.jsx'

// Pinterest inline SVG since lucide-react doesn't include it.
function PinterestIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const socialIconMap = {
  Instagram: <Instagram size={18} strokeWidth={1.6} />,
  Facebook:  <Facebook  size={18} strokeWidth={1.6} />,
  Pinterest: <PinterestIcon size={18} />,
}

const footerLinks = [
  { label: 'Our Cakes',          to: '/our-cakes' },
  { label: 'Shop',               to: '/shop' },
  { label: 'Signature Flavours', to: '/signature-flavours' },
  { label: 'Custom Cakes',       to: '/custom-cakes' },
  { label: 'Journal',            to: '/journal' },
  { label: 'Our Story',          to: '/our-story' },
  { label: 'Contact',            to: '/contact' },
  { label: 'FAQs',               to: '/faqs' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const waUrl = site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`
    : null

  return (
    <footer className="bg-plum-900 text-plum-100">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Top grid */}
        <div className="grid gap-12 py-16 md:grid-cols-12 md:py-20">

          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" aria-label={`${site.name} — home`}>
              <LogoLockupLight />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-plum-200">
              {site.description}
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${s.label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-plum-700 text-plum-100 transition-colors hover:bg-plum-700"
                >
                  {socialIconMap[s.label] ?? <span className="text-xs">{s.label[0]}</span>}
                </a>
              ))}
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-plum-700 text-plum-100 transition-colors hover:bg-[#25D366]/20"
                >
                  <WhatsAppIcon size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <p className="eyebrow text-plum-300">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              {footerLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-plum-100 transition-colors hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Order + legal */}
          <div className="md:col-span-3">
            <p className="eyebrow text-plum-300">Order</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/cake-enquiry" className="text-plum-100 hover:text-ivory">Cake Enquiry</Link></li>
              <li><Link to="/shop"         className="text-plum-100 hover:text-ivory">Shop Online</Link></li>
              <li><Link to="/checkout"     className="text-plum-100 hover:text-ivory">Checkout</Link></li>
              <li><Link to="/account"      className="text-plum-100 hover:text-ivory">My Account</Link></li>
            </ul>
            <p className="eyebrow text-plum-300 mt-8">Legal</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link to="/privacy"      className="text-plum-100 hover:text-ivory">Privacy Policy</Link></li>
              <li><Link to="/faqs"         className="text-plum-100 hover:text-ivory">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
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
              {waUrl && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-plum-300"><WhatsAppIcon size={15} /></span>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-plum-100 hover:text-ivory">
                    WhatsApp us
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-plum-800 py-7 text-xs text-plum-300 md:flex-row md:items-center md:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="text-plum-500">Beautifully designed to be admired, thoughtfully crafted to be savoured.</p>
        </div>

      </div>
    </footer>
  )
}
