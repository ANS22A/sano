import { PackageForm } from '@/components/admin/packages/PackageForm'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/admin/auth'

export const metadata = { title: 'New Package' }

export default async function NewPackagePage() {
  await requireRole('admin')
  const supabase = await createClient()
  
  const { data: services } = await supabase.from('services').select('id, name_en, name_ar').order('name_en')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create Package</h1>
      <div className="bg-card p-6 rounded-md border border-border">
        <PackageForm services={services || []} />
      </div>
    </div>
  )
}
