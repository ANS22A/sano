import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminServices } from '@/app/actions/adminServices.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminPagination } from '@/components/admin/ui/AdminPagination'
import { AdminSearchBar } from '@/components/admin/ui/AdminSearchBar'
import { Package2, Plus } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Services' }

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const { services, total } = await getAdminServices({
    page: Number(sp.page ?? 1),
    q: sp.q,
    active: sp.active,
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#2a2118]">{t.services.title}</h1>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2118] text-white text-sm font-medium hover:bg-[#3a3128] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t.services.new}
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <AdminSearchBar placeholder={t.services.search} paramName="q" />
        </div>
        {['all', 'true', 'false'].map((a) => (
          <Link key={a} href={`/admin/services?active=${a}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              (sp.active ?? 'all') === a ? 'bg-[#2a2118] text-white border-[#2a2118]' : 'bg-white text-[#7a6a57] border-[#e8ddd0] hover:bg-[#f5ede0]'
            }`}
          >
            {a === 'all' ? t.common.all : a === 'true' ? t.common.active : t.common.inactive}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        {services.length === 0 ? (
          <AdminEmptyState icon={<Package2 className="w-6 h-6" />} title={t.services.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  {[t.services.nameEn, t.services.category, t.services.price, t.services.duration, t.services.active, t.common.actions].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-[#9a8a7a] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-[#faf7f4] transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2a2118]">{s.name_en}</p>
                      <p className="text-xs text-[#9a8a7a]">{s.name_ar}</p>
                    </td>
                    <td className="px-4 py-3 text-[#7a6a57] text-xs">
                      {(s.service_categories as { name_en: string } | null)?.name_en ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#2a2118] font-medium">{Number(s.price_sar).toLocaleString()} SAR</td>
                    <td className="px-4 py-3 text-[#7a6a57]">{s.duration_minutes} {t.common.min}</td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={s.is_active ? 'active' : 'inactive'}
                        label={s.is_active ? t.common.active : t.common.inactive}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/services/${s.id}/edit`} className="text-xs font-medium text-[#c9a96e] hover:underline">
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
      <AdminPagination total={total} perPage={25} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
    </div>
  )
}
