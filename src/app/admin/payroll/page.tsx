import { requireRole } from '@/lib/admin/auth'
import { getAdminPayroll } from '@/app/actions/adminPayroll.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Banknote, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PayrollPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('admin')
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  
  const { salaries } = await getAdminPayroll({ page })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-light text-[#2E1F38]">Payroll</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage employee salaries and bonuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/payroll/advances"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Employee Advances
          </Link>
          <Link
            href="/admin/payroll/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-[#2E1F38] text-white text-sm font-medium hover:bg-[#6F4E7C] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Payroll
          </Link>
        </div>
      </div>

      {salaries.length === 0 ? (
        <AdminEmptyState
          icon={<Banknote className="w-8 h-8" />}
          title="No payroll records found"
          description="Start managing employee salaries."
          action={<Link href="/admin/payroll/new" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-[#2E1F38] text-white text-sm font-medium">Create Payroll</Link>}
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left rtl:text-right text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-900 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Staff</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {salaries.map(salary => (
                <tr key={salary.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{salary.reference}</td>
                  <td className="px-6 py-4">{salary.staff?.name_en || 'Unknown'}</td>
                  <td className="px-6 py-4">{salary.month}</td>
                  <td className="px-6 py-4 text-right">{salary.net_salary.toLocaleString('en-SA', { style: 'currency', currency: 'SAR' })}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
                      salary.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      salary.payment_status === 'void' ? 'bg-neutral-100 text-neutral-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {salary.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
