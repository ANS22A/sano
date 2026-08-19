'use server'

import { requireRole } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

export async function getCalendarBookings(month: string) {
  await requireRole('manager')
  const supabase = await createClient()

  // month is YYYY-MM
  const startDate = `${month}-01`
  const nextMonthDate = new Date(`${month}-01`)
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
  const endDate = nextMonthDate.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, date, start_time, end_time, status,
      customers(full_name),
      services(name_en)
    `)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('start_time')

  return (data ?? []).map((b) => ({
    id: b.id,
    booking_number: b.booking_number ?? '',
    date: b.date,
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status ?? 'pending',
    customer_name: (b.customers as { full_name: string } | null)?.full_name ?? '—',
    service_name: (b.services as { name_en: string } | null)?.name_en ?? '—',
  }))
}
