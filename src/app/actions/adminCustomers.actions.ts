'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 25

export async function getAdminCustomers(params: { page?: number; q?: string }) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('customers')
    .select('id, full_name, phone, email, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`)
  }

  const { data, count } = await query
  return { customers: data ?? [], total: count ?? 0 }
}

export async function getCustomerWithBookings(customerId: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const [{ data: customer }, { data: bookings }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).single(),
    supabase
      .from('bookings')
      .select('id, booking_number, date, start_time, status, price_sar, services(name_en)')
      .eq('customer_id', customerId)
      .order('date', { ascending: false }),
  ])

  return { customer, bookings: bookings ?? [] }
}

export async function createAdminCustomer(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  
  const fullName = formData.get('full_name')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()
  const email = formData.get('email')?.toString().trim() || null

  if (!fullName || !phone) return { error: 'Name and Phone are required.' }

  const { data, error } = await supabase.from('customers').insert({
    full_name: fullName,
    phone,
    email
  }).select('id').single()

  if (error) return { error: error.message }
  
  await writeAuditLog({ 
    adminUserId: session.userId, 
    action: 'customer.created', 
    entityType: 'customer', 
    entityId: data.id 
  })
  
  return { success: true, id: data.id }
}

export async function updateAdminCustomer(id: string, formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  
  const fullName = formData.get('full_name')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()
  const email = formData.get('email')?.toString().trim() || null

  if (!fullName || !phone) return { error: 'Name and Phone are required.' }

  const { error } = await supabase.from('customers').update({
    full_name: fullName,
    phone,
    email
  }).eq('id', id)

  if (error) return { error: error.message }
  
  await writeAuditLog({ 
    adminUserId: session.userId, 
    action: 'customer.updated', 
    entityType: 'customer', 
    entityId: id 
  })
  
  return { success: true }
}
