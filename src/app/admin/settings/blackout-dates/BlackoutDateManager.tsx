'use client'

import { useTransition } from 'react'
import { addBlackoutDate, removeBlackoutDate } from '@/app/actions/adminLocations.actions'
import { CalendarX, Trash2 } from 'lucide-react'

export function BlackoutDateManager({ dates, locationId }: { 
  dates: { id: string; date: string; reason_en?: string; reason_ar?: string; is_active: boolean }[]; 
  locationId: string 
}) {
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('location_id', locationId)
    startTransition(async () => {
      await addBlackoutDate(fd)
      ;(e.target as HTMLFormElement).reset()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeBlackoutDate(id)
    })
  }

  const activeDates = dates.filter((d) => d.is_active)

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-surface">
        <CalendarX className="w-5 h-5 text-accent" />
        <span className="text-sm font-medium text-foreground">Blackout Dates</span>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end mb-6">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
            <input
              type="date"
              name="date"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex-[2] min-w-0">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reason (Optional)</label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. National Holiday"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors shrink-0"
          >
            Add Date
          </button>
        </form>

        <div className="divide-y divide-border-subtle border-t border-border">
          {activeDates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No blackout dates configured.</p>
          ) : (
            activeDates.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{new Date(d.date).toLocaleDateString()}</p>
                  {d.reason_en && <p className="text-xs text-muted-foreground mt-0.5">{d.reason_en}</p>}
                </div>
                <button
                  onClick={() => handleRemove(d.id)}
                  disabled={isPending}
                  className="p-2 rounded-lg text-error hover:bg-error-bg transition-colors disabled:opacity-50"
                  aria-label="Remove blackout date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
