import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, CalendarX, UserCheck, MapPin } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { requireRole } from '@/lib/admin/auth'

export const metadata: Metadata = { title: 'Settings' }

export default async function AdminSettingsPage() {
  await requireRole('manager')
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const settingsCards = [
    {
      title: t.nav.businessHours,
      description: lang === 'ar' ? 'إدارة أوقات العمل العامة لكل فرع' : 'Manage general business hours per location',
      icon: Clock,
      href: '/admin/settings/business-hours',
    },
    {
      title: t.nav.blackoutDates,
      description: lang === 'ar' ? 'تحديد أيام الإغلاق والعطلات' : 'Configure holidays and closed dates',
      icon: CalendarX,
      href: '/admin/settings/blackout-dates',
    },
    {
      title: t.nav.staff,
      description: lang === 'ar' ? 'إدارة أعضاء الفريق ومواعيد توفرهم' : 'Manage staff members and availability',
      icon: UserCheck,
      href: '/admin/staff',
    },
    {
      title: t.nav.locations,
      description: lang === 'ar' ? 'إدارة بيانات فروع سانو لونا' : 'Manage SANO LUNA locations',
      icon: MapPin,
      href: '/admin/locations',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.nav.settings}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === 'ar' 
            ? 'إدارة إعدادات النظام، والفروع، وأوقات العمل.' 
            : 'Manage system settings, locations, and schedules.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {settingsCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col p-6 bg-white rounded-2xl border border-border hover:border-accent hover:shadow-medium transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300 mb-4 shrink-0 shadow-sm border border-border group-hover:border-accent">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">{card.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{card.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
