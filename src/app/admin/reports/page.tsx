import type { Metadata } from 'next'
import { getAdminReports } from '@/app/actions/adminReports.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { BarChart3, TrendingUp, CalendarDays, CheckCircle, XCircle } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Reports' }

// Default date range: last 30 days
function getDefaultRange() {
  const riyadhOffset = 3 * 60 * 60 * 1000
  const now = new Date(Date.now() + riyadhOffset)
  const to = now.toISOString().slice(0, 10)
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const from = past.toISOString().slice(0, 10)
  return { from, to }
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const { from, to } = sp.from && sp.to ? { from: sp.from, to: sp.to } : getDefaultRange()
  const report = await getAdminReports({ from, to })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#2a2118]">{t.reports.title}</h1>
        <div className="text-sm text-[#7a6a57] bg-white px-4 py-2 rounded-xl border border-[#e8ddd0]">
          {from} — {to}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`${report.totalRevenue.toLocaleString()} SAR`} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Total Bookings" value={report.totalBookings} icon={<CalendarDays className="w-5 h-5" />} />
        <StatCard title="Completed" value={report.completed} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard title="Cancelled" value={report.cancelled} icon={<XCircle className="w-5 h-5" />} />
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e8de]">
          <h2 className="text-sm font-semibold text-[#2a2118]">Top Services by Volume</h2>
        </div>
        {report.topServices.length === 0 ? (
          <AdminEmptyState icon={<BarChart3 className="w-6 h-6" />} title="No data for this period" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  <th className="text-start px-6 py-3 text-xs font-medium text-[#9a8a7a]">Service</th>
                  <th className="text-start px-6 py-3 text-xs font-medium text-[#9a8a7a]">Bookings</th>
                  <th className="text-start px-6 py-3 text-xs font-medium text-[#9a8a7a]">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {report.topServices.map((s) => (
                  <tr key={s.name} className="hover:bg-[#faf7f4] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#2a2118]">{s.name}</td>
                    <td className="px-6 py-4 text-[#7a6a57]">{s.count}</td>
                    <td className="px-6 py-4 text-[#7a6a57]">{s.revenue.toLocaleString()} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e8ddd0]">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs font-medium text-[#9a8a7a] uppercase tracking-wide">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-[#f5ede0] text-[#c9a96e] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[#2a2118] tracking-tight">{value}</p>
    </div>
  )
}
