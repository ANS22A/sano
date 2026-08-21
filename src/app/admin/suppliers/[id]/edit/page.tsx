import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminSupplierById } from '@/app/actions/adminSuppliers.actions'
import { SupplierForm } from '../../SupplierForm'

export const metadata: Metadata = {
  title: 'Edit Supplier | SANO LUNA Admin',
}

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supplier = await getAdminSupplierById(id)

  if (!supplier) {
    notFound()
  }

  return <SupplierForm supplier={supplier} isEdit />
}
