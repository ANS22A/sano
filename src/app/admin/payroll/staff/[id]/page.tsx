/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEmployeePayrollDetails } from '@/app/actions/adminPayroll.actions'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ArrowLeft, ArrowRight, Wallet, ReceiptText, FileMinus2 } from 'lucide-react'
import { PayrollClient } from './PayrollClient'
import { PrintableStatement } from '@/components/admin/payroll/PrintableStatement'

export const metadata = {
  title: 'Employee Payroll | Admin',
}

export default async function EmployeePayrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string }>
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]
  const isAr = lang === 'ar'

  const resolvedParams = await params
  const { id } = resolvedParams
  const resolvedSearchParams = await searchParams

  const today = new Date()
  const currentMonth = resolvedSearchParams.month || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  let data
  try {
    data = await getEmployeePayrollDetails(id, currentMonth)
  } catch (error) {
    notFound()
  }

  const { staff, salary, advances } = data

  const baseSalary = Number(staff.base_salary) || 0
  
  // calculation
  const totalAdvances = salary 
    ? Number(salary.advances_deducted) 
    : advances.reduce((sum, adv) => sum + (adv.status === 'approved' ? Number(adv.amount) : 0), 0)
    
  const netPayable = salary ? Number(salary.net_salary) : Math.max(0, baseSalary - totalAdvances)

  const isGenerated = !!salary

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/admin/payroll/staff" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {isAr ? 'العودة للموظفين' : 'Back to Staff'}
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {isAr ? staff.name_ar : staff.name_en}
              {isGenerated && (
                <AdminBadge 
                  status={salary.payment_status === 'paid' ? 'confirmed' : 'pending'} 
                  label={salary.payment_status === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'قيد الانتظار' : 'Pending')} 
                />
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <form className="flex items-center gap-2">
              <input 
                type="month" 
                name="month" 
                defaultValue={currentMonth}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  e.target.form?.submit()
                }}
              />
            </form>
            
            <PayrollClient staffId={staff.id} month={currentMonth} salary={salary} />
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">{isAr ? 'الراتب الأساسي' : 'Base Salary'}</span>
            </div>
            <div className="text-2xl font-bold">{baseSalary.toFixed(2)}</div>
          </div>
          
          <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-destructive">
              <FileMinus2 className="w-4 h-4" />
              <span className="text-sm font-medium">{isAr ? 'إجمالي السلف' : 'Total Advances'}</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              - {totalAdvances.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileMinus2 className="w-4 h-4" />
              <span className="text-sm font-medium">{isAr ? 'خصومات أخرى' : 'Other Deductions'}</span>
            </div>
            <div className="text-2xl font-bold">
              - 0.00
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-2xl border border-primary/20 shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <ReceiptText className="w-4 h-4" />
              <span className="text-sm font-medium">{isAr ? 'صافي الراتب المستحق' : 'Net Payable'}</span>
            </div>
            <div className="text-2xl font-bold text-primary">{netPayable.toFixed(2)}</div>
          </div>
        </div>

        {/* Transactions / Advances Table */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-muted/30">
            <h2 className="text-lg font-semibold">{isAr ? 'العمليات والسلف' : 'Transactions & Advances'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">{t.reports?.columns?.date || 'Date'}</th>
                  <th className="px-6 py-4 font-medium">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="px-6 py-4 font-medium">{t.reports?.columns?.reference || 'Reference'}</th>
                  <th className="px-6 py-4 font-medium">{t.reports?.columns?.amount || 'Amount'} (SAR)</th>
                  <th className="px-6 py-4 font-medium text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {advances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      {isAr ? 'لا توجد حركات لهذه الفترة' : 'No transactions found for this period'}
                    </td>
                  </tr>
                ) : (
                  advances.map((adv) => (
                    <tr key={adv.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-4">{adv.date}</td>
                      <td className="px-6 py-4 font-medium">{isAr ? 'سلفة' : 'Advance'}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{adv.reference}</td>
                      <td className="px-6 py-4 tabular-nums text-destructive">
                        - {Number(adv.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AdminBadge 
                          status={adv.status} 
                          label={
                            adv.status === 'approved' ? (isAr ? 'معتمد' : 'Approved') :
                            adv.status === 'settled' ? (isAr ? 'تمت التسوية' : 'Settled') :
                            adv.status === 'void' ? (isAr ? 'ملغى' : 'Void') : adv.status
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PrintableStatement 
        staff={staff}
        salary={salary}
        advances={advances}
        month={currentMonth}
        isAr={isAr}
      />
    </>
  )
}
