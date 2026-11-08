import SEO, { organizationLd, bakeryLd } from '../components/SEO.jsx'
import Hero from '../components/home/Hero.jsx'
import FeaturedCollections from '../components/home/FeaturedCollections.jsx'
import BrandPhilosophy from '../components/home/BrandPhilosophy.jsx'
import SignatureFlavours from '../components/home/SignatureFlavours.jsx'
import WhyPurpleBee from '../components/home/WhyPurpleBee.jsx'
import BespokeEnquiry from '../components/home/BespokeEnquiry.jsx'
import Testimonials from '../components/home/Testimonials.jsx'
import OrderingExperience from '../components/home/OrderingExperience.jsx'
import FounderStory from '../components/home/FounderStory.jsx'
import CTASection from '../components/CTASection.jsx'

// Homepage section order:
// 1. Hero
// 2. Brand Philosophy
// 3. Collections
// 4. Signature Flavours (new)
// 5. Why Purple Bee (new)
// 6. Bespoke Enquiry
// 7. Ordering Experience (new)
// 8. Testimonials
// 9. Founder Story
// 10. Final CTA

export default function Home() {
  return (
    <>
      <SEO
        title="Purplebee Cakes Abuja"
        description="Purple Bee Cakes crafts beautifully designed celebration, wedding and bespoke cakes in Abuja — thoughtful design, exceptional flavour, for the moments that matter."
        canonicalPath="/"
        structured={[organizationLd(), bakeryLd()]}
      />
      <Hero />
      <BrandPhilosophy />
      <FeaturedCollections />
      <OrderingExperience />

      <SignatureFlavours />
      <WhyPurpleBee />
      <Testimonials />
      <BespokeEnquiry />
      <FounderStory />
      <CTASection
        secondary={{ label: 'Explore the cakes', to: '/store' }}
      />
    </>
  )
}
