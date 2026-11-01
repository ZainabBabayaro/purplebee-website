import { Link } from 'react-router-dom'
import OptimizedImage from './OptimizedImage.jsx'

// Cake gallery card. Links to the individual cake page.
export default function CakeCard({ cake, aspect = '4 / 5', className = '' }) {
  return (
    <Link to={`/cakes/${cake.slug}`} className={`group block ${className}`}>
      <div className="overflow-hidden rounded-xl bg-cream">
        <OptimizedImage
          src={cake.image}
          seed={`cake-${cake.slug}`}
          paletteKey={cake.paletteKey}
          alt={`${cake.name} cake — ${cake.summary}`}
          aspect={aspect}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-medium text-ink transition-colors group-hover:text-plum-600">
            {cake.name}
          </h3>
          <p className="mt-0.5 text-sm text-stone">{cake.collectionName} · {cake.occasion}</p>
        </div>
      </div>
    </Link>
  )
}
