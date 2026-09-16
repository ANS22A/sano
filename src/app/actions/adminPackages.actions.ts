'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminPackages(params?: { active?: string }) {
  await requireRole('admin')
  const supabase = await createClient()

  let query = supabase
    .from('packages')
    .select(`
      *,
      package_services(
        id,
        sequence_order,
        services(id, name_en, name_ar)
      )
    `)
    .order('sort_order', { ascending: true })

  if (params?.active === 'true') {
    query = query.eq('is_active', true)
  } else if (params?.active === 'false') {
    query = query.eq('is_active', false)
  }

  const { data, error } = await query

  if (error) throw new Error('Failed to fetch packages')
  return data
}

export async function getAdminPackageById(id: string) {
  await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      package_services(
        id,
        service_id,
        sequence_order
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error('Failed to fetch package')
  return data
}

export async function createAdminPackage(formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const slug = formData.get('slug') as string
  const nameEn = formData.get('name_en') as string
  const nameAr = formData.get('name_ar') as string
  const taglineEn = (formData.get('tagline_en') as string) || null
  const taglineAr = (formData.get('tagline_ar') as string) || null
  const descriptionEn = formData.get('description_en') as string
  const descriptionAr = formData.get('description_ar') as string
  const priceSar = Number(formData.get('price_sar'))
  const totalDurationMinutes = Number(formData.get('total_duration_minutes'))
  const maxGuests = Number(formData.get('max_guests')) || 1
  const sortOrder = Number(formData.get('sort_order')) || 0
  const isActive = formData.get('is_active') === 'true'
  const imageUrl = formData.get('image_url') as string
  const servicesJson = formData.get('services') as string // array of { service_id, sequence_order }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: Record<string, any> = {
    slug,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price_sar: priceSar,
    total_duration_minutes: totalDurationMinutes,
    is_active: isActive,
    sort_order: sortOrder,
    image_url: imageUrl || null,
  }
  // New columns — included only when migration has been applied
  if (taglineEn !== null) insertData.tagline_en = taglineEn
  if (taglineAr !== null) insertData.tagline_ar = taglineAr
  if (maxGuests > 0) insertData.max_guests = maxGuests

  const { data, error } = await supabase.from('packages').insert(insertData as any).select('id').single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A package with this slug already exists. Please choose a unique slug.' }
    }
    return { error: error.message }
  }

  if (servicesJson) {
    try {
      const services = JSON.parse(servicesJson) as { service_id: string; sequence_order: number }[]
      if (services.length > 0) {
        const { error: srvError } = await supabase.from('package_services').insert(
          services.map(s => ({
            package_id: data.id,
            service_id: s.service_id,
            sequence_order: s.sequence_order
          }))
        )
        if (srvError) console.error('[Packages] Error inserting services:', srvError)
      }
    } catch (e) {
      console.error('[Packages] Error parsing services:', e)
    }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'package.created',
    entityType: 'package',
    entityId: data.id,
    metadata: { nameEn, slug }
  })

  revalidatePath('/admin/packages')
  revalidatePath('/packages')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateAdminPackage(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const slug = formData.get('slug') as string
  const nameEn = formData.get('name_en') as string
  const nameAr = formData.get('name_ar') as string
  const taglineEn = (formData.get('tagline_en') as string) || null
  const taglineAr = (formData.get('tagline_ar') as string) || null
  const descriptionEn = formData.get('description_en') as string
  const descriptionAr = formData.get('description_ar') as string
  const priceSar = Number(formData.get('price_sar'))
  const totalDurationMinutes = Number(formData.get('total_duration_minutes'))
  const maxGuests = Number(formData.get('max_guests')) || 1
  const sortOrder = Number(formData.get('sort_order')) || 0
  const isActive = formData.get('is_active') === 'true'
  const imageUrl = formData.get('image_url') as string
  const servicesJson = formData.get('services') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    slug,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price_sar: priceSar,
    total_duration_minutes: totalDurationMinutes,
    is_active: isActive,
    sort_order: sortOrder,
    image_url: imageUrl || null,
  }
  // New columns — included only when migration has been applied
  if (taglineEn !== null) updateData.tagline_en = taglineEn
  if (taglineAr !== null) updateData.tagline_ar = taglineAr
  if (maxGuests > 0) updateData.max_guests = maxGuests

  const { error } = await supabase.from('packages').update(updateData as any).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A package with this slug already exists. Please choose a unique slug.' }
    }
    return { error: error.message }
  }

  if (servicesJson) {
    try {
      const services = JSON.parse(servicesJson) as { service_id: string; sequence_order: number }[]
      await supabase.from('package_services').delete().eq('package_id', id)
      if (services.length > 0) {
        await supabase.from('package_services').insert(
          services.map(s => ({
            package_id: id,
            service_id: s.service_id,
            sequence_order: s.sequence_order
          }))
        )
      }
    } catch (e) {
      console.error('[Packages] Error updating services:', e)
    }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'package.updated',
    entityType: 'package',
    entityId: id,
    metadata: { nameEn, slug }
  })

  revalidatePath('/admin/packages')
  revalidatePath('/packages')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePackageOrder(updates: { id: string; sort_order: number }[]) {
  await requireRole('admin')
  const supabase = await createClient()

  for (const update of updates) {
    await supabase.from('packages').update({ sort_order: update.sort_order }).eq('id', update.id)
  }

  revalidatePath('/admin/packages')
  revalidatePath('/packages')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function togglePackageActive(id: string, isActive: boolean) {
  const session = await requireRole('admin')
  const supabase = await createClient()
  const { error } = await supabase.from('packages').update({ is_active: isActive }).eq('id', id)
  if (error) return { error: error.message }

  await writeAuditLog({
    adminUserId: session.userId,
    action: isActive ? 'package.activate' : 'package.deactivate',
    entityType: 'package',
    entityId: id,
  })

  revalidatePath('/admin/packages')
  revalidatePath('/packages')
  revalidatePath('/', 'layout')
  return { success: true }
}
