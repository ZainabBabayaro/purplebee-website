import SEO, { organizationLd, bakeryLd } from '../components/SEO.jsx'
import Hero from '../components/home/Hero.jsx'
import FeaturedCollections from '../components/home/FeaturedCollections.jsx'
import SignatureGallery from '../components/home/SignatureGallery.jsx'
import BrandPhilosophy from '../components/home/BrandPhilosophy.jsx'
import BespokeEnquiry from '../components/home/BespokeEnquiry.jsx'
import Testimonials from '../components/home/Testimonials.jsx'
import FounderStory from '../components/home/FounderStory.jsx'
import CTASection from '../components/CTASection.jsx'

export default function Home() {
  return (
    <>
      <SEO
        title="Bespoke Cake Design Studio"
        description="Purple Bee Cakes is a cake design studio crafting bespoke celebration and wedding cakes — thoughtful design, flavour made from scratch, for the moments that matter."
        canonicalPath="/"
        structured={[organizationLd(), bakeryLd()]}
      />
      <Hero />
      {/* <FeaturedCollections /> */}
      <SignatureGallery />
      <BrandPhilosophy />
      <BespokeEnquiry />
      <Testimonials />
      <FounderStory />
      <CTASection
        secondary={{ label: 'Explore the cakes', to: '/our-cakes' }}
      />
    </>
  )
}
