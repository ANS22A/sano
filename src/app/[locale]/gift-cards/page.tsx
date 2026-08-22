import { GiftCardPurchaseClient } from '@/components/gift-cards/GiftCardPurchaseClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isAr = locale === 'ar'
  return {
    title: isAr ? 'بطاقات الإهداء — سانو لونا' : 'Gift Cards — SANO LUNA',
    description: isAr
      ? 'أهدي من تحبين لحظات من السكينة والرفاهية مع باقات وجلسات سانو لونا المنزلية الفاخرة.'
      : 'Gift your loved ones moments of pure tranquility and wellness with SANO LUNA home spa experiences.',
  }
}

export default async function GiftCardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <main className="min-h-screen pt-28 pb-16">
      <GiftCardPurchaseClient locale={locale} />
    </main>
  )
}
