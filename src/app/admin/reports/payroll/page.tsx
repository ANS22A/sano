
import { getReportPayroll } from '@/app/actions/adminReports.actions'
import { ReportTable, type Column } from '@/components/admin/reports/ReportTable'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata = { title: 'Payroll & Withdrawals Report' }

function getRiyadhDate(d: Date) {
  return new Date(d.getTime() + 3 * 60 * 60 * 1000)
}

function getRiyadhDateString(d: Date) {
  return getRiyadhDate(d).toISOString().slice(0, 10)
}

export default async function PayrollReportPage({
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

  const { salaries, withdrawals } = await getReportPayroll(from, to)

  const salaryColumns: Column[] = [
    { key: 'payment_date', title: t.reports.columns.paymentDate, type: 'date' },
    { key: 'month', title: t.reports.columns.month, type: 'capitalize-replace' },
    { key: 'staff', title: t.reports.columns.employee, nestedPath: ['staff', 'name_en'], fallbackPath: ['staff', 'name_ar'] },
    { key: 'gross_salary', title: t.reports.columns.grossSalary },
    { key: 'bonuses', title: t.reports.columns.bonuses },
    { key: 'advances_deducted', title: t.reports.columns.advancesDeducted },
    { key: 'other_deductions', title: t.reports.columns.otherDeductions },
    { key: 'net_salary', title: t.reports.columns.netSalary },
    { key: 'payment_status', title: t.reports.columns.status, type: 'status' },
  ]

  const withdrawalColumns: Column[] = [
    { key: 'date', title: t.reports.columns.date, type: 'date' },
    { key: 'partner', title: t.reports.columns.partner, nestedPath: ['partners', 'name'] },
    { key: 'reference', title: t.reports.columns.reference },
    { key: 'amount', title: t.reports.columns.amount },
    { key: 'status', title: t.reports.columns.status, type: 'status' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard.salariesPaidTitle}</h2>
        <ReportTable 
          data={salaries || []}
          columns={salaryColumns}
          filename="Payroll"
          currentRange={range}
          from={from}
          to={to}
          t={t}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard.partnerWithdrawalsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.ownerDashboard.partnerWithdrawalsNote}</p>
        <ReportTable 
          data={withdrawals || []}
          columns={withdrawalColumns}
          filename="Partner_Withdrawals"
          currentRange={range}
          from={from}
          to={to}
          t={t}
        />
      </div>
    </div>
  )
}



