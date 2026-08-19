import type { Metadata } from 'next'
import { getAdminCategories } from '@/app/actions/adminServices.actions'
import { ServiceForm } from '../ServiceForm'

export const metadata: Metadata = { title: 'New Service' }

export default async function NewServicePage() {
  const categories = await getAdminCategories()
  return <ServiceForm categories={categories} />
}
