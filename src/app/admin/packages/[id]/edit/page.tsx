import { getAdminPackageById } from '@/app/actions/adminPackages.actions'
import { getAdminServices } from '@/app/actions/adminServices.actions'
import { PackageForm, PackageData } from '@/components/admin/packages/PackageForm'
import { requireRole } from '@/lib/admin/auth'

export const metadata = {
  title: 'Edit Package',
}

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin')
  
  const { id } = await params
  
  const pkg = await getAdminPackageById(id)
  const { services } = await getAdminServices({ active: 'true', page: 1 })
  
  return <PackageForm initialData={pkg as PackageData} availableServices={services} />
}
