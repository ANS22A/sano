import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminServiceById, getAdminCategories } from '@/app/actions/adminServices.actions'
import { ServiceForm } from '../../ServiceForm'

export const metadata: Metadata = { title: 'Edit Service' }

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [service, categories] = await Promise.all([
    getAdminServiceById(id),
    getAdminCategories(),
  ])
  if (!service) notFound()
  return <ServiceForm service={service} categories={categories} isEdit />
}
