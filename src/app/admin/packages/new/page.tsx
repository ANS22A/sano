import { getAdminServices } from '@/app/actions/adminServices.actions'
import { PackageForm } from '@/components/admin/packages/PackageForm'
import { requireRole } from '@/lib/admin/auth'

export const metadata = {
  title: 'New Package',
}

export default async function NewPackagePage() {
  await requireRole('admin')
  
  // We need all active services for the dropdown
  const { services } = await getAdminServices({ active: 'true', page: 1 })
  
  return <PackageForm availableServices={services} />
}
