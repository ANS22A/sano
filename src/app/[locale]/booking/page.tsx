import type { Metadata } from 'next'
import { BookingShell } from '@/components/booking/BookingShell'
import { getAllServices } from '@/services/catalog.service'

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

  // Fetch all active services on the server
  const services = await getAllServices()

  return (
    <main className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <section className="pt-32 pb-10 bg-gradient-to-b from-surface-lavender/80 via-surface-warm to-background border-b border-border-subtle relative overflow-hidden">
        {/* Glow ornament */}
        <div 
          className="absolute top-0 end-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-start">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-accent text-xs">✦</span>
              <p className="text-accent text-xs tracking-[0.25em] uppercase font-semibold">
                SANO LUNA · AT-HOME WELLNESS
              </p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground font-light tracking-tight">
              {isAr ? 'احجزي تجربتك الفاخرة' : 'Book Your Luxury Experience'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl">
              {isAr
                ? 'خطوات بسيطة نحو لحظتك من الاسترخاء والسكينة في راحة منزلك'
                : 'A few effortless steps to your moment of tranquil care and pure wellness'}
            </p>
          </div>
        </div>
      </section>

      {/* Booking flow */}
      <section className="bg-surface-warm/40 py-10 min-h-[70vh]">
        <BookingShell
          initialServiceSlug={service ?? null}
          initialPackageSlug={packageSlug ?? null}
          services={services}
        />
      </section>
    </main>
  )
}