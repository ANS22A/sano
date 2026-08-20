/**
 * SANO LUNA — Admin Root Layout
 *
 * Independent from the [locale] layout. No public header/footer.
 * Handles: auth session, profile load, admin language from cookie.
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

  // Middleware handles most redirects, but this is an extra layer for SSR safety
  if (!session) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || !profile.is_active) redirect('/admin/login')

  // Admin language from cookie (default: en)
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang

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

