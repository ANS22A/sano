'use client'

import { useTransition } from 'react'
import { updateBusinessHour } from '@/app/actions/adminLocations.actions'
import { useAdmin } from '@/components/admin/shell/AdminShell'

interface HourRowProps {
  id: string
  day: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

export function BusinessHourRow({ id, day, openTime, closeTime, isClosed: initialClosed }: HourRowProps) {
  const { lang } = useAdmin()
  const isAr = lang === 'ar'
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await updateBusinessHour(id, fd)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground w-28 shrink-0">{day}</span>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="is_closed"
          value="true"
          defaultChecked={initialClosed}
          onChange={(e) => {
            const row = e.currentTarget.closest('form')
            const timeInputs = row?.querySelectorAll('input[type="time"]')
            timeInputs?.forEach((inp) => {
              (inp as HTMLInputElement).disabled = e.currentTarget.checked
            })
          }}
          className="w-4 h-4 rounded accent-accent"
        />
        <span className="text-sm text-muted-foreground">{isAr ? 'مغلق' : 'Closed'}</span>
      </label>

      <div className="flex items-center gap-2 flex-1">
        <input
          type="time"
          name="open_time"
          defaultValue={openTime ?? '09:00'}
          disabled={initialClosed}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <span className="text-muted-foreground text-sm">—</span>
        <input
          type="time"
          name="close_time"
          defaultValue={closeTime ?? '21:00'}
          disabled={initialClosed}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
      >
        {isPending ? '…' : isAr ? 'حفظ' : 'Save'}
      </button>
    </form>
  )
}
