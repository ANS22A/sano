import { requireRole } from '@/lib/admin/auth'
import { getAdminPartners } from '@/app/actions/adminPartners.actions'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Briefcase, Plus } from 'lucide-react'
import Link from 'next/link'
import { adminT, ADMIN_LANG_COOKIE, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'

export default async function PartnersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('admin')
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  const cookieStore = await cookies()
  const lang = (cookieStore.get(ADMIN_LANG_COOKIE)?.value || 'en') as AdminLang
  const t = adminT[lang] as typeof adminT['en']
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const { partners } = await getAdminPartners({ page })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-heading text-foreground">{t.partners.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.partners.manageOwners}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/partners/withdrawals"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            {t.partners.viewWithdrawals}
          </Link>
          <Link
            href="/admin/partners/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.partners.newPartner}
          </Link>
        </div>
      </div>

      {partners.length === 0 ? (
        <AdminEmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title={t.partners.noResults}
          description={t.partners.noResultsDesc}
          action={<Link href="/admin/partners/new" className="h-10 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium">{t.partners.createPartner}</Link>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-sm overflow-hidden">
          <table className="w-full text-sm text-start text-muted-foreground" dir={dir}>
            <thead className="bg-surface-muted text-foreground font-heading font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">{t.partners.name}</th>
                <th className="px-6 py-4">{t.partners.contact}</th>
                <th className="px-6 py-4">{t.partners.ownership}</th>
                <th className="px-6 py-4">{t.partners.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {partners.map(partner => (
                <tr key={partner.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{partner.name}</td>
                  <td className="px-6 py-4">{partner.email || partner.phone || '—'}</td>
                  <td className="px-6 py-4">{partner.ownership_percentage}%</td>
                  <td className="px-6 py-4">{partner.is_active ? t.common.active : t.common.inactive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
