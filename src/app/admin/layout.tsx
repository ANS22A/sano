/**
 * SANO LUNA — Admin Root Layout
 *
 * Independent from the [locale] layout. No public header/footer.
 * Handles: auth session, profile load, admin language from cookie.
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/admin/auth'
import { AdminShell } from '@/components/admin/shell/AdminShell'
import type { AdminLang } from '@/lib/admin/translations'
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

export const metadata: Metadata = {
  title: { template: '%s — SANO LUNA Admin', default: 'SANO LUNA Admin' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  // Admin language from cookie (default: en)
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang

  // If no session exists (e.g. on /admin/login) or profile is inactive, render children without AdminShell.
  // Protected pages and middleware enforce authentication separately.
  if (!session) {
    return (
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
        <body className="h-full bg-background text-foreground">
          {children}
        </body>
      </html>
    )
  }
  
  const profile = session.profile

  if (!profile || !profile.is_active) {
    return (
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
        <body className="h-full bg-background text-foreground">
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
      <body className="h-full bg-background text-foreground">
        <AdminShell profile={profile} lang={lang}>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}

