import { requireRole } from '@/lib/admin/auth'
import { getAdminAdvances } from '@/app/actions/adminPayroll.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Banknote, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdvancesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('manager')
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  
  const { advances } = await getAdminAdvances({ page })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-light text-foreground">Employee Advances</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage employee cash advances.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/payroll"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Back to Payroll
          </Link>
          <Link
            href="/admin/payroll/advances/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Advance
          </Link>
        </div>
      </div>

      {advances.length === 0 ? (
        <AdminEmptyState
          icon={<Banknote className="w-8 h-8" />}
          title="No advances found"
          description="Record an employee advance to see it here."
          action={<Link href="/admin/payroll/advances/new" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-white text-sm font-medium">Record Advance</Link>}
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left rtl:text-right text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-900 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {advances.map(advance => (
                <tr key={advance.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{advance.employee_id}</td>
                  <td className="px-6 py-4">{advance.amount} SAR</td>
                  <td className="px-6 py-4">{new Date(advance.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{advance.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
