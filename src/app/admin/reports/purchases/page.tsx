
import { getReportPurchases } from '@/app/actions/adminReports.actions'
import { ReportTable, type Column } from '@/components/admin/reports/ReportTable'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata = { title: 'Purchases Report' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function PurchasesReportPage({
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

  const purchases = await getReportPurchases(from, to)

  const purchasesColumns: Column[] = [
    { key: 'date', title: t.reports.columns.date, type: 'date' },
    { key: 'supplier', title: t.reports.columns.supplier, nestedPath: ['suppliers', 'name'] },
    { key: 'reference', title: t.reports.columns.reference },
    { key: 'amount', title: t.reports.columns.amount },
    { key: 'payment_status', title: t.reports.columns.status, type: 'status' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard.purchasesCogs}</h2>
        <ReportTable 
          data={purchases || []}
          columns={purchasesColumns}
          filename="Purchases"
          currentRange={range}
          from={from}
          to={to}
          t={t}
        />
      </div>
    </div>
  )
}
