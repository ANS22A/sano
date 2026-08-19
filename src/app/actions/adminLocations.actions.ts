'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

export async function getAdminCustomers(params: { page?: number; q?: string }) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('customers')
    .select('id, full_name, phone, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  const { data, count } = await query
  return { customers: data ?? [], total: count ?? 0 }
}

export async function getCustomerWithBookings(customerId: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const [{ data: customer }, { data: bookings }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).single(),
    supabase
      .from('bookings')
      .select('id, booking_number, date, start_time, status, price_sar, services(name_en)')
      .eq('customer_id', customerId)
      .order('date', { ascending: false }),
  ])

  return { customer, bookings: bookings ?? [] }
}

export async function getAdminStaff() {
  await requireRole('manager')
  const supabase = await createClient()
  const { data } = await supabase.from('staff').select('*').order('sort_order')
  return data ?? []
}

export async function getAdminStaffById(id: string) {
  await requireRole('admin')
  const supabase = await createClient()
  const [{ data: staff }, { data: availability }] = await Promise.all([
    supabase.from('staff').select('*').eq('id', id).single(),
    supabase.from('staff_availability').select('*').eq('staff_id', id),
  ])
  return { staff, availability: availability ?? [] }
}

export async function updateStaffActive(id: string, isActive: boolean) {
  const session = await requireRole('admin')
  const supabase = await createClient()
  const { error } = await supabase.from('staff').update({ is_active: isActive }).eq('id', id)
  if (error) return { error: error.message }
  await writeAuditLog({ adminUserId: session.userId, action: isActive ? 'staff.activate' : 'staff.deactivate', entityType: 'staff', entityId: id })
  revalidatePath('/admin/staff')
  return { success: true }
}

export async function getAdminLocations() {
  await requireRole('manager')
  const supabase = await createClient()
  const { data } = await supabase.from('locations').select('*').order('sort_order')
  return data ?? []
}

export async function getBusinessHours(locationId: string) {
  await requireRole('manager')
  const supabase = await createClient()
  const { data } = await supabase
    .from('business_hours')
    .select('*')
    .eq('location_id', locationId)
    .order('day_of_week')
  return data ?? []
}

export async function updateBusinessHour(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  const isClosed = formData.get('is_closed') === 'true'
  const { error } = await supabase
    .from('business_hours')
    .update({
      open_time: isClosed ? null : String(formData.get('open_time')),
      close_time: isClosed ? null : String(formData.get('close_time')),
      is_closed: isClosed,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  await writeAuditLog({ adminUserId: session.userId, action: 'business_hours.update', entityType: 'business_hours', entityId: id })
  revalidatePath('/admin/settings/business-hours')
  return { success: true }
}

export async function getBlackoutDates(locationId?: string) {
  await requireRole('manager')
  const supabase = await createClient()
  let query = supabase.from('blackout_dates').select('*').order('date', { ascending: true })
  if (locationId) query = query.eq('location_id', locationId)
  const { data } = await query
  return data ?? []
}

export async function addBlackoutDate(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  const { error } = await supabase.from('blackout_dates').insert({
    location_id: String(formData.get('location_id')),
    date: String(formData.get('date')),
    reason_en: String(formData.get('reason') ?? ''),
    reason_ar: String(formData.get('reason') ?? ''),
    is_active: true,
  })
  if (error) return { error: error.message }
  await writeAuditLog({ adminUserId: session.userId, action: 'blackout.add', entityType: 'blackout_date' })
  revalidatePath('/admin/settings/blackout-dates')
  return { success: true }
}

export async function removeBlackoutDate(id: string) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  const { error } = await supabase.from('blackout_dates').update({ is_active: false }).eq('id', id)
  if (error) return { error: error.message }
  await writeAuditLog({ adminUserId: session.userId, action: 'blackout.remove', entityType: 'blackout_date', entityId: id })
  revalidatePath('/admin/settings/blackout-dates')
  return { success: true }
}

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
