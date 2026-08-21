import type { Metadata } from 'next'
import { getAdminPurchases } from '@/app/actions/adminPurchases.actions'
import { getAdminSuppliers } from '@/app/actions/adminSuppliers.actions'
import { PurchasesListClient } from './PurchasesListClient'

export const metadata: Metadata = {
  title: 'Purchases | SANO LUNA Admin',
}

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const q = sp.q
  const supplierId = sp.supplierId
  const paymentStatus = sp.paymentStatus
  const paymentMethod = sp.paymentMethod
  const fromDate = sp.fromDate
  const toDate = sp.toDate
  const includeArchived = sp.archived === 'true'

  const [{ purchases, total, totalAmount }, { suppliers }] = await Promise.all([
    getAdminPurchases({
      page,
      q,
      supplierId,
      paymentStatus,
      paymentMethod,
      fromDate,
      toDate,
      includeArchived,
    }),
    getAdminSuppliers({ activeOnly: false }),
  ])

  return (
    <PurchasesListClient
      purchases={purchases}
      total={total}
      totalAmount={totalAmount}
      suppliers={suppliers}
      currentPage={page}
      currentQ={q}
      currentSupplierId={supplierId}
      currentPaymentStatus={paymentStatus}
      currentPaymentMethod={paymentMethod}
      currentFromDate={fromDate}
      currentToDate={toDate}
      includeArchived={includeArchived}
    />
  )
}
