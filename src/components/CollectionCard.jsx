import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import OptimizedImage from './OptimizedImage.jsx'

// Editorial collection card. Index drives a subtle staggered reveal delay.
export default function CollectionCard({ collection, index = 0 }) {
  return (
    <Link
      to={`/collections/${collection.slug}`}
      className="group block"
      aria-label={`View the ${collection.name} collection`}
    >
      <div className="relative overflow-hidden rounded-xl">
        <OptimizedImage
          seed={`collection-${collection.slug}`}
          paletteKey={collection.paletteKey}
          alt={`${collection.name} — ${collection.subtitle}, design direction illustration`}
          aspect="4 / 5"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-2xl font-medium text-ivory">
            {collection.name}
          </h3>
          <p className="mt-1 text-sm text-plum-100/90">{collection.subtitle}</p>
        </div>
        <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-plum-700 opacity-0 transition-all duration-500 group-hover:opacity-100">
          <ArrowUpRight size={18} strokeWidth={1.6} />
        </span>
      </div>
    </Link>
  )
}
