/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReportReceivables } from '@/app/actions/adminReports.actions'
import { ReportTable } from '@/components/admin/reports/ReportTable'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata = { title: 'Accounts Receivable Report' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function ReceivablesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

  const data = await getReportReceivables(from, to)
  const receivables = data.filter((d: any) => d.outstanding_balance > 0)

  const columns = [
    { key: 'booking_number', title: t.reports?.columns?.booking || 'Booking' },
    { key: 'date', title: t.reports?.columns?.date || 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'customer_name', title: t.reports?.columns?.customer || 'Customer' },
    { key: 'price_sar', title: t.reports?.columns?.expected || 'Expected (SAR)' },
    { key: 'amount_paid', title: t.reports?.columns?.paid || 'Paid (SAR)' },
    { key: 'amount_refunded', title: t.reports?.columns?.refunded || 'Refunded (SAR)' },
    { key: 'outstanding_balance', title: t.reports?.columns?.outstanding || 'Outstanding (SAR)', render: (val: number) => <span className="font-bold text-orange-600">{val}</span> },
    { key: 'status', title: t.reports?.columns?.status || 'Status', render: (val: string) => <span className="capitalize">{val}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">{t.ownerDashboard?.aboutReceivables || 'About Accounts Receivable'}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This report shows completed bookings where the net realized sales (payments minus refunds) is less than the expected booking price. Overpayments on one booking do not offset the balance of another.
        </p>
      </div>

      <ReportTable 
        data={receivables}
        columns={columns}
        filename="Accounts_Receivable"
        currentRange={range}
        from={from}
        to={to}
        t={t}
      />
    </div>
  )
}



