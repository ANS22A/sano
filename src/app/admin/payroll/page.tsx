import { requireRole } from '@/lib/admin/auth'
import { getAdminPayroll, toggleArchiveSalary } from '@/app/actions/adminPayroll.actions'
import { adminT, ADMIN_LANG_COOKIE, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Banknote, Plus } from 'lucide-react'
import Link from 'next/link'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { PayrollListClient } from './PayrollListClient'

export default async function PayrollPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  await requireRole('admin')
  
  const cookieStore = await cookies()
  const lang = (cookieStore.get(ADMIN_LANG_COOKIE)?.value || 'en') as AdminLang
  const t = adminT[lang] as typeof adminT['en']
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
  const archivedStatus = (resolvedParams.archivedStatus || 'active') as 'active' | 'archived' | 'all'
  
  const { salaries, count, totalPages } = await getAdminPayroll({ page, archivedStatus })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">{t.payroll.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.payroll.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/payroll/advances"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-foreground bg-surface-muted hover:bg-surface-elevated transition-colors border border-border"
          >
            {t.payroll.employeeAdvances}
          </Link>
          <Link
            href="/admin/payroll/new"
            className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.payroll.newPayroll}
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <Link
          href="?archivedStatus=active"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${archivedStatus === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t.common.active}
        </Link>
        <Link
          href="?archivedStatus=archived"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${archivedStatus === 'archived' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t.payroll.archived}
        </Link>
        <Link
          href="?archivedStatus=all"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${archivedStatus === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t.common.all}
        </Link>
      </div>

      {salaries.length === 0 ? (
        <AdminEmptyState
          icon={<Banknote className="w-8 h-8" />}
          title={t.payroll.noRecordsFound}
          description={t.payroll.noRecordsDesc}
          action={<Link href="/admin/payroll/new" className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-medium">{t.payroll.newPayroll}</Link>}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <PayrollListClient salaries={salaries} t={t} lang={lang} />
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-end">
          <AdminPagination total={count} />
        </div>
      )}
    </div>
  )
}
