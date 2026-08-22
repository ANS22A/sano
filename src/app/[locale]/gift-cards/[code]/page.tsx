import { getTranslations } from 'next-intl/server'
import { getPublicGiftCardDetails } from '@/app/actions/giftCards.actions'
import { PublicGiftCardClient } from '@/components/gift-cards/PublicGiftCardClient'
import { generateSiteMetadata } from '@/lib/metadata'
import type { Locale } from '@/types/ui.types'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, code: string }> }) {
  const { locale } = await params
  await getTranslations({ locale, namespace: 'metadata' })
  
  return generateSiteMetadata({
    locale: locale as Locale,
    title: locale === 'ar' ? 'كرت الإهداء | SANO LUNA' : 'Gift Card | SANO LUNA',
    description: locale === 'ar' ? 'عرض كرت الإهداء الخاص بك من سانولونا' : 'View your SANO LUNA Gift Card',
  })
}

export default async function PublicGiftCardPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}) {
  const { locale, code } = await params
  
  // Clean the code string
  const decodedCode = decodeURIComponent(code).trim().toUpperCase()

  // Fetch gift card details securely server-side
  const { success, error, giftCard } = await getPublicGiftCardDetails(decodedCode, locale)

  if (!success || !giftCard) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-border p-8 rounded-xl shadow-medium">
          <div className="w-16 h-16 mx-auto bg-surface-muted rounded-full flex items-center justify-center text-primary mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-h3 mb-4">{locale === 'ar' ? 'تعذر عرض الكرت' : 'Cannot View Gift Card'}</h1>
          <p className="text-body-muted mb-8">{error || (locale === 'ar' ? 'رمز غير صالح.' : 'Invalid code.')}</p>
          <a href={`/${locale}`} className="btn btn-primary btn-md">
            {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Homepage'}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface py-12 md:py-24">
      <div className="container-sl-narrow">
        <PublicGiftCardClient giftCard={giftCard} locale={locale} />
      </div>
    </div>
  )
}
