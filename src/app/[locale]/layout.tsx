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
import '../globals.css'

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
    <html lang={locale} dir={dir} className="h-full antialiased">
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
