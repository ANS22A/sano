import type { Metadata } from 'next'
import { getAdminSuppliers } from '@/app/actions/adminSuppliers.actions'
import { PurchaseForm } from '../PurchaseForm'

export const metadata: Metadata = {
  title: 'Record Purchase | SANO LUNA Admin',
}

export default async function NewPurchasePage() {
  const { suppliers } = await getAdminSuppliers({ activeOnly: true })

  return <PurchaseForm suppliers={suppliers} />
}
