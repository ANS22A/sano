'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAdminPackages() {
  await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
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
  const descriptionEn = formData.get('description_en') as string
  const descriptionAr = formData.get('description_ar') as string
  const priceSar = Number(formData.get('price_sar'))
  const totalDurationMinutes = Number(formData.get('total_duration_minutes'))
  const isActive = formData.get('is_active') === 'true'
  const imageUrl = formData.get('image_url') as string
  const servicesJson = formData.get('services') as string // array of { service_id, sequence_order }

  const { data, error } = await supabase.from('packages').insert({
    slug,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price_sar: priceSar,
    total_duration_minutes: totalDurationMinutes,
    is_active: isActive,
    image_url: imageUrl || null
  }).select('id').single()

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
  return { success: true }
}

export async function updateAdminPackage(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const slug = formData.get('slug') as string
  const nameEn = formData.get('name_en') as string
  const nameAr = formData.get('name_ar') as string
  const descriptionEn = formData.get('description_en') as string
  const descriptionAr = formData.get('description_ar') as string
  const priceSar = Number(formData.get('price_sar'))
  const totalDurationMinutes = Number(formData.get('total_duration_minutes'))
  const isActive = formData.get('is_active') === 'true'
  const imageUrl = formData.get('image_url') as string
  const servicesJson = formData.get('services') as string

  const { error } = await supabase.from('packages').update({
    slug,
    name_en: nameEn,
    name_ar: nameAr,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    price_sar: priceSar,
    total_duration_minutes: totalDurationMinutes,
    is_active: isActive,
    image_url: imageUrl || null
  }).eq('id', id)

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
  return { success: true }
}
