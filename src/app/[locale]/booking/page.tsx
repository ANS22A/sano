import type { Metadata } from 'next'
import { BookingShell } from '@/components/booking/BookingShell'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'حجز — سانو لونا' : 'Book — SANO LUNA',
    description: isAr
      ? 'احجزي تجربتك في سانو لونا — خطوات بسيطة نحو لحظتك من العناية الفاخرة.'
      : 'Book your SANO LUNA experience — a few steps to your moment of luxury care.',
    robots: { index: false }, // Booking page should not be indexed
  }
}

interface BookingPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ service?: string; package?: string }>
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { locale } = await params
  const { service, package: packageSlug } = await searchParams
  const isAr = locale === 'ar'

  return (
    <main className="min-h-screen" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <section className="pt-28 pb-6 bg-[var(--color-sand-50)] border-b border-[var(--border-subtle)]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className={isAr ? 'text-right' : 'text-left'}>
            <p className="text-[var(--color-sand-500)] text-xs tracking-[0.2em] uppercase mb-2 font-medium">
              SANO LUNA
            </p>
            <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-sand-900)]">
              {isAr ? 'احجزي تجربتك' : 'Book Your Experience'}
            </h1>
            <p className="text-[var(--color-text-muted)] mt-2 text-sm">
              {isAr
                ? 'خطوات بسيطة نحو لحظتك من العناية'
                : 'A few steps to your moment of care'}
            </p>
          </div>
        </div>
      </section>

      {/* Booking flow */}
      <section className="bg-white py-8">
        <BookingShell
          initialServiceSlug={service ?? null}
          initialPackageSlug={packageSlug ?? null}
        />
      </section>
    </main>
  )
}