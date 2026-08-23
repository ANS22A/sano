/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReportExpenses } from '@/app/actions/adminReports.actions'
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

  const expenses = await getReportExpenses(from, to)

  const expensesColumns = [
    { key: 'date', title: t.reports?.columns?.date || 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'category', title: t.reports?.columns?.category || 'Category', render: (_: any, row: any) => row.expense_categories?.name_en || row.expense_categories?.name_ar || '-', getValue: (row: any) => row.expense_categories?.name_en || row.expense_categories?.name_ar || '' },
    { key: 'supplier', title: t.reports?.columns?.supplier || 'Supplier', render: () => '-', getValue: () => '' },
    { key: 'reference', title: t.reports?.columns?.reference || 'Reference' },
    { key: 'amount', title: t.reports?.columns?.amount || 'Amount (SAR)' },
    { key: 'payment_method', title: t.reports?.columns?.method || 'Method', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard?.operatingExpensesTitle || 'Operating Expenses'}</h2>
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
    </div>
  )
}



