/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadBusinessDocument, getDocumentSignedUrl } from '@/lib/storage/business-documents'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database.types'

const PAGE_SIZE = 25

export type PartnerRecord = Tables<'partners'> & {
  profiles?: { full_name: string; email: string } | null
}

export type WithdrawalRecord = Tables<'partner_withdrawals'> & {
  partners?: { name: string; ownership_percentage: number | null } | null
  profiles?: { full_name: string; email: string } | null
}

const PartnerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  ownership_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

const WithdrawalSchema = z.object({
  partner_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string(),
  payment_method: z.enum(['bank_transfer', 'cash', 'mada', 'credit_card', 'other']),
  reference: z.string().max(100),
  notes: z.string().max(1000).optional().nullable(),
})

export interface GetPartnersParams {
  page?: number
  q?: string
  includeArchived?: boolean
}

export async function getAdminPartners(params: GetPartnersParams = {}) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { page = 1, q, includeArchived = false } = params
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('partners')
    .select('*, profiles:created_by(full_name, email)', { count: 'exact' })

  if (!includeArchived) {
    query = query.eq('is_active', true)
  }

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Failed to get partners:', error)
    throw new Error('Failed to load partners')
  }

  return {
    partners: data as PartnerRecord[],
    count: count ?? 0,
    totalPages: count ? Math.ceil(count / PAGE_SIZE) : 0,
  }
}

export async function getAdminPartner(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('partners')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single()

  if (error) throw new Error('Failed to load partner')
  return data as PartnerRecord
}

export async function createPartner(formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const rawData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    ownership_percentage: formData.get('ownership_percentage'),
    notes: formData.get('notes'),
  }

  const parsed = PartnerSchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { data, error } = await supabase
    .from('partners')
    .insert({
      ...parsed.data,
      created_by: session.userId,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await writeAuditLog({
    action: 'partner.created',
    adminUserId: session.userId,
    entityType: 'partners',
    entityId: data.id,
    metadata: { name: parsed.data.name },
  })

  revalidatePath('/admin/partners')
  return { success: true, id: data.id }
}

export async function updatePartner(id: string, formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const rawData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    ownership_percentage: formData.get('ownership_percentage'),
    notes: formData.get('notes'),
  }

  const parsed = PartnerSchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { data, error } = await supabase
    .from('partners')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await writeAuditLog({
    action: 'partner.updated',
    adminUserId: session.userId,
    entityType: 'partners',
    entityId: data.id,
    metadata: { name: parsed.data.name },
  })

  revalidatePath('/admin/partners')
  revalidatePath(`/admin/partners/${id}`)
  return { success: true }
}

export async function togglePartnerActive(id: string, currentStatus: boolean) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('partners')
    .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    action: currentStatus ? 'partner.archived' : 'partner.unarchived',
    adminUserId: session.userId,
    entityType: 'partners',
    entityId: id,
  })

  revalidatePath('/admin/partners')
  return { success: true }
}

export interface GetWithdrawalsParams {
  page?: number
  partnerId?: string
  status?: 'completed' | 'void' | 'all'
}

export async function getAdminPartnerWithdrawals(params: GetWithdrawalsParams = {}) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { page = 1, partnerId, status = 'completed' } = params
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('partner_withdrawals')
    .select('*, partners(name, ownership_percentage), profiles(full_name, email)', { count: 'exact' })

  if (partnerId) {
    query = query.eq('partner_id', partnerId)
  }

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('date', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[Withdrawals Error]', JSON.stringify(error))
    throw new Error(`Failed to load withdrawals: ${error.message}`)
  }

  return {
    withdrawals: data as unknown as WithdrawalRecord[],
    count: count ?? 0,
    totalPages: count ? Math.ceil(count / PAGE_SIZE) : 0,
  }
}

export async function createPartnerWithdrawal(formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const rawData = {
    partner_id: formData.get('partner_id'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    payment_method: formData.get('payment_method'),
    reference: formData.get('reference'),
    notes: formData.get('notes'),
  }

  const parsed = WithdrawalSchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const file = formData.get('attachment') as File | null
  let attachment_url = null

  // Ensure unique reference
  const { count: refCount } = await supabase
    .from('partner_withdrawals')
    .select('id', { count: 'exact', head: true })
    .eq('reference', parsed.data.reference)
  if (refCount && refCount > 0) {
    throw new Error(`Reference number ${parsed.data.reference} already exists.`)
  }

  const { data: record, error: insertError } = await supabase
    .from('partner_withdrawals')
    .insert({
      ...parsed.data,
      created_by: session.userId,
    })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  if (file && file.size > 0) {
    const upload = await uploadBusinessDocument(file, 'partners', record.id)
    if (upload.success && upload.path) {
      attachment_url = upload.path
      await supabase
        .from('partner_withdrawals')
        .update({ attachment_url })
        .eq('id', record.id)
    }
  }

  await writeAuditLog({
    action: 'partner.withdrawal_created',
    adminUserId: session.userId,
    entityType: 'partner_withdrawals',
    entityId: record.id,
    metadata: { amount: parsed.data.amount, partner_id: parsed.data.partner_id },
  })

  revalidatePath('/admin/partners/withdrawals')
  return { success: true }
}

export async function voidPartnerWithdrawal(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('partner_withdrawals')
    .update({ status: 'void', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    action: 'partner.withdrawal_voided',
    adminUserId: session.userId,
    entityType: 'partner_withdrawals',
    entityId: id,
  })

  revalidatePath('/admin/partners/withdrawals')
  return { success: true }
}

export async function getWithdrawalSignedUrl(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('partner_withdrawals')
    .select('attachment_url')
    .eq('id', id)
    .single()

  if (error || !data?.attachment_url) return { url: null }

  return getDocumentSignedUrl(data.attachment_url)
}
