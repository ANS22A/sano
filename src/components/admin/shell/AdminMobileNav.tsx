'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAdmin } from './AdminShell'
import { getNavItems } from '@/lib/admin/permissions'
import {
  LayoutDashboard, CalendarDays, BookOpen, Users,
  BarChart3
} from 'lucide-react'

const MOBILE_NAV = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { key: 'bookings', href: '/admin/bookings', icon: BookOpen },
  { key: 'calendar', href: '/admin/calendar', icon: CalendarDays },
  { key: 'customers', href: '/admin/customers', icon: Users },
  { key: 'reports', href: '/admin/reports', icon: BarChart3 },
] as const

export function AdminMobileNav({ role }: { role: string }) {
  const { t } = useAdmin()
  const pathname = usePathname()
  const visible = getNavItems(role)

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e8ddd0] px-2 py-1 safe-area-pb"
      aria-label="Mobile admin navigation"
    >
      <div className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const { key, href, icon: Icon } = item
          const exact = 'exact' in item ? item.exact : false
          if (!visible[key as keyof typeof visible]) return null
          const active = exact ? pathname === href : pathname.startsWith(href)
          const label = t.nav[key as keyof typeof t.nav]

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0',
                active ? 'text-[#c9a96e]' : 'text-[#9a8a7a] hover:text-[#2a2118]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
