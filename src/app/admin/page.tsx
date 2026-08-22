import type { Metadata } from 'next'
import { CalendarDays, DollarSign, Clock, XCircle, CheckCircle } from 'lucide-react'
import { getDashboardStats, getRecentBookings } from '@/app/actions/adminDashboard.actions'
import { getOwnerFinancialStats } from '@/app/actions/adminReports.actions'
import { StatCard } from '@/components/admin/dashboard/StatCard'
import { RecentBookings } from '@/components/admin/dashboard/RecentBookings'
import { OwnerDashboardClient } from '@/components/admin/dashboard/OwnerDashboardClient'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { requireRole } from '@/lib/admin/auth'

export const metadata: Metadata = { title: 'Dashboard' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await requireRole('manager')
  const isAdmin = session.profile.role === 'admin' || session.profile.role === 'super_admin'

  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const todayStr = getRiyadhDate(new Date()).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  if (isAdmin) {
    const sp = await searchParams
    const range = (sp?.range as string) || 'this_month'
    let start = new Date()
    const end = new Date()

    if (range === 'today') {
      // already today
    } else if (range === 'this_week') {
      const day = start.getDay() // 0 is Sunday
      const diff = start.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
      start.setDate(diff)
    } else if (range === 'this_month') {
      start.setDate(1)
    } else if (range === 'this_year') {
      start.setMonth(0, 1)
    } else if (range === 'all_time') {
      start = new Date('2020-01-01')
    }

    const from = getRiyadhDateString(start)
    const to = getRiyadhDateString(end)

    const ownerStats = await getOwnerFinancialStats(from, to)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-[#9a8a7a] mt-0.5">{todayStr}</p>
        </div>
        
        <OwnerDashboardClient 
          stats={ownerStats} 
          t={t} 
          currentRange={range} 
          from={from} 
          to={to} 
        />
      </div>
    )
  }

  // Manager Dashboard
  const [stats, recentBookings] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(10),
  ])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="text-sm text-[#9a8a7a] mt-0.5">{todayStr}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title={t.dashboard.todayBookings}
          value={stats.todayCount}
          icon={<CalendarDays className="w-5 h-5" />}
          accent
        />
        <StatCard
          title={t.dashboard.totalRevenue}
          value={`${stats.todayRevenue.toLocaleString()} ${t.common?.sar ?? 'SAR'}`}
          subtitle={t.dashboard.today}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title={t.dashboard.pendingBookings}
          value={stats.pendingCount}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          title={t.dashboard.cancelledBookings}
          value={stats.cancelledCount}
          subtitle="This month"
          icon={<XCircle className="w-5 h-5" />}
        />
        <StatCard
          title={t.dashboard.completedBookings}
          value={stats.completedCount}
          subtitle="This month"
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      {/* Recent bookings */}
      <RecentBookings
        bookings={recentBookings}
        t={{
          recentBookings: t.dashboard.recentBookings,
          noBookings: t.dashboard.noBookings,
          bookingNumber: t.bookings.bookingNumber,
          customer: t.bookings.customer,
          service: t.bookings.service,
          date: t.bookings.date,
          status: t.bookings.status,
          price: t.bookings.price,
        }}
      />
    </div>
  )
}
