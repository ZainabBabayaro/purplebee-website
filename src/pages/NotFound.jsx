import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you were looking for could not be found."
        canonicalPath="/404"
        noindex
      />
      <section className="flex min-h-[70vh] items-center justify-center bg-ivory px-5 pt-24 pb-16">
        <div className="text-center">
          <p className="eyebrow">Lost a slice?</p>
          <h1 className="mt-5 font-display text-6xl font-medium text-ink md:text-7xl">404</h1>
          <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-stone">
            We could not find the page you were looking for. It may have moved, or
            the link may be out of date.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/" className="btn btn-primary">Back to home</Link>
            <Link to="/our-cakes" className="btn btn-outline">Browse our cakes</Link>
          </div>
        </div>
      </section>
    </>
  )
}
