import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminPurchaseById } from '@/app/actions/adminPurchases.actions'
import { getAdminSuppliers } from '@/app/actions/adminSuppliers.actions'
import { PurchaseForm } from '../../PurchaseForm'

export const metadata: Metadata = {
  title: 'Edit Purchase | SANO LUNA Admin',
}

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [purchase, { suppliers }] = await Promise.all([
    getAdminPurchaseById(id),
    getAdminSuppliers({ activeOnly: false }),
  ])

  if (!purchase) {
    notFound()
  }

  return <PurchaseForm purchase={purchase} suppliers={suppliers} isEdit />
}
