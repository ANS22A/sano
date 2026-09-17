import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { packages } from '@/data/content.data'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

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
  
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: dbPkg } = await supabase.from('packages').select('name_ar, name_en, description_ar, description_en').eq('slug', slug).eq('is_active', true).maybeSingle()
  
  const pkg = dbPkg
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
  
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: dbPkg } = await supabase.from('packages').select('*, package_services(services(name_en, name_ar, is_active))').eq('slug', slug).eq('is_active', true).maybeSingle()
  
  const pkg = dbPkg
  if (!pkg) notFound()

  // Compute bookability inline from already-fetched data (avoids duplicate DB query)
  interface PackageServiceDbRow {
    services: { is_active: boolean } | null
  }
  const psArray = Array.isArray((pkg as unknown as { package_services: PackageServiceDbRow[] }).package_services) 
    ? (pkg as unknown as { package_services: PackageServiceDbRow[] }).package_services 
    : []
  const isBookable = psArray.length === 0 || psArray.every((ps: PackageServiceDbRow) => ps.services?.is_active === true)

  const typedPkg = pkg as unknown as { tagline_ar: string | null; tagline_en: string | null; max_guests: number }
  const name = isAr ? pkg.name_ar : pkg.name_en
  const tagline = isAr ? (typedPkg.tagline_ar ?? '') : (typedPkg.tagline_en ?? '')
  const description = isAr ? pkg.description_ar : pkg.description_en
  
  // Resolve included services from DB join
  const dbServices = dbPkg?.package_services?.map((ps: { services: { name_ar: string; name_en: string } | null } | null) => isAr ? ps?.services?.name_ar : ps?.services?.name_en).filter(Boolean) as string[] || []
  const includedServices = dbServices

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="pt-28 pb-4" aria-label="breadcrumb">
        <div className="container mx-auto px-6 max-w-5xl">
          <ol className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--border)] rtl:rotate-180">→</li>
            <li>
              <Link href="/packages" className="hover:text-foreground transition-colors">
                {isAr ? 'الباقات' : 'Packages'}
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--border)] rtl:rotate-180">→</li>
            <li className="text-foreground font-medium truncate">{name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-[var(--surface-alt)]">
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="aspect-[4/5] bg-[var(--border-subtle)] rounded-sm overflow-hidden flex items-center justify-center relative">
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
            <div className="flex flex-col gap-6">
              {tagline && (
                <p className="text-[var(--muted-foreground)] text-xs tracking-[0.25em] uppercase">{tagline}</p>
              )}
              <h1 className="font-display text-3xl md:text-4xl text-[var(--foreground)]">{name}</h1>
              <p className="text-[var(--color-text-muted)] leading-relaxed">{description}</p>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-[var(--surface-muted)] text-[var(--primary)] text-sm rounded-full">
                  {pkg.total_duration_minutes} {isAr ? 'دقيقة' : 'min'}
                </span>
                {typedPkg.max_guests > 1 && (
                  <span className="px-3 py-1 bg-[var(--surface-muted)] text-[var(--primary)] text-sm rounded-full">
                    {isAr ? `${typedPkg.max_guests} ضيوف` : `Up to ${typedPkg.max_guests} guests`}
                  </span>
                )}
              </div>

              {/* Price + CTA */}
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-3xl font-semibold text-[var(--foreground)]">{pkg.price_sar}</span>
                  <span className="text-sm text-[var(--color-text-muted)] ms-1">{isAr ? 'ريال' : 'SAR'}</span>
                </div>
                {isBookable ? (
                  <Link
                    href={`/booking?package=${pkg.slug}`}
                    className="inline-flex items-center justify-center px-8 py-3 bg-[var(--foreground)] text-white text-sm tracking-wide rounded-sm hover:bg-[var(--primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                  >
                    {isAr ? 'احجزي الآن' : 'Book Now'}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center px-8 py-3 bg-[var(--surface-muted)] text-[var(--color-text-muted)] text-sm tracking-wide rounded-sm cursor-not-allowed opacity-80"
                  >
                    {isAr ? 'غير متاح مؤقتًا' : 'Temporarily Unavailable'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-2xl text-[var(--foreground)] mb-8">
            {isAr ? 'يشمل هذا الطقس' : 'What\'s Included'}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {includedServices.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-3 p-4 border border-[var(--border-subtle)] rounded-sm">
                <span className="text-[var(--border-strong)] shrink-0">✦</span>
                <span className="text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
