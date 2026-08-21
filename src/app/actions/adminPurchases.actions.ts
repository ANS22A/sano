'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadBusinessDocument, getDocumentSignedUrl } from '@/lib/storage/business-documents'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

const PurchaseSchema = z.object({
  supplier_id: z.string().uuid('Supplier is required'),
  description: z.string().min(2, 'Description is required').max(500),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'other']),
  payment_status: z.enum(['pending', 'paid', 'cancelled']),
  notes: z.string().max(1000).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
})

export interface GetPurchasesParams {
  page?: number
  q?: string
  supplierId?: string
  paymentStatus?: string
  paymentMethod?: string
  fromDate?: string
  toDate?: string
  includeArchived?: boolean
}

export async function getAdminPurchases(params: GetPurchasesParams = {}) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('purchases')
    .select('*, suppliers(id, name, phone), profiles!purchases_created_by_fkey(full_name, email)', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (!params.includeArchived) {
    query = query.eq('is_archived', false)
  }

  if (params.q) {
    query = query.or(`description.ilike.%${params.q}%,reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
  }

  if (params.supplierId && params.supplierId !== 'all') {
    query = query.eq('supplier_id', params.supplierId)
  }

  if (params.paymentStatus && params.paymentStatus !== 'all') {
    query = query.eq('payment_status', params.paymentStatus)
  }

  if (params.paymentMethod && params.paymentMethod !== 'all') {
    query = query.eq('payment_method', params.paymentMethod)
  }

  if (params.fromDate) {
    query = query.gte('date', params.fromDate)
  }

  if (params.toDate) {
    query = query.lte('date', params.toDate)
  }

  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  if (error) {
    console.error('[Purchases] fetch error:', error.message)
    return { purchases: [], total: 0, totalAmount: 0 }
  }

  // Calculate sum for matched filter
  let totalAmount = 0
  if (data && data.length > 0) {
    let sumQuery = supabase
      .from('purchases')
      .select('amount')

    if (!params.includeArchived) {
      sumQuery = sumQuery.eq('is_archived', false)
    }
    if (params.q) {
      sumQuery = sumQuery.or(`description.ilike.%${params.q}%,reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
    }
    if (params.supplierId && params.supplierId !== 'all') {
      sumQuery = sumQuery.eq('supplier_id', params.supplierId)
    }
    if (params.paymentStatus && params.paymentStatus !== 'all') {
      sumQuery = sumQuery.eq('payment_status', params.paymentStatus)
    }
    if (params.paymentMethod && params.paymentMethod !== 'all') {
      sumQuery = sumQuery.eq('payment_method', params.paymentMethod)
    }
    if (params.fromDate) {
      sumQuery = sumQuery.gte('date', params.fromDate)
    }
    if (params.toDate) {
      sumQuery = sumQuery.lte('date', params.toDate)
    }

    const { data: sumData } = await sumQuery
    if (sumData) {
      totalAmount = sumData.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    }
  }

  return {
    purchases: data ?? [],
    total: count ?? 0,
    totalAmount,
  }
}

export async function getAdminPurchaseById(id: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select('*, suppliers(*), profiles!purchases_created_by_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[Purchases] getById error:', error.message)
    return null
  }

  return data
}

export async function createAdminPurchase(formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    supplier_id: formData.get('supplier_id') as string,
    description: formData.get('description') as string,
    amount: formData.get('amount') as string,
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string,
    payment_status: formData.get('payment_status') as string,
    notes: (formData.get('notes') as string) || null,
    reference: (formData.get('reference') as string) || null,
  }

  const parsed = PurchaseSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const purchaseId = crypto.randomUUID()
  let attachmentUrl: string | null = null

  const file = formData.get('attachment') as File | null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'purchases', purchaseId)
    if (!uploadRes.success) {
      return { success: false, error: uploadRes.error ?? 'File upload failed' }
    }
    attachmentUrl = uploadRes.path ?? null
  }

  // Auto reference: PUR-YYYYMMDD-XXXX
  const autoReference = parsed.data.reference || `PUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      id: purchaseId,
      reference: autoReference,
      supplier_id: parsed.data.supplier_id,
      description: parsed.data.description.trim(),
      amount: parsed.data.amount,
      date: parsed.data.date,
      payment_method: parsed.data.payment_method,
      payment_status: parsed.data.payment_status,
      notes: parsed.data.notes?.trim() || null,
      attachment_url: attachmentUrl,
      created_by: session.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[Purchases] create error:', error.message)
    return { success: false, error: 'Failed to create purchase record' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'purchase.created',
    entityType: 'purchase',
    entityId: data.id,
    metadata: { reference: data.reference, amount: data.amount, date: data.date },
  })

  revalidatePath('/admin/purchases')
  return { success: true, purchase: data }
}

export async function updateAdminPurchase(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    supplier_id: formData.get('supplier_id') as string,
    description: formData.get('description') as string,
    amount: formData.get('amount') as string,
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string,
    payment_status: formData.get('payment_status') as string,
    notes: (formData.get('notes') as string) || null,
    reference: (formData.get('reference') as string) || null,
  }

  const parsed = PurchaseSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  let attachmentUrl: string | undefined = undefined
  const file = formData.get('attachment') as File | null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'purchases', id)
    if (!uploadRes.success) {
      return { success: false, error: uploadRes.error ?? 'File upload failed' }
    }
    attachmentUrl = uploadRes.path
  }

  const supabase = await createClient()

  const updatePayload: import('@/types/database.types').TablesUpdate<'purchases'> = {
    supplier_id: parsed.data.supplier_id,
    description: parsed.data.description.trim(),
    amount: parsed.data.amount,
    date: parsed.data.date,
    payment_method: parsed.data.payment_method,
    payment_status: parsed.data.payment_status,
    notes: parsed.data.notes?.trim() || null,
    reference: parsed.data.reference?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (attachmentUrl !== undefined) {
    updatePayload.attachment_url = attachmentUrl
  }

  const { data, error } = await supabase
    .from('purchases')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Purchases] update error:', error.message)
    return { success: false, error: 'Failed to update purchase record' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'purchase.updated',
    entityType: 'purchase',
    entityId: id,
    metadata: { reference: data.reference, amount: data.amount },
  })

  revalidatePath('/admin/purchases')
  return { success: true, purchase: data }
}

export async function archiveAdminPurchase(id: string, is_archived: boolean) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { error } = await supabase
    .from('purchases')
    .update({
      is_archived,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Purchases] archive error:', error.message)
    return { success: false, error: 'Failed to archive purchase' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: is_archived ? 'purchase.archived' : 'purchase.unarchived',
    entityType: 'purchase',
    entityId: id,
  })

  revalidatePath('/admin/purchases')
  return { success: true }
}

export async function getPurchaseSignedUrl(path: string) {
  await requireRole('manager')
  return getDocumentSignedUrl(path, 3600)
}
