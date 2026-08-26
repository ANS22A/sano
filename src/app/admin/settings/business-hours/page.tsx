import type { Metadata } from 'next'
import { getAdminLocations, getBusinessHours } from '@/app/actions/adminLocations.actions'
import { BusinessHourRow } from './BusinessHourRow'
import { Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Business Hours' }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function BusinessHoursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const locations = await getAdminLocations()
  const activeLocationId = sp.location ?? locations[0]?.id
  const activeLocation = locations.find((l) => l.id === activeLocationId)

  const hours = activeLocation ? await getBusinessHours(activeLocation.id) : []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Business Hours</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage opening hours for {activeLocation?.name_en ?? 'all locations'}</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-surface">
          <Clock className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Weekly Schedule</span>
        </div>
        <div className="divide-y divide-border-subtle">
          {hours.map((h) => (
            <BusinessHourRow
              key={h.id}
              id={h.id}
              day={DAYS[h.day_of_week ?? 0]}
              openTime={h.open_time}
              closeTime={h.close_time}
              isClosed={h.is_closed ?? false}
            />
          ))}
          {hours.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No business hours configured for this location.</div>
          )}
        </div>
      </div>
    </div>
  )
}
