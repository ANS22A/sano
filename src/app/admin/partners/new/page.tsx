import type { Metadata } from 'next'
import { PartnerForm } from '@/components/admin/partners/PartnerForm'
import { adminT, ADMIN_LANG_COOKIE, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'
import { requireRole } from '@/lib/admin/auth'

export const metadata: Metadata = { title: 'New Partner' }

export default async function NewPartnerPage() {
  await requireRole('admin')
  const cookieStore = await cookies()
  const lang = (cookieStore.get(ADMIN_LANG_COOKIE)?.value || 'en') as AdminLang
  const t = adminT[lang] as typeof adminT['en']
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return <PartnerForm t={t} dir={dir} />
}
