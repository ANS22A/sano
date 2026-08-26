import type { Metadata } from 'next'
import { PartnerForm } from '@/components/admin/partners/PartnerForm'
import { getAdminPartner } from '@/app/actions/adminPartners.actions'
import { adminT, ADMIN_LANG_COOKIE, type AdminLang } from '@/lib/admin/translations'
import { cookies } from 'next/headers'
import { requireRole } from '@/lib/admin/auth'

export const metadata: Metadata = { title: 'Edit Partner' }

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin')
  const { id } = await params
  const partner = await getAdminPartner(id)
  
  const cookieStore = await cookies()
  const lang = (cookieStore.get(ADMIN_LANG_COOKIE)?.value || 'en') as AdminLang
  const t = adminT[lang] as typeof adminT['en']
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return <PartnerForm partner={partner} t={t} dir={dir} />
}
