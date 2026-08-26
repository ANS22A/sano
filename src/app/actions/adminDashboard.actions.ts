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

  // Run all independent count/stat queries concurrently
  const monthStart = today.slice(0, 7) + '-01'
  const [
    todayBookingsRes,
    pendingRes,
    cancelledRes,
    completedRes,
    totalThisMonthRes,
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('status, price_sar')
      .eq('date', today)
      .neq('status', 'cancelled'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('date', monthStart),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('date', monthStart),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('date', monthStart)
      .neq('status', 'cancelled'),
  ])

  const todayCount = todayBookingsRes.data?.length ?? 0
  const todayRevenue = (todayBookingsRes.data ?? []).reduce((sum, b) => sum + Number(b.price_sar), 0)

  return {
    todayCount,
    todayRevenue,
    pendingCount: pendingRes.count ?? 0,
    cancelledCount: cancelledRes.count ?? 0,
    completedCount: completedRes.count ?? 0,
    totalThisMonth: totalThisMonthRes.count ?? 0,
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
