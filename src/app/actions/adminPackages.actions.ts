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
  // New columns ظ¤ included only when migration has been applied
  if (taglineEn !== null) insertData.tagline_en = taglineEn
  if (taglineAr !== null) insertData.tagline_ar = taglineAr
  if (maxGuests > 0) insertData.max_guests = maxGuests

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // New columns ظ¤ included only when migration has been applied
  if (taglineEn !== null) updateData.tagline_en = taglineEn
  if (taglineAr !== null) updateData.tagline_ar = taglineAr
  if (maxGuests > 0) updateData.max_guests = maxGuests

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


export async function uploadPackageImage(id: string, formData: FormData): Promise<{ success?: boolean; url?: string; error?: string }> {
  const session = await requireRole('admin')
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // 1. Upload new image first
  const { uploadImage, deleteImage } = await import('@/lib/storage/admin-storage')
  const uploadResult = await uploadImage(file, 'packages', id || 'new')
  if (!uploadResult.success || !uploadResult.url) {
    return { error: uploadResult.error ?? 'Upload failed' }
  }

  // 2. Fetch current image path & update DB if package exists
  if (id && id !== 'new') {
    const supabase = await createClient()
    const { data: currentPackage } = await supabase
      .from('packages')
      .select('image_url')
      .eq('id', id)
      .single()

    // 3. Update DB
    const { error: dbError } = await supabase
      .from('packages')
      .update({ image_url: uploadResult.url })
      .eq('id', id)

    if (dbError) {
      return { error: 'Failed to update database with new image URL' }
    }

    // 4. Delete old image from storage if it exists and differs
    if (currentPackage?.image_url && currentPackage.image_url !== uploadResult.url) {
      const bucketPath = '/storage/v1/object/public/sanoluna-media/'
      const idx = currentPackage.image_url.indexOf(bucketPath)
      if (idx !== -1) {
        const oldPath = currentPackage.image_url.substring(idx + bucketPath.length)
        deleteImage(oldPath).catch(console.error)
      }
    }

    await writeAuditLog({
      adminUserId: session.userId,
      action: 'package.image_uploaded',
      entityType: 'package',
      entityId: id,
    })

    revalidatePath('/admin/packages')
    revalidatePath(`/admin/packages/${id}/edit`)
    revalidatePath('/packages')
    revalidatePath('/', 'layout')
  }

  return { success: true, url: uploadResult.url }
}

export async function removePackageImage(id: string, currentImageUrl?: string | null): Promise<{ success?: boolean; error?: string }> {
  const session = await requireRole('admin')
  const { deleteImage } = await import('@/lib/storage/admin-storage')

  if (id && id !== 'new') {
    // 1. Fetch current image path
    const supabase = await createClient()
    const { data: currentPackage } = await supabase
      .from('packages')
      .select('image_url')
      .eq('id', id)
      .single()

    const targetUrl = currentPackage?.image_url || currentImageUrl
    if (!targetUrl) {
      return { error: 'No image to remove' }
    }

    const bucketPath = '/storage/v1/object/public/sanoluna-media/'
    const idx = targetUrl.indexOf(bucketPath)
    if (idx !== -1) {
      const oldPath = targetUrl.substring(idx + bucketPath.length)
      const deleteResult = await deleteImage(oldPath)
      if (!deleteResult.success) {
        return { error: 'Failed to delete image from storage' }
      }
    }

    // 2. Clear DB
    const { error: dbError } = await supabase
      .from('packages')
      .update({ image_url: null })
      .eq('id', id)

    if (dbError) return { error: 'Failed to clear image URL in database' }

    await writeAuditLog({
      adminUserId: session.userId,
      action: 'package.image_removed',
      entityType: 'package',
      entityId: id,
    })

    revalidatePath('/admin/packages')
    revalidatePath(`/admin/packages/${id}/edit`)
    revalidatePath('/packages')
    revalidatePath('/', 'layout')

    return { success: true }
  } else {
    // For new unsaved package
    if (currentImageUrl) {
      const bucketPath = '/storage/v1/object/public/sanoluna-media/'
      const idx = currentImageUrl.indexOf(bucketPath)
      if (idx !== -1) {
        const oldPath = currentImageUrl.substring(idx + bucketPath.length)
        await deleteImage(oldPath).catch(console.error)
      }
    }
    return { success: true }
  }
}
