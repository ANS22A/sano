import type { Metadata } from 'next'
import { getAdminStaff } from '@/app/actions/adminLocations.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import Link from 'next/link'
import { UserCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Staff' }

export default async function AdminStaffPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]
  const staff = await getAdminStaff()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#2a2118]">{t.staff.title}</h1>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        {staff.length === 0 ? (
          <AdminEmptyState icon={<UserCheck className="w-6 h-6" />} title={t.staff.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf7f4] border-b border-[#e8ddd0]">
                  {['Name (EN)', 'Name (AR)', 'Active', 'Actions'].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-[#9a8a7a]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8de]">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-[#faf7f4] transition-colors group">
                    <td className="px-4 py-3 font-medium text-[#2a2118]">{s.name_en}</td>
                    <td className="px-4 py-3 text-[#7a6a57]" dir="rtl">{s.name_ar}</td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={s.is_active ? 'active' : 'inactive'}
                        label={s.is_active ? t.common.active : t.common.inactive}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/staff/${s.id}/availability`} className="text-xs font-medium text-[#c9a96e] hover:underline">
                        {t.staff.availability}
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
