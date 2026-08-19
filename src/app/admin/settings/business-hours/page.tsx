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
        <h1 className="text-xl font-bold text-[#2a2118]">Business Hours</h1>
        <p className="text-sm text-[#9a8a7a] mt-1">Manage opening hours for {activeLocation?.name_en ?? 'all locations'}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8ddd0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ddd0] flex items-center gap-3 bg-[#faf7f4]">
          <Clock className="w-5 h-5 text-[#c9a96e]" />
          <span className="text-sm font-medium text-[#2a2118]">Weekly Schedule</span>
        </div>
        <div className="divide-y divide-[#f0e8de]">
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
            <div className="p-8 text-center text-[#9a8a7a] text-sm">No business hours configured for this location.</div>
          )}
        </div>
      </div>
    </div>
  )
}
