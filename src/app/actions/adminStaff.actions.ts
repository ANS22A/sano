'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function createAdminStaff(formData: FormData) {
  const session = await requireRole('admin') // Admin required for staff changes
  const supabase = await createClient()
  
  const nameEn = formData.get('name_en')?.toString().trim()
  const nameAr = formData.get('name_ar')?.toString().trim()
  const bioEn = formData.get('bio_en')?.toString().trim() || ''
  const bioAr = formData.get('bio_ar')?.toString().trim() || ''
  const slug = formData.get('slug')?.toString().trim()
  const imageUrl = formData.get('image_url')?.toString().trim() || null

  if (!nameEn || !nameAr || !slug) return { error: 'Name (EN/AR) and slug are required.' }

  const { data, error } = await supabase.from('staff').insert({
    name_en: nameEn,
    name_ar: nameAr,
    bio_en: bioEn,
    bio_ar: bioAr,
    slug,
    image_url: imageUrl,
    is_active: true,
    sort_order: 0
  }).select('id').single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A staff member with this slug already exists. Please choose a unique slug. / يوجد موظف بهذا الرابط مسبقاً. يرجى اختيار رابط فريد.' }
    }
    return { error: error.message }
  }
  
  await writeAuditLog({ 
    adminUserId: session.userId, 
    action: 'staff.created', 
    entityType: 'staff', 
    entityId: data.id 
  })
  
  revalidatePath('/admin/staff')
  return { success: true, id: data.id }
}

export async function updateAdminStaff(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()
  
  const nameEn = formData.get('name_en')?.toString().trim()
  const nameAr = formData.get('name_ar')?.toString().trim()
  const bioEn = formData.get('bio_en')?.toString().trim() || ''
  const bioAr = formData.get('bio_ar')?.toString().trim() || ''
  const slug = formData.get('slug')?.toString().trim()
  const imageUrl = formData.get('image_url')?.toString().trim() || null

  if (!nameEn || !nameAr || !slug) return { error: 'Name (EN/AR) and slug are required.' }

  const { error } = await supabase.from('staff').update({
    name_en: nameEn,
    name_ar: nameAr,
    bio_en: bioEn,
    bio_ar: bioAr,
    slug,
    image_url: imageUrl
  }).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A staff member with this slug already exists. Please choose a unique slug. / يوجد موظف بهذا الرابط مسبقاً. يرجى اختيار رابط فريد.' }
    }
    return { error: error.message }
  }
  
  await writeAuditLog({ 
    adminUserId: session.userId, 
    action: 'staff.updated', 
    entityType: 'staff', 
    entityId: id 
  })
  
  revalidatePath('/admin/staff')
  revalidatePath(`/admin/staff/${id}/availability`)
  return { success: true }
}

export async function uploadStaffImage(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // 1. Upload new image first
  const { uploadImage, deleteImage } = await import('@/lib/storage/admin-storage')
  const uploadResult = await uploadImage(file, 'staff', id)
  if (!uploadResult.success || !uploadResult.url) {
    return { error: uploadResult.error ?? 'Upload failed' }
  }

  // 2. Fetch current image path
  const supabase = await createClient()
  const { data: currentStaff } = await supabase
    .from('staff')
    .select('image_url')
    .eq('id', id)
    .single()

  // 3. Update DB
  const { error: dbError } = await supabase
    .from('staff')
    .update({ image_url: uploadResult.url })
    .eq('id', id)

  if (dbError) {
    return { error: 'Failed to update database with new image URL' }
  }

  // 4. Delete old image from storage if it exists and is from our bucket
  if (currentStaff?.image_url) {
    const bucketPath = '/storage/v1/object/public/sanoluna-media/'
    const idx = currentStaff.image_url.indexOf(bucketPath)
    if (idx !== -1) {
      const oldPath = currentStaff.image_url.substring(idx + bucketPath.length)
      deleteImage(oldPath).catch(console.error)
    }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'staff.image_uploaded',
    entityType: 'staff',
    entityId: id,
  })
  
  revalidatePath('/admin/staff')
  return { success: true, url: uploadResult.url }
}

export async function removeStaffImage(id: string) {
  const session = await requireRole('admin')
  
  // 1. Fetch current image path
  const supabase = await createClient()
  const { data: currentStaff } = await supabase
    .from('staff')
    .select('image_url')
    .eq('id', id)
    .single()

  if (!currentStaff?.image_url) {
    return { error: 'No image to remove' }
  }

  const bucketPath = '/storage/v1/object/public/sanoluna-media/'
  const idx = currentStaff.image_url.indexOf(bucketPath)
  if (idx !== -1) {
    const oldPath = currentStaff.image_url.substring(idx + bucketPath.length)
    const { deleteImage } = await import('@/lib/storage/admin-storage')
    const deleteResult = await deleteImage(oldPath)
    if (!deleteResult.success) {
      return { error: 'Failed to delete image from storage' }
    }
  }

  // 2. Clear DB
  const { error: dbError } = await supabase
    .from('staff')
    .update({ image_url: null })
    .eq('id', id)

  if (dbError) return { error: 'Failed to clear image URL in database' }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'staff.image_removed',
    entityType: 'staff',
    entityId: id,
  })

  revalidatePath('/admin/staff')
  return { success: true }
}
