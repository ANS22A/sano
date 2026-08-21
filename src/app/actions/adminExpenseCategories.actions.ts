'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const CategorySchema = z.object({
  name_en: z.string().min(2, 'English name is required').max(100),
  name_ar: z.string().min(2, 'Arabic name is required').max(100),
})

export async function getAdminExpenseCategories(includeArchived = false) {
  await requireRole('manager')
  const supabase = await createClient()

  let query = supabase
    .from('expense_categories')
    .select('*')
    .order('name_en', { ascending: true })

  if (!includeArchived) {
    query = query.eq('is_archived', false)
  }

  const { data, error } = await query
  if (error) {
    console.error('[ExpenseCategories] fetch error:', error.message)
    return []
  }

  return data ?? []
}

export async function createAdminExpenseCategory(formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    name_en: formData.get('name_en') as string,
    name_ar: formData.get('name_ar') as string,
  }

  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      name_en: parsed.data.name_en.trim(),
      name_ar: parsed.data.name_ar.trim(),
      created_by: session.userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[ExpenseCategories] create error:', error.message)
    return { success: false, error: 'Failed to create expense category' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'expense_category.created',
    entityType: 'expense_category',
    entityId: data.id,
    metadata: { name_en: data.name_en, name_ar: data.name_ar },
  })

  revalidatePath('/admin/expenses')
  revalidatePath('/admin/expenses/categories')
  return { success: true, category: data }
}

export async function updateAdminExpenseCategory(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const raw = {
    name_en: formData.get('name_en') as string,
    name_ar: formData.get('name_ar') as string,
  }

  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_categories')
    .update({
      name_en: parsed.data.name_en.trim(),
      name_ar: parsed.data.name_ar.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[ExpenseCategories] update error:', error.message)
    return { success: false, error: 'Failed to update expense category' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'expense_category.updated',
    entityType: 'expense_category',
    entityId: id,
    metadata: { name_en: data.name_en, name_ar: data.name_ar },
  })

  revalidatePath('/admin/expenses')
  revalidatePath('/admin/expenses/categories')
  return { success: true, category: data }
}

export async function archiveAdminExpenseCategory(id: string, is_archived: boolean) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { error } = await supabase
    .from('expense_categories')
    .update({
      is_archived,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[ExpenseCategories] archive error:', error.message)
    return { success: false, error: 'Failed to update category status' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: is_archived ? 'expense_category.archived' : 'expense_category.unarchived',
    entityType: 'expense_category',
    entityId: id,
  })

  revalidatePath('/admin/expenses')
  revalidatePath('/admin/expenses/categories')
  return { success: true }
}
