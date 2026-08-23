import type { Metadata } from 'next'
import { AdvanceForm } from '@/components/admin/payroll/AdvanceForm'
import { getAdminStaff } from '@/app/actions/adminStaff.actions'

export const metadata: Metadata = { title: 'Record Advance' }

export default async function NewAdvancePage() {
  const staff = await getAdminStaff()
  
  return <AdvanceForm staff={staff.map(s => ({ id: s.id, name_en: s.name_en, name_ar: s.name_ar }))} />
}
