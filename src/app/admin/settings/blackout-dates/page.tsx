import type { Metadata } from 'next'
import { getAdminLocations, getBlackoutDates } from '@/app/actions/adminLocations.actions'
import { BlackoutDateManager } from './BlackoutDateManager'

export const metadata: Metadata = { title: 'Blackout Dates' }

export default async function BlackoutDatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const locations = await getAdminLocations()
  const activeLocationId = sp.location ?? locations[0]?.id
  const activeLocation = locations.find((l) => l.id === activeLocationId)

  const dates = activeLocation ? await getBlackoutDates(activeLocation.id) : []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Blackout Dates</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage exception dates for {activeLocation?.name_en ?? 'all locations'}</p>
      </div>

      {activeLocation && (
        <BlackoutDateManager dates={dates} locationId={activeLocation.id} />
      )}
    </div>
  )
}
