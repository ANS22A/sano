import { getAdminPackageById } from '@/app/actions/adminPackages.actions'
import { getAdminServices } from '@/app/actions/adminServices.actions'
import { PackageForm, PackageData } from '@/components/admin/packages/PackageForm'

export const metadata = {
  title: 'Edit Package',
}

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const pkg = await getAdminPackageById(id)
  // Load ALL services (not just active) so admin can see inactive service relationships
  const { services } = await getAdminServices({ page: 1 })
  
  return <PackageForm initialData={pkg as PackageData} availableServices={services} />
}
