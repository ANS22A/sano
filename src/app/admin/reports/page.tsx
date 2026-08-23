import type { Metadata } from 'next'
import { getOwnerFinancialStats } from '@/app/actions/adminReports.actions'
import { OwnerDashboardClient } from '@/components/admin/dashboard/OwnerDashboardClient'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { requireRole } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'P&L Summary | Reports' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function ReportsSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await requireRole('manager')
  const isAdmin = session.profile.role === 'admin' || session.profile.role === 'super_admin'

  if (!isAdmin) redirect('/admin')

  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const range = (sp.range as string) || 'this_month'
  let start = new Date()
  const end = new Date()

  if (range === 'today') {
    //
  } else if (range === 'this_week') {
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
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

  const ownerStatsResult = await getOwnerFinancialStats(from, to)

  if (ownerStatsResult.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <h2 className="text-lg font-bold mb-2">Financial Data Unavailable</h2>
        <p className="text-sm">{ownerStatsResult.error}</p>
      </div>
    )
  }

  return (
    <OwnerDashboardClient 
      stats={ownerStatsResult.data!} 
      t={t} 
      currentRange={range} 
      from={from} 
      to={to} 
    />
  )
}
