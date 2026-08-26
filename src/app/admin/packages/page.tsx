import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPackages } from '@/app/actions/adminPackages.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { Package, Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Packages' }

export default async function AdminPackagesPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const packages = await getAdminPackages()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{t.packages.title}</h1>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.packages.new}
        </Link>
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
                    <td className="px-4 py-3 text-center">
                      <AdminBadge 
                        status={pkg.is_active ? 'active' : 'inactive'} 
                        label={pkg.is_active ? t.common.yes : t.common.no}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/packages/${pkg.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        {t.common.edit}
                      </Link>
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
