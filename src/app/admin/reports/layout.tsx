import { requireRole } from '@/lib/admin/auth'
import { ReportsNavigation } from '@/components/admin/reports/ReportsNavigation'
import { adminT, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('manager')
  const isAdmin = session.profile.role === 'admin' || session.profile.role === 'super_admin'

  if (!isAdmin) {
    redirect('/admin') // Managers not allowed in financial reports
  }

  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2a2118]">{t.nav?.reports || 'Reports'}</h1>
      </div>
      <ReportsNavigation t={t} />
      <div>
        {children}
      </div>
    </div>
  )
}
