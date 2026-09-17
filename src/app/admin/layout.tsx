/**
 * SANO LUNA — Admin Root Layout
 *
 * Independent from the [locale] layout. No public header/footer.
 * Handles: auth session, profile load, admin language from cookie.
 *
 * Security: Layer 2 defense-in-depth. Even if middleware is bypassed,
 * this layout verifies the user has an active admin profile before
 * rendering any admin content. The login page is the only exception.
 */
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import { AdminShell } from '@/components/admin/shell/AdminShell'
import type { AdminLang } from '@/lib/admin/translations'
import { Cinzel, Montserrat, Cairo, Tajawal } from 'next/font/google'
import '../globals.css'

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const

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

  // Determine current path to allow the login page through
  const headersList = await headers()
  const pathname = headersList.get('x-next-pathname') ?? headersList.get('x-invoke-path') ?? ''
  const isLoginPage = pathname === '/admin/login' || pathname.endsWith('/admin/login')

  // If no session exists, only allow the login page to render.
  // All other admin routes redirect to login (Layer 2 defense).
  if (!session) {
    if (isLoginPage) {
      return (
        <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
          <head>
            <meta charSet="utf-8" />
          </head>
          <body className="h-full bg-background text-foreground">
            {children}
          </body>
        </html>
      )
    }
    redirect('/admin/login')
  }
  
  const profile = session.profile

  // Layer 2: verify the profile has a valid admin role
  if (!profile || !profile.is_active || !ADMIN_ROLES.includes(profile.role as typeof ADMIN_ROLES[number])) {
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`h-full antialiased ${cinzel.variable} ${montserrat.variable} ${cairo.variable} ${tajawal.variable}`}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="h-full bg-background text-foreground">
        <AdminShell profile={profile} lang={lang}>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}

