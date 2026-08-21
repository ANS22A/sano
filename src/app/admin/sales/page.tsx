import type { Metadata } from 'next'
import { getAdminSales } from '@/app/actions/adminSales.actions'
import { SalesListClient } from './SalesListClient'

export const metadata: Metadata = {
  title: 'Sales & Revenue | SANO LUNA Admin',
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const q = sp.q
  const type = sp.type as 'payment' | 'refund' | 'all' | undefined
  const status = sp.status as 'completed' | 'failed' | 'void' | 'all' | undefined
  const source = sp.source as 'booking' | 'direct_sale' | 'admin' | 'all' | undefined
  const paymentMethod = sp.paymentMethod
  const fromDate = sp.fromDate
  const toDate = sp.toDate
  const includeArchived = sp.archived === 'true'

  const { sales, total, totalPayments, totalRefunds, totalRealized } = await getAdminSales({
    page,
    q,
    type,
    status,
    source,
    paymentMethod,
    fromDate,
    toDate,
    includeArchived,
  })

  return (
    <SalesListClient
      sales={sales}
      total={total}
      totalPayments={totalPayments}
      totalRefunds={totalRefunds}
      totalRealized={totalRealized}
      currentPage={page}
      currentQ={q}
      currentType={type}
      currentStatus={status}
      currentSource={source}
      currentPaymentMethod={paymentMethod}
      currentFromDate={fromDate}
      currentToDate={toDate}
      includeArchived={includeArchived}
    />
  )
}
