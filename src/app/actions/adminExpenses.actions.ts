'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadBusinessDocument, getDocumentSignedUrl } from '@/lib/storage/business-documents'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const PAGE_SIZE = 25

const ExpenseSchema = z.object({
  category_id: z.string().uuid('Category is required'),
  description: z.string().min(2, 'Description is required').max(500),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'other']),
  notes: z.string().max(1000).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
})

export interface GetExpensesParams {
  page?: number
  q?: string
  categoryId?: string
  paymentMethod?: string
  fromDate?: string
  toDate?: string
  includeArchived?: boolean
}

export async function getAdminExpenses(params: GetExpensesParams) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('expenses')
    .select('*, expense_categories(id, name_en, name_ar), profiles!expenses_created_by_fkey(full_name, email)', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (!params.includeArchived) {
    query = query.eq('is_archived', false)
  }

  if (params.q) {
    query = query.or(`description.ilike.%${params.q}%,reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
  }

  if (params.categoryId && params.categoryId !== 'all') {
    query = query.eq('category_id', params.categoryId)
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
    console.error('[Expenses] fetch error:', error.message)
    return { expenses: [], total: 0, totalAmount: 0 }
  }

  // Calculate total amount for all matched records in filter
  let totalAmount = 0
  if (data && data.length > 0) {
    let sumQuery = supabase
      .from('expenses')
      .select('amount')
    
    if (!params.includeArchived) {
      sumQuery = sumQuery.eq('is_archived', false)
    }
    if (params.q) {
      sumQuery = sumQuery.or(`description.ilike.%${params.q}%,reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
    }
    if (params.categoryId && params.categoryId !== 'all') {
      sumQuery = sumQuery.eq('category_id', params.categoryId)
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
    expenses: data ?? [],
    total: count ?? 0,
    totalAmount,
  }
}

export async function getAdminExpenseById(id: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select('*, expense_categories(*), profiles!expenses_created_by_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[Expenses] getById error:', error.message)
    return null
  }

  return data
}

export async function createAdminExpense(formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    category_id: formData.get('category_id') as string,
    description: formData.get('description') as string,
    amount: formData.get('amount') as string,
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string,
    notes: (formData.get('notes') as string) || null,
    reference: (formData.get('reference') as string) || null,
  }

  const parsed = ExpenseSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const expenseId = crypto.randomUUID()
  let attachmentUrl: string | null = null

  const file = formData.get('attachment') as File | null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'expenses', expenseId)
    if (!uploadRes.success) {
      return { success: false, error: uploadRes.error ?? 'File upload failed' }
    }
    attachmentUrl = uploadRes.path ?? null
  }

  // Generate reference if not provided: EXP-YYYYMMDD-XXXX
  const autoReference = parsed.data.reference || `EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      id: expenseId,
      reference: autoReference,
      category_id: parsed.data.category_id,
      description: parsed.data.description.trim(),
      amount: parsed.data.amount,
      date: parsed.data.date,
      payment_method: parsed.data.payment_method,
      notes: parsed.data.notes?.trim() || null,
      attachment_url: attachmentUrl,
      created_by: session.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[Expenses] create error:', error.message)
    return { success: false, error: 'Failed to create expense record' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'expense.created',
    entityType: 'expense',
    entityId: data.id,
    metadata: { reference: data.reference, amount: data.amount, date: data.date },
  })

  revalidatePath('/admin/expenses')
  return { success: true, expense: data }
}

export async function updateAdminExpense(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    category_id: formData.get('category_id') as string,
    description: formData.get('description') as string,
    amount: formData.get('amount') as string,
    date: formData.get('date') as string,
    payment_method: formData.get('payment_method') as string,
    notes: (formData.get('notes') as string) || null,
    reference: (formData.get('reference') as string) || null,
  }

  const parsed = ExpenseSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  let attachmentUrl: string | undefined = undefined
  const file = formData.get('attachment') as File | null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'expenses', id)
    if (!uploadRes.success) {
      return { success: false, error: uploadRes.error ?? 'File upload failed' }
    }
    attachmentUrl = uploadRes.path
  }

  const supabase = await createClient()
  
  const updatePayload: import('@/types/database.types').TablesUpdate<'expenses'> = {
    category_id: parsed.data.category_id,
    description: parsed.data.description.trim(),
    amount: parsed.data.amount,
    date: parsed.data.date,
    payment_method: parsed.data.payment_method,
    notes: parsed.data.notes?.trim() || null,
    reference: parsed.data.reference?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (attachmentUrl !== undefined) {
    updatePayload.attachment_url = attachmentUrl
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Expenses] update error:', error.message)
    return { success: false, error: 'Failed to update expense record' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'expense.updated',
    entityType: 'expense',
    entityId: id,
    metadata: { reference: data.reference, amount: data.amount },
  })

  revalidatePath('/admin/expenses')
  return { success: true, expense: data }
}

export async function archiveAdminExpense(id: string, is_archived: boolean) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .update({
      is_archived,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[Expenses] archive error:', error.message)
    return { success: false, error: 'Failed to archive expense' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: is_archived ? 'expense.archived' : 'expense.unarchived',
    entityType: 'expense',
    entityId: id,
  })

  revalidatePath('/admin/expenses')
  return { success: true }
}

export async function getExpenseSignedUrl(path: string) {
  await requireRole('manager')
  return getDocumentSignedUrl(path, 3600)
}
