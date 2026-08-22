import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LOCALE_DIRECTION } from '@/types/ui.types'
import { generateSiteMetadata } from '@/lib/metadata'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/types/ui.types'
import { Cinzel, Montserrat, Cairo, Tajawal } from 'next/font/google'
import '../globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display-en',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-body-en',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-display-ar',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-body-ar',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return generateSiteMetadata({ locale: locale as Locale })
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const dir = LOCALE_DIRECTION[locale as Locale]
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <html lang={locale} dir={dir} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
      <body className="flex min-h-full flex-col bg-background text-foreground overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          {/* Global Header — sticky, state-aware */}
          <Header isAuthenticated={isAuthenticated} />

          {/* Main content — flex-1 fills remaining space */}
          <main id="main-content" className="flex-1 flex flex-col min-h-0">
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          {/* Global Footer — server rendered */}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
