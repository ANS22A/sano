import { getAdminPackages } from '@/app/actions/adminPackages.actions'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import Link from 'next/link'

export const metadata = { title: 'Manage Packages' }

export default async function AdminPackagesPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const packages = await getAdminPackages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Packages</h1>
        <Link 
          href="/admin/packages/new"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          Add Package
        </Link>
      </div>

      <div className="rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name (EN)</th>
                <th className="px-4 py-3 font-medium">Name (AR)</th>
                <th className="px-4 py-3 font-medium">Price (SAR)</th>
                <th className="px-4 py-3 font-medium">Duration (Min)</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{pkg.name_en}</td>
                  <td className="px-4 py-3 text-foreground">{pkg.name_ar}</td>
                  <td className="px-4 py-3 text-foreground">{pkg.price_sar}</td>
                  <td className="px-4 py-3 text-foreground">{pkg.total_duration_minutes}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/packages/${pkg.id}/edit`} className="text-accent hover:underline">
                      {t.common?.edit || 'Edit'}
                    </Link>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No packages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
