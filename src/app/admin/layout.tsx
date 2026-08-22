/**
 * SANO LUNA — Admin Root Layout
 *
 * Independent from the [locale] layout. No public header/footer.
 * Handles: auth session, profile load, admin language from cookie.
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/shell/AdminShell'
import type { AdminLang } from '@/lib/admin/translations'
import '../globals.css'

export const metadata: Metadata = {
  title: { template: '%s — SANO LUNA Admin', default: 'SANO LUNA Admin' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Admin language from cookie (default: en)
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang

  // If no session exists (e.g. on /admin/login), render children without AdminShell.
  // Protected pages and middleware enforce authentication separately.
  if (!session) {
    return (
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-full antialiased">
        <body className="h-full bg-background text-foreground">
          {children}
        </body>
      </html>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || !profile.is_active) {
    return (
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-full antialiased">
        <body className="h-full bg-background text-foreground">
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="h-full antialiased">
      <body className="h-full bg-background text-foreground">
        <AdminShell profile={profile} lang={lang}>
          {children}
        </AdminShell>
      </body>
    </html>
  )
}

