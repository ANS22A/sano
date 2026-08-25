/* eslint-disable @typescript-eslint/no-explicit-any */
export function PrintableStatement({
  staff,
  salary,
  advances,
  month,
  isAr,
}: {
  staff: any
  salary: any
  advances: any[]
  month: string
  isAr: boolean
}) {
  const baseSalary = Number(staff.base_salary) || 0
  const totalAdvances = salary 
    ? Number(salary.advances_deducted) 
    : advances.reduce((sum, adv) => sum + (adv.status === 'approved' ? Number(adv.amount) : 0), 0)
  const netPayable = salary ? Number(salary.net_salary) : Math.max(0, baseSalary - totalAdvances)

  return (
    <div className="hidden print:block w-full text-black p-8 bg-white font-sans text-sm" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">SANO LUNA</h1>
          <p className="text-muted-foreground mt-1">{isAr ? 'مسير الرواتب' : 'Payroll Statement'}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-foreground">{isAr ? 'فترة الراتب:' : 'Payroll Period:'} {month}</p>
          <p className="text-muted-foreground mt-1">{isAr ? 'تاريخ الإصدار:' : 'Issue Date:'} {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b border-border-subtle pb-2 mb-4">{isAr ? 'بيانات الموظف' : 'Employee Information'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-xs uppercase">{isAr ? 'اسم الموظف' : 'Employee Name'}</p>
            <p className="font-semibold text-base">{isAr ? staff.name_ar : staff.name_en}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">{isAr ? 'رقم الموظف' : 'Employee ID'}</p>
            <p className="font-semibold text-base">{staff.id.split('-')[0].toUpperCase()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">{isAr ? 'المنصب' : 'Position'}</p>
            <p className="font-semibold text-base">{staff.slug}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">{isAr ? 'نظام الراتب' : 'Salary Basis'}</p>
            <p className="font-semibold text-base">{staff.salary_basis}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold border-b border-border-subtle pb-2 mb-4">{isAr ? 'الملخص المالي' : 'Financial Summary'}</h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>{isAr ? 'الراتب الأساسي' : 'Base Salary'}</span>
            <span>{baseSalary.toFixed(2)} SAR</span>
          </div>
          <div className="flex justify-between text-error">
            <span>{isAr ? 'إجمالي السلف' : 'Total Advances'}</span>
            <span>- {totalAdvances.toFixed(2)} SAR</span>
          </div>
          <div className="flex justify-between text-error">
            <span>{isAr ? 'خصومات أخرى' : 'Other Deductions'}</span>
            <span>- 0.00 SAR</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-border">
            <span>{isAr ? 'صافي الراتب المستحق' : 'Net Payable'}</span>
            <span>{netPayable.toFixed(2)} SAR</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {advances.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold border-b border-border-subtle pb-2 mb-4">{isAr ? 'حركات السلف للفترة' : 'Period Transactions (Advances)'}</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2">{isAr ? 'التاريخ' : 'Date'}</th>
                <th className="py-2">{isAr ? 'المرجع' : 'Reference'}</th>
                <th className="py-2">{isAr ? 'النوع' : 'Type'}</th>
                <th className="py-2 text-right">{isAr ? 'المبلغ' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody>
              {advances.map(adv => (
                <tr key={adv.id} className="border-b border-border-subtle">
                  <td className="py-2">{adv.date}</td>
                  <td className="py-2 text-muted-foreground font-mono text-xs">{adv.reference}</td>
                  <td className="py-2">{isAr ? 'سلفة' : 'Advance'}</td>
                  <td className="py-2 text-right text-error">- {Number(adv.amount).toFixed(2)} SAR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Footer */}
      <div className="mt-12 text-center text-muted-foreground text-xs border-t border-border-subtle pt-4">
        {salary ? (
          <p>
            {isAr ? 'حالة الدفع:' : 'Payment Status:'} {salary.payment_status.toUpperCase()} 
            {salary.payment_date && ` - ${salary.payment_date}`}
          </p>
        ) : (
          <p>{isAr ? 'مسير غير مصدر بعد' : 'Salary Statement Not Yet Generated'}</p>
        )}
        <p className="mt-1">Generated by SANO LUNA Management System</p>
      </div>
    </div>
  )
}
