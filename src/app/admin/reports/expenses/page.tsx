/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReportExpenses, getReportPurchases } from '@/app/actions/adminReports.actions'
import { ReportTable } from '@/components/admin/reports/ReportTable'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata = { title: 'Expenses & Purchases Report' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function ExpensesReportPage({
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

  const [expenses, purchases] = await Promise.all([
    getReportExpenses(from, to),
    getReportPurchases(from, to)
  ])

  const expensesColumns = [
    { key: 'date', title: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'category', title: 'Category', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
    { key: 'supplier', title: 'Supplier', render: (_: any, row: any) => row.suppliers?.name || '-', getValue: (row: any) => row.suppliers?.name || '' },
    { key: 'reference', title: 'Reference' },
    { key: 'amount', title: 'Amount (SAR)' },
    { key: 'payment_method', title: 'Method', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  const purchasesColumns = [
    { key: 'date', title: 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'supplier', title: 'Supplier', render: (_: any, row: any) => row.suppliers?.name || '-', getValue: (row: any) => row.suppliers?.name || '' },
    { key: 'reference', title: 'Reference' },
    { key: 'amount', title: 'Amount (SAR)' },
    { key: 'payment_status', title: 'Status', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[#2a2118] mb-4">Operating Expenses</h2>
        <ReportTable 
          data={expenses || []}
          columns={expensesColumns}
          filename="Operating_Expenses"
          currentRange={range}
          from={from}
          to={to}
          t={t}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#2a2118] mb-4">Purchases (COGS / Inventory)</h2>
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


