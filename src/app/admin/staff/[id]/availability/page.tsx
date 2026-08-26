import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminStaffById } from '@/app/actions/adminStaff.actions'
import { ArrowLeft } from 'lucide-react'

import { adminT, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'

export const metadata: Metadata = { title: 'Staff Availability' }

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default async function StaffAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]
  const isAr = lang === 'ar'
  const DAYS = isAr ? DAYS_AR : DAYS_EN

  const { id } = await params
  const { staff, availability } = await getAdminStaffById(id)
  if (!staff) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/staff" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {isAr ? 'العودة' : 'Back to Staff'}
      </Link>

      <h1 className="text-xl font-bold text-foreground">
        {isAr ? staff.name_ar || staff.name_en : staff.name_en} — {t.staff.availability}
      </h1>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {availability.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {isAr ? 'لم يتم إعداد أوقات توفر لهذا العضو.' : 'No availability configured for this staff member.'}
          </p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {availability.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm font-medium text-foreground">{DAYS[a.day_of_week ?? 0]}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {a.start_time?.slice(0, 5)} — {a.end_time?.slice(0, 5)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_active ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground'}`}>
                    {a.is_active ? t.common.active : t.common.inactive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
