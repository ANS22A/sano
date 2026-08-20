import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustSection } from '@/components/home/TrustSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { SignatureSection } from '@/components/home/SignatureSection'
import { ComposeSection } from '@/components/home/ComposeSection'
import { PackagesSection } from '@/components/home/PackagesSection'
import { GiftCardsSection } from '@/components/home/GiftCardsSection'
import { WhySection } from '@/components/home/WhySection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { TeamSection } from '@/components/home/TeamSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { GallerySection } from '@/components/home/GallerySection'
import { FaqSection } from '@/components/home/FaqSection'
import { FinalCtaSection } from '@/components/home/FinalCtaSection'
import { getFeaturedTeamMembers } from '@/services/team.service'

// ─────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'

  return {
    title: isAr
      ? 'سانو لونا | عناية فاخرة في منزلك'
      : 'SANO LUNA | Luxury Wellness At Home',
    description: isAr
      ? 'تجارب سبا وعناية راقية تصل إلى منزلك في جدة — مساج، حمام مغربي، علاجات متخصصة، وأكثر.'
      : 'Premium spa and wellness experiences delivered to your home in Jeddah — massage, Moroccan bath, specialist therapies, and more.',
    openGraph: {
      title: isAr ? 'سانو لونا | عناية فاخرة في منزلك' : 'SANO LUNA | Luxury Wellness At Home',
      description: isAr
        ? 'اكتشفي عالم سانو لونا — عناية حقيقية، خصوصية كاملة، في راحة منزلك.'
        : 'Discover SANO LUNA — genuine care, complete privacy, in the comfort of your home.',
      type: 'website',
      locale: isAr ? 'ar_SA' : 'en_US',
    },
    alternates: {
      canonical: `https://sanoluna.com/${locale}`,
      languages: {
        ar: 'https://sanoluna.com/ar',
        en: 'https://sanoluna.com/en',
      },
    },
  }
}

// ─────────────────────────────────────────────
// HOMEPAGE
// ─────────────────────────────────────────────

export default async function HomePage() {
  const staff = await getFeaturedTeamMembers()

  return (
    <>
      {/* 1. Hero — full viewport, transparent header overlay */}
      <HeroSection />

      {/* 2. Trust indicators */}
      <TrustSection />

      {/* 3. Service categories grid */}
      <CategoriesSection />

      {/* 4. Featured/popular experiences */}
      <FeaturedSection />

      {/* 5. Signature experience — editorial */}
      <SignatureSection />

      {/* 6. Build your experience — composer intro */}
      <ComposeSection />

      {/* 7. Packages — curated journeys */}
      <PackagesSection />

      {/* 8. Gift cards */}
      <GiftCardsSection />

      {/* 9. Why SANO LUNA — brand principles */}
      <WhySection />

      {/* 10. How it works */}
      <HowItWorksSection />

      {/* 11. Team preview */}
      <TeamSection initialStaff={staff} />

      {/* 12. Testimonials */}
      <TestimonialsSection />

      {/* 13. Gallery / Atmosphere */}
      <GallerySection />

      {/* 14. FAQ preview */}
      <FaqSection />

      {/* 15. Final booking CTA */}
      <FinalCtaSection />
    </>
  )
}
