'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  return { success: true }
}

export async function createAdminLocation(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const nameEn = formData.get('name_en')?.toString().trim()
  const nameAr = formData.get('name_ar')?.toString().trim()
  const addressEn = formData.get('address_en')?.toString().trim() || ''
  const addressAr = formData.get('address_ar')?.toString().trim() || ''
  const phone = formData.get('phone')?.toString().trim() || null
  const slug = formData.get('slug')?.toString().trim()
  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null
  const is_active = formData.get('is_active') === 'true'

  if (!nameEn || !nameAr || !slug) return { error: 'Name (EN/AR) and slug are required.' }

  const { data, error } = await supabase.from('locations').insert({
    name_en: nameEn,
    name_ar: nameAr,
    address_en: addressEn,
    address_ar: addressAr,
    phone,
    slug,
    latitude,
    longitude,
    is_active: is_active,
    sort_order: 0
  }).select('id').single()

  if (error) return { error: error.message }

  await writeAuditLog({ adminUserId: session.userId, action: 'location.created', entityType: 'location', entityId: data.id })
  revalidatePath('/admin/locations')
  return { success: true, id: data.id }
}

export async function updateAdminLocation(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const nameEn = formData.get('name_en')?.toString().trim()
  const nameAr = formData.get('name_ar')?.toString().trim()
  const addressEn = formData.get('address_en')?.toString().trim() || ''
  const addressAr = formData.get('address_ar')?.toString().trim() || ''
  const phone = formData.get('phone')?.toString().trim() || null
  const slug = formData.get('slug')?.toString().trim()
  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null
  const is_active = formData.get('is_active') === 'true'

  if (!nameEn || !nameAr || !slug) return { error: 'Name (EN/AR) and slug are required.' }

  const { error } = await supabase.from('locations').update({
    name_en: nameEn,
    name_ar: nameAr,
    address_en: addressEn,
    address_ar: addressAr,
    phone,
    slug,
    latitude,
    longitude,
    is_active
  }).eq('id', id)

  if (error) return { error: error.message }

  await writeAuditLog({ adminUserId: session.userId, action: 'location.updated', entityType: 'location', entityId: id })
  revalidatePath('/admin/locations')
  return { success: true }
}
