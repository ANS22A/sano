'use server'

import { requireRole } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

export async function getAdminReports(params: { from: string; to: string }) {
  await requireRole('manager')
  const supabase = await createClient()

  const [{ data: bookings }, { data: byService }] = await Promise.all([
    supabase
      .from('bookings')
      .select('status, price_sar, date')
      .gte('date', params.from)
      .lte('date', params.to),
    supabase
      .from('bookings')
      .select('services(name_en), price_sar')
      .gte('date', params.from)
      .lte('date', params.to)
      .neq('status', 'cancelled')
      .not('service_id', 'is', null),
  ])

  const all = bookings ?? []
  const totalRevenue = all.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.price_sar), 0)
  const totalBookings = all.length
  const confirmed = all.filter(b => b.status === 'confirmed').length
  const cancelled = all.filter(b => b.status === 'cancelled').length
  const completed = all.filter(b => b.status === 'completed').length

  // Top services by booking count
  const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const b of byService ?? []) {
    const name = (b.services as { name_en: string } | null)?.name_en ?? 'Unknown'
    if (!serviceMap[name]) serviceMap[name] = { name, count: 0, revenue: 0 }
    serviceMap[name].count++
    serviceMap[name].revenue += Number(b.price_sar)
  }
  const topServices = Object.values(serviceMap).sort((a, b) => b.count - a.count).slice(0, 10)

  return { totalRevenue, totalBookings, confirmed, cancelled, completed, topServices }
}
