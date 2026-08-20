import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'sanoluna-media'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

export type StorageFolder = 'services' | 'staff'

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export async function uploadImage(
  file: File,
  folder: StorageFolder,
  entityId: string
): Promise<UploadResult> {
  try {
    // 1. Validate File Size
    if (file.size === 0) {
      return { success: false, error: 'File is empty' }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File exceeds 5MB limit' }
    }

    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' }
    }

    // 3. Generate deterministic safe path
    // Format: folder/entityId/image-{timestamp}.ext
    // This prevents path traversal as `folder` is strongly typed and `entityId` is validated
    if (!entityId || !/^[a-zA-Z0-9-_]+$/.test(entityId)) {
      return { success: false, error: 'Invalid entity ID for storage path' }
    }

    const ext = EXTENSION_MAP[file.type]
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    const suffix = `${timestamp}-${randomStr}`
    
    const filePath = `${folder}/${entityId}/image-${suffix}.${ext}`

    // 4. Upload using Admin Client
    const supabaseAdmin = createAdminClient()
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false // we use unique names, no need to upsert
      })

    if (error) {
      console.error('[AdminStorage] Upload error:', error.message)
      return { success: false, error: 'Failed to upload file to storage' }
    }

    // 5. Generate Public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl
    }
  } catch (err) {
    console.error('[AdminStorage] Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred during upload' }
  }
}

export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) return { success: false, error: 'No path provided' }
    
    // Prevent traversal attempts in the path
    if (path.includes('..') || path.startsWith('/')) {
      return { success: false, error: 'Invalid path' }
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('[AdminStorage] Delete error:', error.message)
      return { success: false, error: 'Failed to delete file from storage' }
    }

    return { success: true }
  } catch (err) {
    console.error('[AdminStorage] Unexpected error during delete:', err)
    return { success: false, error: 'An unexpected error occurred during deletion' }
  }
}

export function getPublicUrl(path: string): string | null {
  if (!path) return null
  const supabaseAdmin = createAdminClient()
  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}
