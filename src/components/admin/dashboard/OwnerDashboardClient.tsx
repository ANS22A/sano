'use client'

import { useRouter } from 'next/navigation'
import { StatCard } from './StatCard'
import { DollarSign, Activity, Users, ShoppingCart, CalendarDays, Wallet, Percent, ArrowDownRight, CreditCard } from 'lucide-react'
import type { OwnerFinancialStats } from '@/app/actions/adminReports.actions'

interface Props {
  stats: OwnerFinancialStats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: Record<string, any>
  currentRange: string
  from: string
  to: string
}

export function OwnerDashboardClient({ stats, t, currentRange, from, to }: Props) {
  const router = useRouter()

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'custom') {
      // Just keep current for now, custom could be expanded later
      return
    }
    router.push(`/admin?range=${val}`)
  }

  const profitMargin = stats.realized_revenue > 0 
    ? ((stats.net_operating_profit / stats.realized_revenue) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-[20px] border border-[#e8ddd0] shadow-sm">
        <label className="text-sm font-medium text-[#2a2118]">{t.ownerDashboard.dateRange}</label>
        <select 
          value={currentRange}
          onChange={handleRangeChange}
          className="bg-transparent border border-[#e8ddd0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#c9a96e]"
        >
          <option value="today">{t.ownerDashboard.today}</option>
          <option value="this_week">{t.ownerDashboard.thisWeek}</option>
          <option value="this_month">{t.ownerDashboard.thisMonth}</option>
          <option value="this_year">{t.ownerDashboard.thisYear}</option>
          <option value="all_time">All Time</option>
        </select>
        {currentRange === 'custom' && (
          <div className="text-sm text-[#9a8a7a]">
            {from} - {to}
          </div>
        )}
      </div>

      {/* Primary Financial KPIs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#2a2118]">{t.ownerDashboard.title} - Financials</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.ownerDashboard.realizedRevenue}
            value={`${Number(stats.realized_revenue).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<DollarSign className="w-5 h-5" />}
            accent
          />
          <StatCard
            title={t.ownerDashboard.operatingExpenses}
            value={`${Number(stats.operating_expenses).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<ArrowDownRight className="w-5 h-5" />}
          />
          <StatCard
            title={t.ownerDashboard.purchases}
            value={`${Number(stats.purchases).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatCard
            title={t.ownerDashboard.salariesPaid}
            value={`${Number(stats.salaries_paid).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<Users className="w-5 h-5" />}
          />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title={t.ownerDashboard.netOperatingProfit}
            value={`${Number(stats.net_operating_profit).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<Activity className="w-5 h-5" />}
            accent
          />
          <StatCard
            title={t.ownerDashboard.partnerWithdrawals}
            value={`${Number(stats.partner_withdrawals).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard
            title={t.ownerDashboard.netCashMovement}
            value={`${Number(stats.net_cash_movement).toLocaleString()} {t.common?.sar || 'SAR'}`}
            icon={<CreditCard className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Revenue Comparison & Profit Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          title={t.ownerDashboard.expectedRevenue}
          value={`${Number(stats.expected_revenue).toLocaleString()} {t.common?.sar || 'SAR'}`}
          subtitle="{t.ownerDashboard?.fromBookings || 'From Bookings'}"
          icon={<DollarSign className="w-5 h-5 text-gray-400" />}
        />
        <StatCard
          title={t.ownerDashboard.outstandingBalance}
          value={`${Number(stats.outstanding_balance).toLocaleString()} {t.common?.sar || 'SAR'}`}
          icon={<Activity className="w-5 h-5 text-orange-400" />}
        />
        <StatCard
          title={t.ownerDashboard.profitMargin}
          value={`${profitMargin}%`}
          icon={<Percent className="w-5 h-5" />}
          accent
        />
      </div>

      {/* Booking & Customer KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t.ownerDashboard.bookingsTotal}
          value={stats.bookings_total}
          icon={<CalendarDays className="w-5 h-5" />}
        />
        <StatCard
          title={t.ownerDashboard.completed}
          value={stats.bookings_completed}
        />
        <StatCard
          title={t.ownerDashboard.pending}
          value={stats.bookings_pending}
        />
        <StatCard
          title={t.ownerDashboard.cancelled}
          value={stats.bookings_cancelled}
        />
        <StatCard
          title={t.ownerDashboard.totalCustomers}
          value={stats.customer_count}
          icon={<Users className="w-5 h-5" />}
          accent
        />
      </div>
    </div>
  )
}

