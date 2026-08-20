import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { packages } from '@/data/content.data'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export async function generateStaticParams() {
  return packages
    .filter((p) => p.is_active)
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const isAr = locale === 'ar'
  const pkg = packages.find((p) => p.slug === slug)
  if (!pkg) return {}
  return {
    title: isAr ? `${pkg.name_ar} — سانو لونا` : `${pkg.name_en} — SANO LUNA`,
    description: isAr ? pkg.description_ar : pkg.description_en,
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const isAr = locale === 'ar'
  const pkg = packages.find((p) => p.slug === slug && p.is_active)
  if (!pkg) notFound()

  const name = isAr ? pkg.name_ar : pkg.name_en
  const tagline = isAr ? (pkg.tagline_ar ?? '') : (pkg.tagline_en ?? '')
  const description = isAr ? pkg.description_ar : pkg.description_en
  const includedServices = isAr ? pkg.included_services_ar : pkg.included_services_en

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="pt-28 pb-4" aria-label="breadcrumb">
        <div className="container mx-auto px-6 max-w-5xl">
          <ol className={cn('flex items-center gap-2 text-sm text-[var(--color-text-muted)]', isAr && 'flex-row-reverse')}>
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--color-sand-300)]">{isAr ? '←' : '→'}</li>
            <li>
              <Link href="/packages" className="hover:text-foreground transition-colors">
                {isAr ? 'الباقات' : 'Packages'}
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--color-sand-300)]">{isAr ? '←' : '→'}</li>
            <li className="text-foreground font-medium truncate">{name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 bg-[var(--color-sand-50)]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-12 items-start', isAr && 'lg:grid-flow-col-dense')}>
            {/* Image */}
            <div className="aspect-[4/3] bg-[var(--color-sand-100)] rounded-sm flex items-center justify-center relative overflow-hidden">
              {pkg.image_url ? (
                <Image
                  src={pkg.image_url}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="text-6xl opacity-20">✦</span>
              )}
            </div>

            {/* Info */}
            <div className={cn('flex flex-col gap-6', isAr && 'items-end text-right')}>
              {tagline && (
                <p className="text-[var(--color-sand-500)] text-xs tracking-[0.25em] uppercase">{tagline}</p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-sand-900)]">{name}</h1>
              <p className="text-[var(--color-text-muted)] leading-relaxed">{description}</p>

              {/* Meta badges */}
              <div className={cn('flex flex-wrap gap-3', isAr && 'flex-row-reverse')}>
                <span className="px-3 py-1 bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-sm rounded-full">
                  {pkg.total_duration_minutes} {isAr ? 'دقيقة' : 'min'}
                </span>
                {pkg.max_guests > 1 && (
                  <span className="px-3 py-1 bg-[var(--color-sand-100)] text-[var(--color-sand-700)] text-sm rounded-full">
                    {isAr ? `${pkg.max_guests} ضيوف` : `Up to ${pkg.max_guests} guests`}
                  </span>
                )}
              </div>

              {/* Price + CTA */}
              <div className={cn('flex items-center gap-6', isAr && 'flex-row-reverse')}>
                <div>
                  <span className="text-3xl font-semibold text-[var(--color-sand-900)]">{pkg.price_sar}</span>
                  <span className="text-sm text-[var(--color-text-muted)] ms-1">{isAr ? 'ريال' : 'SAR'}</span>
                </div>
                <Link
                  href={`/booking?package=${pkg.slug}`}
                  className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-sand-900)] text-white text-sm tracking-wide rounded-sm hover:bg-[var(--color-sand-700)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-sand-700)] focus:ring-offset-2"
                >
                  {isAr ? 'احجزي الآن' : 'Book Now'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className={cn('font-serif text-2xl text-[var(--color-sand-900)] mb-8', isAr && 'text-right')}>
            {isAr ? 'يشمل هذا الطقس' : 'What\'s Included'}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {includedServices.map((item, i) => (
              <li key={i} className={cn(
                'flex items-center gap-3 p-4 border border-[var(--border-subtle)] rounded-sm',
                isAr && 'flex-row-reverse text-right'
              )}>
                <span className="text-[var(--color-sand-400)] shrink-0">✦</span>
                <span className="text-[var(--color-sand-800)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
