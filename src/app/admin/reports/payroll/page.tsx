/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReportPayroll } from '@/app/actions/adminReports.actions'
import { ReportTable } from '@/components/admin/reports/ReportTable'
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

  const salaryColumns = [
    { key: 'payment_date', title: t.reports?.columns?.paymentDate || 'Payment Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'month', title: t.reports?.columns?.month || 'Salary Month', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
    { key: 'staff', title: t.reports?.columns?.employee || 'Employee', render: (_: any, row: any) => row.staff?.name || '-', getValue: (row: any) => row.staff?.name || '' },
    { key: 'gross_salary', title: t.reports?.columns?.grossSalary || 'Gross (SAR)' },
    { key: 'bonuses', title: t.reports?.columns?.bonuses || 'Bonuses' },
    { key: 'advances_deducted', title: t.reports?.columns?.advancesDeducted || 'Advances Ded.' },
    { key: 'other_deductions', title: t.reports?.columns?.otherDeductions || 'Other Ded.' },
    { key: 'net_salary', title: t.reports?.columns?.netSalary || 'Net (SAR)' },
    { key: 'payment_status', title: t.reports?.columns?.status || 'Status', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  const withdrawalColumns = [
    { key: 'date', title: t.reports?.columns?.date || 'Date', render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'partner', title: t.reports?.columns?.partner || 'Partner', render: (_: any, row: any) => row.partners?.name || '-', getValue: (row: any) => row.partners?.name || '' },
    { key: 'reference', title: t.reports?.columns?.reference || 'Reference' },
    { key: 'amount', title: t.reports?.columns?.amount || 'Amount (SAR)' },
    { key: 'status', title: t.reports?.columns?.status || 'Status', render: (val: string) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard?.salariesPaidTitle || 'Salaries Paid'}</h2>
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
        <h2 className="text-lg font-bold text-foreground mb-4">{t.ownerDashboard?.partnerWithdrawalsTitle || 'Partner Withdrawals (Capital Distributions)'}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.ownerDashboard?.partnerWithdrawalsNote || 'Note: Partner withdrawals are equity distributions and are not classified as operating expenses.'}</p>
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



