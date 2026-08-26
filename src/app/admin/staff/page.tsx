import type { Metadata } from 'next'
import { getAdminStaff } from '@/app/actions/adminStaff.actions'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { StaffFormWrapper } from '@/components/admin/ui/StaffFormWrapper'
import Link from 'next/link'
import { UserCheck } from 'lucide-react'
import { cookies } from 'next/headers'
import { adminT, type AdminLang, ADMIN_DIR } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Staff' }

export default async function AdminStaffPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const dir = ADMIN_DIR[lang]
  const t = adminT[lang]
  const staff = await getAdminStaff()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">{t.staff.title}</h1>
        <StaffFormWrapper t={t} dir={dir} />
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {staff.length === 0 ? (
          <AdminEmptyState icon={<UserCheck className="w-6 h-6" />} title={t.staff.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {[
                    lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)', 
                    lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)', 
                    lang === 'ar' ? 'الحالة' : 'Active', 
                    lang === 'ar' ? 'الإجراءات' : 'Actions'
                  ].map((h) => (
                    <th key={h} className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-surface transition-colors group">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name_en}</td>
                    <td className="px-4 py-3 text-muted-foreground" dir="rtl">{s.name_ar}</td>
                    <td className="px-4 py-3">
                      <AdminBadge
                        status={s.is_active ? 'active' : 'inactive'}
                        label={s.is_active ? t.common.active : t.common.inactive}
                      />
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Link href={`/admin/staff/${s.id}/availability`} className="text-xs font-medium text-accent hover:underline">
                        {t.staff.availability}
                      </Link>
                      <StaffFormWrapper t={t} dir={dir} staff={{ id: s.id, name_en: s.name_en, name_ar: s.name_ar, bio_en: s.bio_en, bio_ar: s.bio_ar, slug: s.slug, image_url: s.image_url }} variant="icon" />
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
