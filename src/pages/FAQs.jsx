import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import SEO, { breadcrumbLd } from '../components/SEO.jsx'
import PageHero from '../components/PageHero.jsx'
import Reveal from '../components/Reveal.jsx'

const faqs = [
  {
    q: 'How far in advance should I order my cake?',
    a: 'We recommend placing your order at least 2–3 weeks in advance for celebration cakes, and 4–8 weeks for wedding or large bespoke cakes. Popular dates fill quickly, so the earlier the better.',
    category: 'Ordering',
  },
  {
    q: 'Do you deliver cakes in Abuja?',
    a: 'Yes, we offer cake delivery within Abuja. Delivery fees and availability are confirmed at the time of your order. We can also advise on the best collection arrangement if you prefer to collect.',
    category: 'Delivery',
  },
  {
    q: 'Can I request a completely custom design?',
    a: 'Absolutely. Bespoke cakes are a core part of what we do. You can share reference images, describe your vision or tell us about the occasion and we will develop a design around your brief. Visit our Custom Cakes page to begin.',
    category: 'Bespoke',
  },
  {
    q: 'What flavours do you offer?',
    a: 'Our signature flavours are Snickers (rich chocolate sponge with dark ganache, salted peanut caramel and peanut buttercream), Lemon Blueberry (lemon sponge with blueberry filling and cream cheese ganache) and Vanilla (vanilla bean sponge with toffee caramel and whipped cream cheesecake). We also create custom flavour combinations on request.',
    category: 'Flavours',
  },
  {
    q: 'What coverings are available?',
    a: 'We offer three covering options: fondant for a smooth, structured finish; ganache for a rich, glossy coating; and whipped cream for a light, soft finish. We will help you choose the right covering for your design and occasion.',
    category: 'Flavours',
  },
  {
    q: 'How do I know what size cake to order?',
    a: 'Cake size depends on your guest count and how you plan to serve it. As a guide: a 6 inch cake serves 6–8 guests; 8 inch serves 12–16; 10 inch serves 22–28; 12 inch serves 36–45. We are happy to advise on the most appropriate size for your event.',
    category: 'Ordering',
  },
  {
    q: 'Can I order individual cake slices?',
    a: 'Yes. We offer individual cake slices, perfect for gifting, events or simply treating yourself. Each slice is made with the same care and quality as our full cakes. You can order slices through our store.',
    category: 'Products',
  },
  {
    q: 'Do you make wedding cakes?',
    a: 'Yes. Wedding cakes are one of our specialisms. We create multi-tiered wedding cakes designed to complement your venue, style and colour palette. We recommend beginning your wedding cake enquiry at least 2–3 months before your date.',
    category: 'Bespoke',
  },
  {
    q: 'Do you cater for dietary requirements?',
    a: 'Please let us know about any dietary requirements when placing your enquiry. We will advise on what is possible and ensure all relevant information is clearly communicated before your order is confirmed.',
    category: 'Products',
  },
  {
    q: 'What is your payment process?',
    a: 'Payment is processed securely via Paystack. A deposit is required to confirm your order, with the remaining balance due before your cake is collected or delivered. Full details will be shared when your order is confirmed.',
    category: 'Payment',
  },
  {
    q: 'Can I collect my cake in person?',
    a: 'Yes. Collection is available and is often the preferred option for delicate cakes. We will confirm the exact collection details, address and timing when your order is placed.',
    category: 'Delivery',
  },
  {
    q: 'How should I store my cake?',
    a: 'Most of our cakes are best stored at cool room temperature, away from direct sunlight. Avoid refrigerating unless specifically advised to do so. Fondant cakes should not be refrigerated as condensation can affect the finish. Detailed storage instructions will be provided with every order.',
    category: 'Products',
  },
]

const categories = ['All', ...new Set(faqs.map((f) => f.category))]

function AccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg font-medium text-ink leading-snug">
          {faq.q}
        </span>
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-plum-200 text-plum-600 transition-colors">
          {isOpen
            ? <Minus size={14} strokeWidth={2} />
            : <Plus size={14} strokeWidth={2} />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-6 pr-10">
          <p className="text-pretty leading-relaxed text-stone">{faq.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <>
      <SEO
        title="Frequently Asked Questions | Purple Bee Cakes Abuja"
        description="Everything you need to know about ordering a cake from Purple Bee Cakes — flavours, sizes, delivery, bespoke commissions, payment and more."
        canonicalPath="/faqs"
        structured={[breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'FAQs', path: '/faqs' },
        ])]}
      />

      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions."
        intro="Everything you need to know before placing your order. If your question isn't answered here, get in touch and we'll help."
        trail={[{ name: 'Home', to: '/' }, { name: 'FAQs', to: '/faqs' }]}
      />

      <section className="section-y bg-ivory pt-0">
        <div className="mx-auto max-w-4xl px-5 md:px-8">

          {/* Category filter */}
          <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter questions by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setActiveCategory(cat); setOpenIndex(null) }}
                aria-pressed={activeCategory === cat}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-plum-600 text-ivory'
                    : 'border border-line text-ink hover:border-plum-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <Reveal>
            <div className="border-t border-line" role="list">
              {filtered.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  faq={faq}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal delay={120} className="mt-14 rounded-2xl bg-plum-900 p-8 text-center text-ivory">
            <h2 className="font-display text-2xl font-medium text-ivory">
              Still have a question?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-plum-200">
              We are happy to help. Send us a message or start a WhatsApp conversation and we will get back to you promptly.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/contact" className="btn bg-ivory text-plum-700 hover:bg-plum-50">
                Contact us
              </Link>
              <Link to="/cake-enquiry" className="btn border border-plum-600 text-ivory hover:bg-plum-800">
                Start an enquiry
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
