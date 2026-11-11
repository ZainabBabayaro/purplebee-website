import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '../Reveal.jsx'
import OptimizedImage from '../OptimizedImage.jsx'

// ⚠️ Drop your video file at public/videos/brand.mp4
// Leave BRAND_VIDEO empty to show the illustrated placeholder instead.
const BRAND_VIDEO = '/videos/brand.mp4'

export default function BrandPhilosophy() {
  const videoRef = useRef(null)
  const [loadVideo, setLoadVideo] = useState(false)

  useEffect(() => {
    if (!BRAND_VIDEO) return
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section-y bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">

          {/* ── Text ── */}
          <Reveal className="order-2 md:order-1">
            <p className="eyebrow">The Purplebee Cake Experirnce</p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-ink md:text-5xl">
                   Let's make your celebration unforgetable 
            </h2>
            <div className="mt-6 space-y-5 text-pretty leading-relaxed text-stone">
              <p>
          The cake is more than another item on your celebration checklist. It's the centrepiece everyone gathers around, the moment captured in photographs and, hopefully, the part everyone remembers long after the celebration.
              </p>
              <p>
             But finding a cake that looks beautiful and actually tastes exceptional shouldn't mean compromising on either.
              </p>
              <p>At Purple Bee Cakes, we bring thoughtful design and indulgent flavour together, so you can feel just as excited about serving your cake as you are about seeing it.</p>
            </div>

            <blockquote className="mt-9 border-l-2 border-plum-300 pl-5">
              <p className="font-display text-2xl font-medium leading-snug text-ink">
                "A cake should be a feast for the eyes and a delight to the palate."
              </p>
            </blockquote>

            <div className="mt-9">
              <Link to="/store" className="btn btn-primary">
                Find Your Perfect Cake
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>
            </div>
          </Reveal>

          {/* ── Video / image ── */}
          <Reveal delay={120} className="order-1 md:order-2">
            <div className="relative mx-auto max-w-md md:max-w-none">
              {/* Offset decorative background */}
              <div
                className="absolute -left-5 -top-6 hidden h-full w-full rounded-2xl bg-plum-100/70 md:block"
                aria-hidden="true"
              />

              <div ref={videoRef} className="relative overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(55,42,74,0.3)]">
                {BRAND_VIDEO && loadVideo ? (
                  <video
                    src={BRAND_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Purple Bee Cakes — a look at our craft"
                    className="h-full w-full object-cover"
                    style={{ aspectRatio: '5 / 6' }}
                  />
                ) : (
                  <OptimizedImage
                    seed="philosophy-purplebee"
                    paletteKey="quiet"
                    alt="A textured cake illustration — development placeholder"
                    aspect="5 / 6"
                    width={500}
                    height={600}
                  />
                )}
              </div>
            </div>
          </Reveal>

        </div>
        
      </div>
      
    </section>
  )
}
