'use server'

import { requireRole } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

// Riyadh date helper
function riyadhToday() {
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export interface DashboardStats {
  todayCount: number
  todayRevenue: number
  pendingCount: number
  cancelledCount: number
  completedCount: number
  totalThisMonth: number
}

export interface RecentBooking {
  id: string
  booking_number: string
  date: string
  start_time: string
  status: string
  price_sar: number
  customer_name: string
  service_name: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireRole('manager')
  const supabase = await createClient()
  const today = riyadhToday()

  // Today's bookings
  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('status, price_sar')
    .eq('date', today)
    .neq('status', 'cancelled')

  const todayCount = todayBookings?.length ?? 0
  const todayRevenue = (todayBookings ?? []).reduce((sum, b) => sum + Number(b.price_sar), 0)

  // Pending bookings (all time)
  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Cancelled this month
  const monthStart = today.slice(0, 7) + '-01'
  const { count: cancelledCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('date', monthStart)

  // Completed this month
  const { count: completedCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('date', monthStart)

  // Total this month (non-cancelled)
  const { count: totalThisMonth } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('date', monthStart)
    .neq('status', 'cancelled')

  return {
    todayCount,
    todayRevenue,
    pendingCount: pendingCount ?? 0,
    cancelledCount: cancelledCount ?? 0,
    completedCount: completedCount ?? 0,
    totalThisMonth: totalThisMonth ?? 0,
  }
}

export async function getRecentBookings(limit = 10): Promise<RecentBooking[]> {
  await requireRole('manager')
  const supabase = await createClient()

  const { data } = await supabase
    .from('bookings')
    .select(`
      id, booking_number, date, start_time, status, price_sar,
      customers(full_name),
      services(name_en)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((b) => ({
    id: b.id,
    booking_number: b.booking_number ?? '',
    date: b.date,
    start_time: b.start_time,
    status: b.status ?? 'pending',
    price_sar: Number(b.price_sar),
    customer_name: (b.customers as { full_name: string } | null)?.full_name ?? '—',
    service_name: (b.services as { name_en: string } | null)?.name_en ?? b.booking_number ?? '—',
  }))
}
