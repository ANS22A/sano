'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

const SupplierSchema = z.object({
  name: z.string().min(2, 'Supplier name is required').max(200),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.coerce.boolean().default(true),
})

export interface GetSuppliersParams {
  page?: number
  q?: string
  activeOnly?: boolean
}

export async function getAdminSuppliers(params: GetSuppliersParams = {}) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })

  if (params.activeOnly) {
    query = query.eq('is_active', true)
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  if (error) {
    console.error('[Suppliers] fetch error:', error.message)
    return { suppliers: [], total: 0 }
  }

  return {
    suppliers: data ?? [],
    total: count ?? 0,
  }
}

export async function getAdminSupplierById(id: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[Suppliers] getById error:', error.message)
    return null
  }

  return data
}

export async function createAdminSupplier(formData: FormData) {
  const session = await requireRole('manager')
  const emailRaw = formData.get('email') as string
  const raw = {
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || null,
    email: emailRaw && emailRaw.trim() !== '' ? emailRaw.trim() : null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
    is_active: formData.get('is_active') !== 'false',
  }

  const parsed = SupplierSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
      email: parsed.data.email || null,
      address: parsed.data.address?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      is_active: parsed.data.is_active,
      created_by: session.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[Suppliers] create error:', error.message)
    return { success: false, error: 'Failed to create supplier' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'supplier.created',
    entityType: 'supplier',
    entityId: data.id,
    metadata: { name: data.name, phone: data.phone },
  })

  revalidatePath('/admin/suppliers')
  revalidatePath('/admin/purchases')
  return { success: true, supplier: data }
}

export async function updateAdminSupplier(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const emailRaw = formData.get('email') as string
  const raw = {
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || null,
    email: emailRaw && emailRaw.trim() !== '' ? emailRaw.trim() : null,
    address: (formData.get('address') as string) || null,
    notes: (formData.get('notes') as string) || null,
    is_active: formData.get('is_active') !== 'false',
  }

  const parsed = SupplierSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
      email: parsed.data.email || null,
      address: parsed.data.address?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
      is_active: parsed.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Suppliers] update error:', error.message)
    return { success: false, error: 'Failed to update supplier' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'supplier.updated',
    entityType: 'supplier',
    entityId: id,
    metadata: { name: data.name, phone: data.phone },
  })

  revalidatePath('/admin/suppliers')
  revalidatePath('/admin/purchases')
  return { success: true, supplier: data }
}

export async function toggleSupplierStatus(id: string, is_active: boolean) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { error } = await supabase
    .from('suppliers')
    .update({
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Suppliers] status update error:', error.message)
    return { success: false, error: 'Failed to update supplier status' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'supplier.status_changed',
    entityType: 'supplier',
    entityId: id,
    metadata: { is_active },
  })

  revalidatePath('/admin/suppliers')
  return { success: true }
}
