import { cookies } from 'next/headers'
import Link from 'next/link'
import { getStaffPayrollOverview } from '@/app/actions/adminPayroll.actions'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Employee Payroll Overview | Admin',
}

export default async function StaffPayrollOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]
  const isAr = lang === 'ar'

  const params = await searchParams
  const today = new Date()
  const currentMonth = params.month || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const staffData = await getStaffPayrollOverview(currentMonth)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          {isAr ? 'رواتب الموظفين' : 'Employee Payroll'}
        </h1>
        <div className="flex items-center gap-3">
          {/* Month Selector Form */}
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
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-muted text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">{isAr ? 'الموظف' : 'Employee'}</th>
                <th className="px-6 py-4 font-medium">{isAr ? 'الراتب الأساسي' : 'Base Salary'} (SAR)</th>
                <th className="px-6 py-4 font-medium">{isAr ? 'السلف المخصومة' : 'Advances'} (SAR)</th>
                <th className="px-6 py-4 font-medium">{isAr ? 'صافي الراتب' : 'Net Payable'} (SAR)</th>
                <th className="px-6 py-4 font-medium text-center">{isAr ? 'حالة الدفع' : 'Payment Status'}</th>
                <th className="px-6 py-4 font-medium text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    {t.common.showing.replace('{count}', '0').split(' ')[0]} 0
                  </td>
                </tr>
              ) : (
                staffData.map((staff) => {
                  const salary = staff.salary
                  const baseSalary = Number(staff.base_salary) || 0
                  
                  // if salary generated, use it. else show projected
                  const advances = salary ? Number(salary.advances_deducted) : 0
                  const netPayable = salary ? Number(salary.net_salary) : baseSalary

                  return (
                    <tr key={staff.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {isAr ? staff.name_ar : staff.name_en}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {staff.salary_basis === 'monthly' ? (isAr ? 'شهري' : 'Monthly') : staff.salary_basis}
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {baseSalary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 tabular-nums text-destructive">
                        {advances.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-semibold text-foreground">
                        {netPayable.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {salary ? (
                          <AdminBadge 
                            status={salary.payment_status === 'paid' ? 'confirmed' : 'pending'} 
                            label={salary.payment_status === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'قيد الانتظار' : 'Pending')} 
                          />
                        ) : (
                          <AdminBadge 
                            status="inactive" 
                            label={isAr ? 'غير مصدر' : 'Unissued'} 
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/payroll/staff/${staff.id}?month=${currentMonth}`}
                          className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          {isAr ? 'عرض الراتب' : 'View Payroll'}
                          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
