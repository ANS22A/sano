import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminBookingById } from '@/app/actions/adminBookings.actions'
import { BookingDetailClient } from './BookingDetailClient'

export const metadata: Metadata = { title: 'Booking Detail' }

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await getAdminBookingById(id)
  if (!booking) notFound()

  return <BookingDetailClient booking={booking as Parameters<typeof BookingDetailClient>[0]['booking']} />
}
