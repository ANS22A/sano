import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'business_documents'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export type BusinessDocFolder = 'expenses' | 'purchases' | 'suppliers' | 'sales' | 'refunds' | 'partners' | 'payroll'

export interface UploadDocResult {
  success: boolean
  path?: string
  error?: string
}

/**
 * Upload a private document to business_documents bucket
 */
export async function uploadBusinessDocument(
  file: File,
  folder: BusinessDocFolder,
  entityId: string
): Promise<UploadDocResult> {
  try {
    if (file.size === 0) {
      return { success: false, error: 'File is empty' }
    }
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File exceeds 5MB limit' }
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed' }
    }

    if (!entityId || !/^[a-zA-Z0-9-_]+$/.test(entityId)) {
      return { success: false, error: 'Invalid entity ID for storage path' }
    }

    const ext = EXTENSION_MAP[file.type] || 'bin'
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    const suffix = `${timestamp}-${randomStr}`
    
    const filePath = `${folder}/${entityId}/doc-${suffix}.${ext}`

    const supabaseAdmin = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[BusinessDocuments] Upload error:', error.message)
      return { success: false, error: 'Failed to upload document' }
    }

    return {
      success: true,
      path: data.path,
    }
  } catch (err) {
    console.error('[BusinessDocuments] Unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred during document upload' }
  }
}

/**
 * Generate a temporary signed URL (private access only, expires in 60 minutes)
 */
export async function getDocumentSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
  if (!path) return null
  if (path.includes('..') || path.startsWith('/')) return null

  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresInSeconds)

    if (error || !data?.signedUrl) {
      console.error('[BusinessDocuments] Signed URL error:', error?.message)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('[BusinessDocuments] Signed URL unexpected error:', err)
    return null
  }
}

/**
 * Delete a document from the private business_documents bucket
 */
export async function deleteBusinessDocument(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) return { success: false, error: 'No path provided' }
    if (path.includes('..') || path.startsWith('/')) {
      return { success: false, error: 'Invalid path' }
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('[BusinessDocuments] Delete error:', error.message)
      return { success: false, error: 'Failed to delete document' }
    }

    return { success: true }
  } catch (err) {
    console.error('[BusinessDocuments] Delete error:', err)
    return { success: false, error: 'An unexpected error occurred during document deletion' }
  }
}
