import type { Metadata } from 'next'
import { ServicesHero } from '@/components/services/ServicesHero'
import { ServiceGrid } from '@/components/services/ServiceGrid'
import { getAllServices, getAllCategories } from '@/services/catalog.service'

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
      ? 'الخدمات | سانو لونا — عناية فاخرة في منزلك'
      : 'Services | SANO LUNA — Luxury Wellness At Home',
    description: isAr
      ? 'اكتشفي مجموعة سانو لونا الكاملة من العلاجات والخدمات — مساج، حمام مغربي، رعاية الحامل، وأكثر. خدمة في منزلك في الرياض.'
      : 'Explore the complete SANO LUNA treatment collection — massage, Moroccan bath, prenatal care and more. At-home service in Riyadh.',
    openGraph: {
      title: isAr ? 'الخدمات — سانو لونا' : 'Services — SANO LUNA',
      description: isAr
        ? 'علاجات فاخرة في منزلك — اكتشفي طقسك الخاص مع سانو لونا.'
        : 'Luxury treatments at your home — discover your ritual with SANO LUNA.',
    },
  }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Server-side data fetch — both calls run in parallel
  const [services, categories] = await Promise.all([
    getAllServices(),
    getAllCategories(),
  ])

  return (
    <main id="main-content" lang={locale}>
      {/* Hero */}
      <ServicesHero />

      {/* Catalog */}
      <section
        className="section-sl"
        aria-label={locale === 'ar' ? 'كتالوج الخدمات' : 'Services catalog'}
      >
        <div className="container-sl">
          <ServiceGrid services={services} categories={categories} />
        </div>
      </section>
    </main>
  )
}
