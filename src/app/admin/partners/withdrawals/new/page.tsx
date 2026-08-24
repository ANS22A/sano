import { getAdminPartners } from '@/app/actions/adminPartners.actions'
import { WithdrawalForm } from '@/components/admin/partners/WithdrawalForm'
import { requireRole } from '@/lib/admin/auth'

export const metadata = {
  title: 'New Withdrawal',
}

export default async function NewWithdrawalPage() {
  await requireRole('admin')
  
  const { partners } = await getAdminPartners({ includeArchived: false, page: 1 })
  
  return <WithdrawalForm partners={partners} />
}
