import type { Metadata } from 'next'
import { PartnerForm } from '@/components/admin/partners/PartnerForm'

export const metadata: Metadata = { title: 'New Partner' }

export default async function NewPartnerPage() {
  return <PartnerForm />
}
