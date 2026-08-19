import type { Metadata } from 'next'
import { CalendarDays, DollarSign, Clock, XCircle, CheckCircle } from 'lucide-react'
import { getDashboardStats, getRecentBookings } from '@/app/actions/adminDashboard.actions'
import { StatCard } from '@/components/admin/dashboard/StatCard'
import { RecentBookings } from '@/components/admin/dashboard/RecentBookings'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { requireRole } from '@/lib/admin/auth'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  await requireRole('manager')
  const [stats, recentBookings, cookieStore] = await Promise.all([
    getDashboardStats(),
    getRecentBookings(10),
    cookies(),
  ])

  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  // eslint-disable-next-line react-hooks/purity
  const today = new Date(Date.now() + 3 * 60 * 60 * 1000)
    .toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-[#2a2118]">{t.dashboard.title}</h1>
        <p className="text-sm text-[#9a8a7a] mt-0.5">{today}</p>
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
          value={`${stats.todayRevenue.toLocaleString()} ${t.common.sar}`}
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
