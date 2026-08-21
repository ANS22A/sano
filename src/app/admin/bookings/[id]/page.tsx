import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminBookingById } from '@/app/actions/adminBookings.actions'
import { getBookingFinancialSummary } from '@/app/actions/adminSales.actions'
import { BookingDetailClient } from './BookingDetailClient'

export const metadata: Metadata = { title: 'Booking Detail | SANO LUNA Admin' }

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [booking, financialSummary] = await Promise.all([
    getAdminBookingById(id),
    getBookingFinancialSummary(id),
  ])

  if (!booking) notFound()

  return (
    <BookingDetailClient
      booking={booking as Parameters<typeof BookingDetailClient>[0]['booking']}
      financialSummary={financialSummary}
    />
  )
}
