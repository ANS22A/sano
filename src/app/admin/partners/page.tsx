import { requireRole } from '@/lib/admin/auth'
import { getAdminPartners } from '@/app/actions/adminPartners.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Briefcase, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('admin')
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  
  const { partners } = await getAdminPartners({ page })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-light text-foreground">Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage owners and equity distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/partners/withdrawals"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-muted transition-colors"
          >
            View Withdrawals
          </Link>
          <Link
            href="/admin/partners/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Partner
          </Link>
        </div>
      </div>

      {partners.length === 0 ? (
        <AdminEmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No partners found"
          description="Get started by creating your first partner profile."
          action={<Link href="/admin/partners/new" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-white text-sm font-medium">Create Partner</Link>}
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left rtl:text-right text-muted-foreground">
            <thead className="bg-muted text-foreground font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Ownership</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {partners.map(partner => (
                <tr key={partner.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{partner.name}</td>
                  <td className="px-6 py-4">{partner.email || partner.phone || '—'}</td>
                  <td className="px-6 py-4">{partner.ownership_percentage}%</td>
                  <td className="px-6 py-4">{partner.is_active ? 'Active' : 'Archived'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
