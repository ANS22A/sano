import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPackages } from '@/app/actions/adminPackages.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { TogglePackageButton } from '@/components/admin/packages/TogglePackageButton'
import { Package, Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Packages' }

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const packages = await getAdminPackages({ active: sp.active })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{t.packages.title}</h1>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.packages.new}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {['all', 'true', 'false'].map((a) => (
          <Link key={a} href={`/admin/packages?active=${a}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              (sp.active ?? 'all') === a ? 'bg-primary text-white border-primary' : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
            }`}
          >
            {a === 'all' ? t.common.all : a === 'true' ? t.common.active : t.common.inactive}
          </Link>
        ))}
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {packages.length === 0 ? (
          <AdminEmptyState
            icon={<Package className="w-8 h-8 opacity-50" />}
            title={t.packages.noResults}
            action={
              <Link href="/admin/packages/new" className="text-primary hover:underline">
                {t.packages.new}
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.packages.nameEn}</th>
                  <th className="px-4 py-3 font-medium">{t.packages.nameAr}</th>
                  <th className="px-4 py-3 font-medium text-right">{t.packages.price}</th>
                  <th className="px-4 py-3 font-medium text-center">{t.services.duration}</th>
                  <th className="px-4 py-3 font-medium text-center">{t.services.title}</th>
                  <th className="px-4 py-3 font-medium text-center">{t.packages.active}</th>
                  <th className="px-4 py-3 font-medium text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{pkg.name_en}</td>
                    <td className="px-4 py-3 font-medium" dir="rtl">{pkg.name_ar}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground/80">
                      {pkg.price_sar.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {pkg.total_duration_minutes} {t.common.min}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {pkg.package_services?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminBadge 
                        status={pkg.is_active ? 'active' : 'inactive'} 
                        label={pkg.is_active ? t.common.active : t.common.inactive}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 sm:gap-2">
                        <Link
                          href={`/admin/packages/${pkg.id}/edit`}
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          {t.common.edit}
                        </Link>
                        <TogglePackageButton id={pkg.id} isActive={pkg.is_active} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

