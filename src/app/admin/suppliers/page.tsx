import type { Metadata } from 'next'
import { getAdminSuppliers } from '@/app/actions/adminSuppliers.actions'
import { SuppliersListClient } from './SuppliersListClient'

export const metadata: Metadata = {
  title: 'Suppliers | SANO LUNA Admin',
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const q = sp.q
  const activeOnly = sp.active === 'true'

  const { suppliers, total } = await getAdminSuppliers({
    page,
    q,
    activeOnly,
  })

  return (
    <SuppliersListClient
      suppliers={suppliers}
      total={total}
      currentPage={page}
      currentQ={q}
      currentActiveOnly={activeOnly}
    />
  )
}
