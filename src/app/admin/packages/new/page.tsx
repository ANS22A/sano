import { getAdminServices } from '@/app/actions/adminServices.actions'
import { PackageForm } from '@/components/admin/packages/PackageForm'

export const metadata = {
  title: 'New Package',
}

export default async function NewPackagePage() {
  // Load ALL services (not just active) so admin can see inactive ones in dropdown
  const { services } = await getAdminServices({ page: 1 })
  
  return <PackageForm availableServices={services} />
}
