import { requireRole } from '@/lib/admin/auth'
import { getAdminPartnerWithdrawals } from '@/app/actions/adminPartners.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { CreditCard, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function WithdrawalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('admin')
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  
  const { withdrawals } = await getAdminPartnerWithdrawals({ page })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-light text-foreground">Withdrawals</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage partner withdrawals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/partners"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Back to Partners
          </Link>
          <Link
            href="/admin/partners/withdrawals/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Withdrawal
          </Link>
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <AdminEmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="No withdrawals found"
          description="Record a partner withdrawal to see it here."
          action={<Link href="/admin/partners/withdrawals/new" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-white text-sm font-medium">Record Withdrawal</Link>}
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left rtl:text-right text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-900 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {withdrawals.map(withdrawal => (
                <tr key={withdrawal.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{withdrawal.partners?.name}</td>
                  <td className="px-6 py-4">{withdrawal.amount} SAR</td>
                  <td className="px-6 py-4">{new Date(withdrawal.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{withdrawal.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
