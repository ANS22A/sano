'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/admin/login/actions'
import { useAdmin } from './AdminShell'
import { Menu, LogOut, Globe } from 'lucide-react'
import type { Tables } from '@/types/database.types'

interface Props {
  profile: Tables<'profiles'>
  onMenuClick: () => void
}

export function AdminHeader({ profile, onMenuClick }: Props) {
  const { t, lang } = useAdmin()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  // Generate page title from pathname
  const pageTitle = getPageTitle(pathname, t.nav)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:px-6 gap-4 shadow-subtle">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-lg font-heading font-semibold text-foreground tracking-wide truncate">
        {pageTitle}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <LanguageToggle currentLang={lang} />

        {/* User avatar + name */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-foreground text-xs font-bold">
              {(profile.full_name || profile.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-foreground leading-tight truncate max-w-32">
              {profile.full_name || profile.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground bg-surface-muted border border-border
            hover:bg-surface-elevated hover:text-foreground disabled:opacity-50 transition-all duration-200 ms-2"
          aria-label={t.nav.signOut}
        >
          {isPending ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:block">{t.nav.signOut}</span>
        </button>
      </div>
    </header>
  )
}

function LanguageToggle({ currentLang }: { currentLang: string }) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    startTransition(async () => {
      await fetch('/api/admin/lang', {
        method: 'POST',
        body: JSON.stringify({ lang: newLang }),
        headers: { 'Content-Type': 'application/json' },
      })
      window.location.reload()
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground bg-surface-muted
        hover:bg-surface-elevated hover:text-foreground disabled:opacity-50 transition-all duration-200 border border-border"
      title="Switch language"
    >
      {isPending ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <Globe className="w-3.5 h-3.5" />
      )}
      <span>{currentLang === 'en' ? 'العربية' : 'English'}</span>
    </button>
  )
}

function getPageTitle(pathname: string, nav: Record<string, string>): string {
  if (pathname === '/admin') return nav.dashboard
  if (pathname.startsWith('/admin/bookings')) return nav.bookings
  if (pathname.startsWith('/admin/calendar')) return nav.calendar
  if (pathname.startsWith('/admin/services')) return nav.services
  if (pathname.startsWith('/admin/gift-cards')) return nav.giftCards ?? 'Gift Cards'
  if (pathname.startsWith('/admin/customers')) return nav.customers
  if (pathname.startsWith('/admin/staff')) return nav.staff
  if (pathname.startsWith('/admin/locations')) return nav.locations
  if (pathname.startsWith('/admin/sales')) return nav.sales
  if (pathname.startsWith('/admin/expenses')) return nav.expenses
  if (pathname.startsWith('/admin/purchases')) return nav.purchases
  if (pathname.startsWith('/admin/suppliers')) return nav.suppliers
  if (pathname.startsWith('/admin/partners')) return nav.partners
  if (pathname.startsWith('/admin/payroll')) return nav.payroll
  if (pathname.startsWith('/admin/settings')) return nav.settings
  if (pathname.startsWith('/admin/reports')) return nav.reports
  return 'Admin'
}
