import type { Metadata } from 'next'
import { getCalendarBookings } from '@/app/actions/adminCalendar.actions'
import { AdminCalendar } from '@/components/admin/calendar/AdminCalendar'
import { cookies } from 'next/headers'
import { adminT, type AdminLang } from '@/lib/admin/translations'

export const metadata: Metadata = { title: 'Calendar' }

// Riyadh timezone string
function getRiyadhMonth() {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 7)
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('admin_lang')?.value ?? 'en') as AdminLang
  const t = adminT[lang]

  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : getRiyadhMonth()
  const bookings = await getCalendarBookings(month)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">{t.nav.calendar}</h1>
      <AdminCalendar initialBookings={bookings} currentMonth={month} />
    </div>
  )
}
