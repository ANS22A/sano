import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import type { AdminLang } from '@/lib/admin/translations'
import { getAdminGiftCards, getAdminGiftCardStats } from '@/app/actions/adminGiftCards.actions'
import { AdminGiftCardsClient } from './AdminGiftCardsClient'

export const metadata: Metadata = { title: 'Gift Cards | Admin' }

export default async function AdminGiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang

  const page = Number(sp.page ?? 1)
  const q = sp.q ?? ''
  const status = sp.status ?? 'all'

  const [{ giftCards, total }, stats] = await Promise.all([
    getAdminGiftCards({ page, q, status }),
    getAdminGiftCardStats(),
  ])

  return (
    <AdminGiftCardsClient
      giftCards={giftCards}
      total={total}
      stats={stats}
      lang={lang}
      q={q}
      status={status}
    />
  )
}
