'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

export async function getAdminServices(params: { page?: number; q?: string; categoryId?: string; active?: string }) {
  await requireRole('admin')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('services')
    .select('*, service_categories(name_en)', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .range(from, from + PAGE_SIZE - 1)

  if (params.q) query = query.or(`name_en.ilike.%${params.q}%,name_ar.ilike.%${params.q}%`)
  if (params.categoryId) query = query.eq('category_id', params.categoryId)
  if (params.active === 'true') query = query.eq('is_active', true)
  if (params.active === 'false') query = query.eq('is_active', false)

  const { data, count } = await query
  return { services: data ?? [], total: count ?? 0 }
}

export async function getAdminServiceById(id: string) {
  await requireRole('admin')
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('*').eq('id', id).single()
  return data
}

export async function getAdminCategories() {
  await requireRole('admin')
  const supabase = await createClient()
  const { data } = await supabase.from('service_categories').select('*').order('display_order')
  return data ?? []
}

const ServiceSchema = z.object({
  name_ar: z.string().min(2).max(200),
  name_en: z.string().min(2).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(100),
  category_id: z.string().uuid(),
  price_sar: z.coerce.number().min(0),
  duration_minutes: z.coerce.number().int().min(15),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.coerce.boolean().default(true),
  is_featured: z.coerce.boolean().default(false),
  short_description_ar: z.string().max(500).optional(),
  short_description_en: z.string().max(500).optional(),
})

export async function createAdminService(formData: FormData) {
  const session = await requireRole('admin')
  const parsed = ServiceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createClient()
  const { data, error } = await supabase.from('services').insert(parsed.data).select('id').single()
  if (error) {
    if (error.code === '23505') return { error: 'A service with this slug already exists.' }
    return { error: error.message }
  }

  await writeAuditLog({ adminUserId: session.userId, action: 'service.create', entityType: 'service', entityId: data.id })
  revalidatePath('/admin/services')
  revalidatePath('/', 'layout')
  return { success: true, id: data.id }
}

export async function updateAdminService(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const parsed = ServiceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const supabase = await createClient()
  const { error } = await supabase.from('services').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  await writeAuditLog({ adminUserId: session.userId, action: 'service.update', entityType: 'service', entityId: id })
  revalidatePath('/admin/services')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const session = await requireRole('admin')
  const supabase = await createClient()
  const { error } = await supabase.from('services').update({ is_active: isActive }).eq('id', id)
  if (error) return { error: error.message }

  await writeAuditLog({
    adminUserId: session.userId,
    action: isActive ? 'service.activate' : 'service.deactivate',
    entityType: 'service', entityId: id,
  })
  revalidatePath('/admin/services')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uploadServiceImage(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // 1. Upload new image first
  const { uploadImage, deleteImage } = await import('@/lib/storage/admin-storage')
  const uploadResult = await uploadImage(file, 'services', id)
  if (!uploadResult.success || !uploadResult.url) {
    return { error: uploadResult.error ?? 'Upload failed' }
  }

  // 2. Fetch current image path
  const supabase = await createClient()
  const { data: currentService } = await supabase
    .from('services')
    .select('image_url')
    .eq('id', id)
    .single()

  // 3. Update DB
  const { error: dbError } = await supabase
    .from('services')
    .update({ image_url: uploadResult.url })
    .eq('id', id)

  if (dbError) {
    // We could attempt to delete the newly uploaded file to avoid orphans, but it's complex
    // Return error, the new file is orphaned but DB remains safe
    return { error: 'Failed to update database with new image URL' }
  }

  // 4. Delete old image from storage if it exists and is from our bucket
  if (currentService?.image_url) {
    const bucketPath = '/storage/v1/object/public/sanoluna-media/'
    const idx = currentService.image_url.indexOf(bucketPath)
    if (idx !== -1) {
      const oldPath = currentService.image_url.substring(idx + bucketPath.length)
      // Delete in background/non-critical
      deleteImage(oldPath).catch(console.error)
    }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'service.image_uploaded',
    entityType: 'service',
    entityId: id,
  })
  
  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${id}/edit`)
  revalidatePath('/', 'layout')
  return { success: true, url: uploadResult.url }
}

export async function removeServiceImage(id: string) {
  const session = await requireRole('admin')
  
  // 1. Fetch current image path
  const supabase = await createClient()
  const { data: currentService } = await supabase
    .from('services')
    .select('image_url')
    .eq('id', id)
    .single()

  if (!currentService?.image_url) {
    return { error: 'No image to remove' }
  }

  const bucketPath = '/storage/v1/object/public/sanoluna-media/'
  const idx = currentService.image_url.indexOf(bucketPath)
  if (idx !== -1) {
    const oldPath = currentService.image_url.substring(idx + bucketPath.length)
    const { deleteImage } = await import('@/lib/storage/admin-storage')
    const deleteResult = await deleteImage(oldPath)
    if (!deleteResult.success) {
      return { error: 'Failed to delete image from storage' }
    }
  }

  // 2. Clear DB
  const { error: dbError } = await supabase
    .from('services')
    .update({ image_url: null })
    .eq('id', id)

  if (dbError) return { error: 'Failed to clear image URL in database' }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'service.image_removed',
    entityType: 'service',
    entityId: id,
  })

  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${id}/edit`)
  revalidatePath('/', 'layout')
  return { success: true }
}
