// Reusable product-type tag. Consistent across all product cards and pages.
// productType: 'cake' | 'cake-slice' | 'cake-loaf'

const config = {
  'cake':       { label: 'Cake',       className: 'bg-plum-100 text-plum-700' },
  'cake-slice': { label: 'Cake Slice', className: 'bg-honey-400/20 text-honey-600' },
  'cake-loaf':  { label: 'Cake Loaf',  className: 'bg-cream border border-line text-stone' },
}

export default function ProductTypeTag({ productType, className = '' }) {
  const c = config[productType] || config['cake']
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${c.className} ${className}`}
    >
      {c.label}
    </span>
  )
}
