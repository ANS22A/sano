import type { Metadata } from 'next'
import { PartnerForm } from '@/components/admin/partners/PartnerForm'
import { getAdminPartner } from '@/app/actions/adminPartners.actions'

export const metadata: Metadata = { title: 'Edit Partner' }

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await getAdminPartner(id)
  
  return <PartnerForm partner={partner} />
}
