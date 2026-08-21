import type { Metadata } from 'next'
import { AdminNewBookingClient } from './AdminNewBookingClient'
import { activeLocations } from '@/data/locations.data'

export const metadata: Metadata = { title: 'New Booking' }

export default function AdminNewBookingPage() {
  const locationId = activeLocations[0]?.id ?? ''

  return <AdminNewBookingClient locationId={locationId} />
}
