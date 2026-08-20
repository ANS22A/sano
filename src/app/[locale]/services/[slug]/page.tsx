import type { Metadata } from 'next'
import { ServiceBreadcrumb } from '@/components/services/detail/ServiceBreadcrumb'
import { ServiceHero } from '@/components/services/detail/ServiceHero'
import { ServiceBenefits } from '@/components/services/detail/ServiceBenefits'
import { ServiceDescription } from '@/components/services/detail/ServiceDescription'
import { WhatToExpect } from '@/components/services/detail/WhatToExpect'
import { RelatedServices } from '@/components/services/detail/RelatedServices'
import { Link } from '@/i18n/navigation'
import {
  getServiceBySlug,
  getAllServiceSlugs,
  getRelatedServices,
  getAllCategories,
} from '@/services/catalog.service'

// ─────────────────────────────────────────────
// STATIC PARAMS — pre-render all active slugs
// ─────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ─────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const isAr = locale === 'ar'
  const service = await getServiceBySlug(slug)

  if (!service) {
    return {
      title: isAr ? 'الخدمة غير موجودة — سانو لونا' : 'Service Not Found — SANO LUNA',
    }
  }

  const title = isAr
    ? (service.seo_title_ar ?? `${service.name_ar} — سانو لونا`)
    : (service.seo_title_en ?? `${service.name_en} — SANO LUNA`)

  const description = isAr
    ? (service.seo_description_ar ?? service.short_description_ar)
    : (service.seo_description_en ?? service.short_description_en)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service.image_url ? [{ url: service.image_url }] : undefined,
    },
    alternates: {
      languages: {
        ar: `/ar/services/${slug}`,
        en: `/en/services/${slug}`,
      },
    },
  }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const isAr = locale === 'ar'

  const [service, categories] = await Promise.all([
    getServiceBySlug(slug),
    getAllCategories(),
  ])

  if (!service) {
    return (
      <main
        id="main-content"
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-20"
        lang={locale}
      >
        <span className="text-4xl mb-6" aria-hidden="true">◌</span>
        <h1 className="heading-sl-lg mb-4">
          {isAr ? 'الخدمة غير موجودة' : 'Service Not Found'}
        </h1>
        <p className="text-body-muted mb-8 max-w-sm">
          {isAr
            ? 'ربما تم نقل هذه الخدمة أو تغيير مسارها.'
            : 'The service you are looking for may have moved or been updated.'}
        </p>
        <Link
          href="/services"
          className="btn btn-md btn-secondary inline-flex items-center gap-2"
        >
          {isAr ? '← العودة للخدمات' : '← Back to Services'}
        </Link>
      </main>
    )
  }

  // Fetch related services
  const related = await getRelatedServices(service.id, 3)

  // Structured data — schema.org Service
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isAr ? service.name_ar : service.name_en,
    description: isAr ? service.short_description_ar : service.short_description_en,
    provider: {
      '@type': 'LocalBusiness',
      name: 'SANO LUNA',
      areaServed: 'Jeddah, Saudi Arabia',
    },
    offers: {
      '@type': 'Offer',
      price: service.price_sar,
      priceCurrency: service.price_currency,
    },
  }

  return (
    <main id="main-content" lang={locale}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <ServiceBreadcrumb
        category={service.category}
        serviceName={isAr ? service.name_ar : service.name_en}
      />

      {/* Hero — image + title + price + CTA */}
      <ServiceHero service={service} />

      {/* Benefits */}
      <ServiceBenefits
        benefits_ar={service.benefits_ar}
        benefits_en={service.benefits_en}
      />

      {/* Full description */}
      <ServiceDescription
        description_ar={service.description_ar}
        description_en={service.description_en}
      />

      {/* What to expect */}
      <WhatToExpect
        what_to_expect_ar={service.what_to_expect_ar}
        what_to_expect_en={service.what_to_expect_en}
      />

      {/* Related services */}
      {related.length > 0 && (
        <RelatedServices services={related} categories={categories} />
      )}

      {/* Final CTA strip */}
      <section className="border-t border-[var(--border-subtle)] py-16 bg-[var(--color-surface-warm)]">
        <div className="container-sl text-center">
          <p className="overline-sl mb-4">
            {isAr ? 'مستعدة للبدء؟' : 'Ready to begin?'}
          </p>
          <h2 className="heading-sl-lg mb-6">
            {isAr ? 'احجزي هذه التجربة' : 'Book This Experience'}
          </h2>
          <p className="text-body-muted mb-8 max-w-md mx-auto">
            {isAr
              ? 'نأتي إليكِ في وقتك المناسب — راحة وخصوصية كاملة في منزلك.'
              : 'We come to you at your chosen time — complete comfort and privacy in your own home.'}
          </p>
          <Link
            href={`/booking?service=${service.slug}`}
            className="btn btn-lg btn-primary inline-flex items-center gap-2"
          >
            {isAr ? 'احجزي الآن' : 'Book Now'}
          </Link>
        </div>
      </section>
    </main>
  )
}