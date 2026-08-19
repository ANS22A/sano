'use client'

import { useState, createContext, useContext } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AdminMobileNav } from './AdminMobileNav'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import type { Tables } from '@/types/database.types'

// ─── Context ────────────────────────────────────────────────────────────────

interface AdminContext {
  lang: AdminLang
  t: typeof adminT['en']
  profile: Tables<'profiles'>
  dir: 'ltr' | 'rtl'
}

const AdminCtx = createContext<AdminContext | null>(null)

export function useAdmin() {
  const ctx = useContext(AdminCtx)
  if (!ctx) throw new Error('useAdmin must be used inside AdminShell')
  return ctx
}

// ─── Shell ───────────────────────────────────────────────────────────────────

interface AdminShellProps {
  profile: Tables<'profiles'>
  lang: AdminLang
  children: React.ReactNode
}

export function AdminShell({ profile, lang, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = adminT[lang] as typeof adminT['en']
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <AdminCtx.Provider value={{ lang, t, profile, dir }}>
      <div className={`flex h-full min-h-screen ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Desktop sidebar */}
        <AdminSidebar
          role={profile.role}
          onClose={() => setSidebarOpen(false)}
          mobileOpen={sidebarOpen}
        />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <AdminHeader
            profile={profile}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <AdminMobileNav role={profile.role} />
      </div>
    </AdminCtx.Provider>
  )
}
