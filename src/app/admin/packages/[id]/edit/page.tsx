import { PackageForm } from '@/components/admin/packages/PackageForm'
import { getAdminPackageById } from '@/app/actions/adminPackages.actions'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/admin/auth'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Edit Package' }

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin')
  const resolvedParams = await params
  
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('id, name_en, name_ar').order('name_en')

  let pkg
  try {
    pkg = await getAdminPackageById(resolvedParams.id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Package</h1>
      <div className="bg-card p-6 rounded-md border border-border">
        <PackageForm initialData={pkg} services={services || []} />
      </div>
    </div>
  )
}
