'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAdmin } from './AdminShell'
import { getNavItems } from '@/lib/admin/permissions'
import {
  LayoutDashboard, CalendarDays, BookOpen, Package2,
  Users, UserCheck, MapPin, Clock, BarChart3, X,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { key: 'bookings', href: '/admin/bookings', icon: BookOpen },
      { key: 'calendar', href: '/admin/calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'services', href: '/admin/services', icon: Package2 },
      { key: 'customers', href: '/admin/customers', icon: Users },
      { key: 'staff', href: '/admin/staff', icon: UserCheck },
      { key: 'locations', href: '/admin/locations', icon: MapPin },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'reports', href: '/admin/reports', icon: BarChart3 },
      { key: 'settings', href: '/admin/settings', icon: Clock },
    ],
  },
] as const

interface Props {
  role: string
  mobileOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ role, mobileOpen, onClose }: Props) {
  const { t } = useAdmin()
  const pathname = usePathname()
  const visible = getNavItems(role)

  function isActive(href: string, exact = false) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen bg-[#2a2118] text-white">
        <SidebarContent t={t} visible={visible} isActive={isActive} />
      </aside>

      {/* Mobile sidebar (slide-over) */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex flex-col w-72 bg-[#2a2118] text-white',
          'transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full rtl:translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <LogoMark />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent t={t} visible={visible} isActive={isActive} onClose={onClose} />
      </aside>
    </>
  )
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#c9a96e] flex items-center justify-center shrink-0">
        <span className="text-[#2a2118] text-xs font-bold tracking-wider">SL</span>
      </div>
      <div>
        <p className="text-white text-sm font-semibold tracking-wide">SANO LUNA</p>
        <p className="text-white/40 text-xs">Administration</p>
      </div>
    </div>
  )
}

function SidebarContent({
  t, visible, isActive, onClose,
}: {
  t: ReturnType<typeof useAdmin>['t']
  visible: ReturnType<typeof getNavItems>
  isActive: (href: string, exact?: boolean) => boolean
  onClose?: () => void
}) {
  const navLabels = t.nav

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Logo — desktop only */}
      <div className="p-5 border-b border-white/10 hidden lg:block">
        <LogoMark />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6" aria-label="Admin navigation">
        {NAV_GROUPS.map((group) => {
          const groupVisibleItems = group.items.filter(
            (item) => visible[item.key as keyof typeof visible]
          )

          if (groupVisibleItems.length === 0) return null

          return (
            <div key={group.label} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2 text-start">
                {group.label}
              </h3>
              {groupVisibleItems.map((item) => {
                const { key, href, icon: Icon } = item
                const exact = 'exact' in item ? item.exact : false
                const active = isActive(href, exact)
                const label = navLabels[key as keyof typeof navLabels]

                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-[#c9a96e] text-[#2a2118] shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1 rtl:hover:-translate-x-1'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <p className="text-xs text-white/25 text-center">SANO LUNA © 2026</p>
      </div>
    </div>
  )
}
