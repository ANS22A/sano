import type { Metadata } from 'next'
import { PayrollForm } from '@/components/admin/payroll/PayrollForm'
import { getAdminStaff } from '@/app/actions/adminStaff.actions'

export const metadata: Metadata = { title: 'New Payroll' }

export default async function NewPayrollPage() {
  const staff = await getAdminStaff()
  
  // Need to handle potential pagination of staff if > 25, but 25 is enough for Sano Luna initially.
  
  return <PayrollForm staff={staff.map(s => ({ id: s.id, name_en: s.name_en, name_ar: s.name_ar }))} />
}
