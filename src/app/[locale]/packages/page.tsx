import type { Metadata } from 'next'
import { packages } from '@/data/content.data'
import { PackageCard } from '@/components/packages/PackageCard'
import { Link } from '@/i18n/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'الباقات — سانو لونا' : 'Packages — SANO LUNA',
    description: isAr
      ? 'باقات العناية الفاخرة من سانو لونا — تجارب متكاملة في زيارة واحدة.'
      : 'SANO LUNA luxury wellness packages — complete experiences in a single visit.',
  }
}

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isAr = locale === 'ar'
  const activePackages = packages.filter((p) => p.is_active)

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[var(--surface)]">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <p className="text-[var(--muted-foreground)] text-sm tracking-[0.2em] uppercase mb-4 font-medium">
            {isAr ? 'تجارب متكاملة' : 'Complete Experiences'}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--foreground)] mb-6">
            {isAr ? 'الباقات' : 'Packages'}
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto text-lg leading-relaxed">
            {isAr
              ? 'باقات مُصمَّمة بعناية تجمع أفضل علاجاتنا في زيارة واحدة متكاملة.'
              : 'Curated packages combining our finest treatments into one seamless visit.'}
          </p>
        </div>
      </section>

      {/* Package Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activePackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="container mx-auto px-6 max-w-xl text-center">
          <p className="text-[var(--color-text-muted)] mb-6">
            {isAr
              ? 'هل تبحثين عن خدمة مفردة؟'
              : 'Looking for a single service?'}
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[var(--primary)] border border-[var(--border)] px-6 py-3 rounded-sm hover:bg-[var(--surface-muted)] transition-colors text-sm tracking-wide"
          >
            {isAr ? 'استعرض الخدمات' : 'Browse Services'}
          </Link>
        </div>
      </section>
    </main>
  )
}