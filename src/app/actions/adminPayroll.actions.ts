/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadBusinessDocument, getDocumentSignedUrl } from '@/lib/storage/business-documents'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database.types'

const PAGE_SIZE = 25

export type SalaryRecord = Tables<'salaries'> & {
  staff?: { name_en: string; name_ar: string; base_salary: number | null; salary_basis: string | null } | null
  profiles?: { full_name: string; email: string } | null
}

export type AdvanceRecord = Tables<'employee_advances'> & {
  staff?: { name_en: string; name_ar: string } | null
  profiles?: { full_name: string; email: string } | null
}

const SalarySchema = z.object({
  staff_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
  gross_salary: z.coerce.number().min(0),
  advances_deducted: z.coerce.number().min(0).default(0),
  other_deductions: z.coerce.number().min(0).default(0),
  bonuses: z.coerce.number().min(0).default(0),
  net_salary: z.coerce.number().min(0),
  payment_status: z.enum(['pending', 'paid', 'void']),
  payment_date: z.string().optional().nullable(),
  payment_method: z.enum(['bank_transfer', 'cash', 'mada', 'credit_card', 'other']).optional().nullable(),
  reference: z.string().max(100),
  notes: z.string().max(1000).optional().nullable(),
})

const AdvanceSchema = z.object({
  staff_id: z.string().uuid(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string(),
  payment_method: z.enum(['cash', 'bank_transfer', 'mada', 'credit_card', 'other']),
  reference: z.string().max(100),
  notes: z.string().max(1000).optional().nullable(),
})

export interface GetPayrollParams {
  page?: number
  staffId?: string
  month?: string
  paymentStatus?: 'pending' | 'paid' | 'void' | 'all'
}

export async function getAdminPayroll(params: GetPayrollParams = {}) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { page = 1, staffId, month, paymentStatus = 'all' } = params
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('salaries')
    .select('*, staff(name_en, name_ar, base_salary, salary_basis), profiles(full_name, email)', { count: 'exact' })

  if (staffId) query = query.eq('staff_id', staffId)
  if (month) query = query.eq('month', month)
  if (paymentStatus !== 'all') query = query.eq('payment_status', paymentStatus)

  const { data, count, error } = await query
    .order('month', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error('Failed to load payroll')

  return {
    salaries: data as SalaryRecord[],
    count: count ?? 0,
    totalPages: count ? Math.ceil(count / PAGE_SIZE) : 0,
  }
}

export async function createSalary(formData: FormData, advanceIdsToSettle: string[] = []) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const rawData = {
    staff_id: formData.get('staff_id'),
    month: formData.get('month'),
    gross_salary: formData.get('gross_salary'),
    advances_deducted: formData.get('advances_deducted') || '0',
    other_deductions: formData.get('other_deductions') || '0',
    bonuses: formData.get('bonuses') || '0',
    net_salary: formData.get('net_salary'),
    payment_status: formData.get('payment_status'),
    payment_date: formData.get('payment_date'),
    payment_method: formData.get('payment_method'),
    reference: formData.get('reference'),
    notes: formData.get('notes'),
  }

  const parsed = SalarySchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const file = formData.get('attachment') as File | null
  let attachment_url = null

  // Ensure unique reference
  const { count: refCount } = await supabase
    .from('salaries')
    .select('id', { count: 'exact', head: true })
    .eq('reference', parsed.data.reference)
  if (refCount && refCount > 0) {
    throw new Error(`Reference number ${parsed.data.reference} already exists.`)
  }

  // Check duplicate active record for same month
  const { count: dupCount } = await supabase
    .from('salaries')
    .select('id', { count: 'exact', head: true })
    .eq('staff_id', parsed.data.staff_id)
    .eq('month', parsed.data.month)
    .neq('payment_status', 'void')
    .eq('is_archived', false)

  if (dupCount && dupCount > 0) {
    throw new Error(`Active salary record already exists for this staff in ${parsed.data.month}`)
  }

  const { data: record, error: insertError } = await supabase
    .from('salaries')
    .insert({
      ...parsed.data,
      created_by: session.userId,
    })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  if (file && file.size > 0) {
    const upload = await uploadBusinessDocument(file, 'payroll', record.id)
    if (upload.success && upload.path) {
      attachment_url = upload.path
      await supabase
        .from('salaries')
        .update({ attachment_url })
        .eq('id', record.id)
    }
  }

  // Settle advances if passed
  if (advanceIdsToSettle.length > 0) {
    await supabase
      .from('employee_advances')
      .update({ status: 'settled', salary_id: record.id, updated_at: new Date().toISOString() })
      .in('id', advanceIdsToSettle)
      .eq('status', 'approved') // only settle currently approved
  }

  await writeAuditLog({
    action: 'salary.created',
    adminUserId: session.userId,
    entityType: 'salaries',
    entityId: record.id,
    metadata: { month: parsed.data.month, staff_id: parsed.data.staff_id },
  })

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/payroll/advances')
  return { success: true }
}

export async function voidSalary(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  // First, void the salary
  const { error } = await supabase
    .from('salaries')
    .update({ payment_status: 'void', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Unsettle any linked advances
  await supabase
    .from('employee_advances')
    .update({ status: 'approved', salary_id: null, updated_at: new Date().toISOString() })
    .eq('salary_id', id)

  await writeAuditLog({
    action: 'salary.voided',
    adminUserId: session.userId,
    entityType: 'salaries',
    entityId: id,
  })

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/payroll/advances')
  return { success: true }
}

export async function getSalarySignedUrl(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('salaries')
    .select('attachment_url')
    .eq('id', id)
    .single()

  if (error || !data?.attachment_url) return { url: null }

  return getDocumentSignedUrl(data.attachment_url)
}

export interface GetAdvancesParams {
  page?: number
  staffId?: string
  status?: 'approved' | 'settled' | 'void' | 'all'
}

export async function getAdminAdvances(params: GetAdvancesParams = {}) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { page = 1, staffId, status = 'all' } = params
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('employee_advances')
    .select('*, staff(name_en, name_ar), profiles(full_name, email)', { count: 'exact' })

  if (staffId) query = query.eq('staff_id', staffId)
  if (status !== 'all') query = query.eq('status', status)

  const { data, count, error } = await query
    .order('date', { ascending: false })
    .range(from, to)

  if (error) throw new Error('Failed to load advances')

  return {
    advances: data as AdvanceRecord[],
    count: count ?? 0,
    totalPages: count ? Math.ceil(count / PAGE_SIZE) : 0,
  }
}

export async function createAdvance(formData: FormData) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const rawData = {
    staff_id: formData.get('staff_id'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    payment_method: formData.get('payment_method'),
    reference: formData.get('reference'),
    notes: formData.get('notes'),
  }

  const parsed = AdvanceSchema.safeParse(rawData)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  // Ensure unique reference
  const { count: refCount } = await supabase
    .from('employee_advances')
    .select('id', { count: 'exact', head: true })
    .eq('reference', parsed.data.reference)
  if (refCount && refCount > 0) {
    throw new Error(`Reference number ${parsed.data.reference} already exists.`)
  }

  const { data: record, error: insertError } = await supabase
    .from('employee_advances')
    .insert({
      ...parsed.data,
      created_by: session.userId,
    })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  await writeAuditLog({
    action: 'advance.created',
    adminUserId: session.userId,
    entityType: 'employee_advances',
    entityId: record.id,
    metadata: { amount: parsed.data.amount, staff_id: parsed.data.staff_id },
  })

  revalidatePath('/admin/payroll/advances')
  return { success: true }
}

export async function voidAdvance(id: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { error } = await supabase
    .from('employee_advances')
    .update({ status: 'void', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await writeAuditLog({
    action: 'advance.voided',
    adminUserId: session.userId,
    entityType: 'employee_advances',
    entityId: id,
  })

  revalidatePath('/admin/payroll/advances')
  return { success: true }
}

export async function getStaffPayrollOverview(month: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data: staffList, error: staffError } = await supabase
    .from('staff')
    .select('id, name_en, name_ar, base_salary, salary_basis, is_active')
    .eq('is_active', true)
    .order('sort_order')

  if (staffError) throw new Error(staffError.message)

  const { data: salaries, error: salariesError } = await supabase
    .from('salaries')
    .select('*')
    .eq('month', month)
    .eq('is_archived', false)
    .in('staff_id', staffList.map((s) => s.id))

  if (salariesError) throw new Error(salariesError.message)

  // Map salaries to staff
  const staffWithSalaries = staffList.map((staff) => {
    const salary = salaries.find((s) => s.staff_id === staff.id)
    return {
      ...staff,
      salary,
    }
  })

  return staffWithSalaries
}

export async function getEmployeePayrollDetails(staffId: string, month: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single()

  if (staffError) throw new Error(staffError.message)

  // Fetch the active salary record for this month
  const { data: salary, error: salaryError } = await supabase
    .from('salaries')
    .select('*')
    .eq('staff_id', staffId)
    .eq('month', month)
    .neq('payment_status', 'void')
    .eq('is_archived', false)
    .maybeSingle()

  if (salaryError) throw new Error(salaryError.message)

  // Fetch advances for this month
  const { data: advances, error: advancesError } = await supabase
    .from('employee_advances')
    .select('*')
    .eq('staff_id', staffId)
    .neq('status', 'void')
    .neq('is_archived', true)
    .like('date', `${month}-%`)
    .order('date', { ascending: false })

  if (advancesError) throw new Error(advancesError.message)

  return { staff, salary, advances }
}

export async function markSalaryPaid(salaryId: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data: salary, error: salaryError } = await supabase
    .from('salaries')
    .update({ 
      payment_status: 'paid', 
      payment_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', salaryId)
    .eq('payment_status', 'pending')
    .select()
    .single()

  if (salaryError) throw new Error(salaryError.message)

  await writeAuditLog({
    action: 'salary.paid',
    adminUserId: session.userId,
    entityType: 'salaries',
    entityId: salaryId,
    metadata: { month: salary.month, staff_id: salary.staff_id },
  })

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/payroll/staff')
  revalidatePath(`/admin/payroll/staff/${salary.staff_id}`)
  return { success: true }
}

export async function generateMonthlySalary(staffId: string, month: string) {
  const session = await requireRole('admin')
  const supabase = await createClient()

  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('id', staffId)
    .single()
  
  if (staffError) throw new Error('Staff not found')

  // Fetch un-settled advances for this month
  const { data: advances, error: advancesError } = await supabase
    .from('employee_advances')
    .select('*')
    .eq('staff_id', staffId)
    .eq('status', 'approved')
    .like('date', `${month}-%`)
  
  if (advancesError) throw new Error(advancesError.message)

  const totalAdvances = advances.reduce((sum, adv) => sum + Number(adv.amount), 0)
  const baseSalary = Number(staff.base_salary) || 0
  const netSalary = Math.max(0, baseSalary - totalAdvances)

  const reference = `PAY-${month}-${staffId.substring(0,6).toUpperCase()}`

  const payload = {
    staff_id: staffId,
    month,
    reference,
    gross_salary: baseSalary,
    advances_deducted: totalAdvances,
    other_deductions: 0,
    bonuses: 0,
    net_salary: netSalary,
    payment_status: 'pending',
    created_by: session.userId,
  }

  const { data: salary, error: insertError } = await supabase
    .from('salaries')
    .insert(payload)
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  if (advances.length > 0) {
    const advanceIds = advances.map(a => a.id)
    await supabase
      .from('employee_advances')
      .update({ status: 'settled', salary_id: salary.id, updated_at: new Date().toISOString() })
      .in('id', advanceIds)
  }

  await writeAuditLog({
    action: 'salary.generated',
    adminUserId: session.userId,
    entityType: 'salaries',
    entityId: salary.id,
    metadata: { month, staff_id: staffId },
  })

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/payroll/staff')
  revalidatePath(`/admin/payroll/staff/${staffId}`)
  return { success: true }
}
