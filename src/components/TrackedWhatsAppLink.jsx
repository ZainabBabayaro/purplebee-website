import { trackContact } from '../utils/analytics.js'

// A WhatsApp link that fires a 'contact' analytics event before navigating.
// Accepts the same props as a normal anchor, plus children.
export default function TrackedWhatsAppLink({ href, children, className = '', ...props }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContact('whatsapp')}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
