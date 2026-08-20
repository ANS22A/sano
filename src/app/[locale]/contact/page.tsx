import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return {
    title: t('contact'),
  }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const common = await getTranslations({ locale, namespace: 'common' })
  
  return (
    <main className="min-h-screen pt-32 pb-16 flex flex-col items-center justify-center">
      <section className="container mx-auto px-4 flex flex-col items-center text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-6">{t('contact')}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {locale === 'ar' 
              ? 'نحن متواجدون لخدمتكم على مدار الساعة لمساعدتكم في حجوزاتكم.'
              : 'Our customer service team is available 24/7 to assist you with your booking.'}
          </p>
          
          <div className="bg-surface border border-border/50 p-10 rounded-2xl">
            <p className="text-lg text-foreground font-display mb-6">
              {locale === 'ar' 
                ? 'هل أنت مستعد لتجربتك مع سانو لونا؟'
                : 'Ready for Your SANO LUNA Experience?'}
            </p>
            <Link 
              href={`/${locale}/booking`}
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-300 tracking-wider text-sm uppercase rounded-md shadow-subtle hover:shadow-medium font-medium"
            >
              {common('bookNow')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}