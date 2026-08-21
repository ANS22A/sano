import type { Metadata } from 'next'
import { SupplierForm } from '../SupplierForm'

export const metadata: Metadata = {
  title: 'Add Supplier | SANO LUNA Admin',
}

export default function NewSupplierPage() {
  return <SupplierForm />
}
