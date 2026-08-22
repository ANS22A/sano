import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LayoutDashboard, User, Calendar, LogOut } from 'lucide-react'
import { customerSignOut } from '@/app/actions/customerAuth.actions'

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect(`/${locale}/login`)
  }

  const t = await getTranslations('account')
  const isAr = locale === 'ar'

  const navItems = [
    { href: `/${locale}/account`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/account/profile`, label: t('profile'), icon: User },
    { href: `/${locale}/account/bookings`, label: t('bookings'), icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pt-[80px]" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-e border-subtle p-6 flex flex-col gap-2 shrink-0">
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold text-foreground font-serif tracking-wide">{t('accountSettings')}</h2>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary font-medium hover:bg-surface transition-colors"
            >
              <item.icon className="w-5 h-5 text-[#A98FB8]" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign Out Button using Server Action inside a Form */}
        <div className="mt-8 border-t border-subtle pt-4">
          <form action={async () => {
            'use server'
            await customerSignOut()
            redirect(`/${locale}/login`)
          }}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors text-start"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              {t('logout')}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
