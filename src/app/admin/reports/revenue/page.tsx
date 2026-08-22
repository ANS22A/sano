/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReportSales } from '@/app/actions/adminReports.actions'
import { ReportTable } from '@/components/admin/reports/ReportTable'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata = { title: 'Revenue Report' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function RevenueReportPage({
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

  const data = await getReportSales(from, to)

  const columns = [
    { key: 'created_at', title: 'Date', render: (val: string) => new Date(val).toLocaleString(), getValue: (row: any) => new Date(row.created_at).toLocaleString() },
    { key: 'booking', title: 'Booking', render: (_: any, row: any) => row.bookings?.booking_number || '-', getValue: (row: any) => row.bookings?.booking_number || '' },
    { key: 'customer', title: 'Customer', render: (_: any, row: any) => (row.bookings?.customers?.full_name || '-'), getValue: (row: any) => (row.bookings?.customers?.full_name || '') },
    { key: 'type', title: 'Type', render: (val: string) => <span className="capitalize">{val}</span> },
    { key: 'amount', title: 'Amount (SAR)', render: (val: number, row: any) => <span className={row.type === 'refund' ? 'text-red-600' : 'text-green-600'}>{row.type === 'refund' ? '-' : ''}{val}</span>, getValue: (row: any) => row.type === 'refund' ? -row.amount : row.amount },
    { key: 'payment_method', title: 'Method', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
    { key: 'source', title: 'Source', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  return (
    <div className="space-y-6">
      <ReportTable 
        data={data || []}
        columns={columns}
        filename="Revenue_Report"
        currentRange={range}
        from={from}
        to={to}
        t={t}
      />
    </div>
  )
}



