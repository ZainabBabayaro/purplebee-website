import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

// Accessible breadcrumb trail. `trail` is an array of { name, to }.
export default function Breadcrumbs({ trail = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone">
        {trail.map((item, i) => {
          const last = i === trail.length - 1
          return (
            <li key={item.to || item.name} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.to} className="hover:text-plum-600">
                    {item.name}
                  </Link>
                  <ChevronRight size={13} strokeWidth={1.8} className="text-stone-light" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
