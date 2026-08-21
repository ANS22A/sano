'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { uploadBusinessDocument, getDocumentSignedUrl } from '@/lib/storage/business-documents'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { Tables } from '@/types/database.types'

const PAGE_SIZE = 25

export type SaleRecord = Tables<'sales'> & {
  customers?: { id: string; full_name: string; phone: string; email: string | null } | null
  bookings?: { id: string; booking_number: string; price_sar: number; date: string } | null
  profiles?: { full_name: string; email: string } | null
}

const PaymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'mada',
  'bank_transfer',
  'apple_pay',
  'stc_pay',
  'other',
])

const RecordPaymentSchema = z.object({
  booking_id: z.string().uuid().optional().nullable().or(z.literal('')),
  customer_id: z.string().uuid().optional().nullable().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  payment_method: PaymentMethodSchema,
  reference: z.string().max(100).optional().nullable(),
  source: z.enum(['booking', 'direct_sale', 'admin']).default('admin'),
  notes: z.string().max(1000).optional().nullable(),
})

const IssueRefundSchema = z.object({
  booking_id: z.string().uuid().optional().nullable().or(z.literal('')),
  customer_id: z.string().uuid().optional().nullable().or(z.literal('')),
  amount: z.coerce.number().positive('Refund amount must be greater than 0'),
  payment_method: PaymentMethodSchema,
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().min(2, 'Reason for refund is required').max(1000),
})

export interface GetSalesParams {
  page?: number
  q?: string
  bookingId?: string
  customerId?: string
  paymentMethod?: string
  type?: 'payment' | 'refund' | 'all'
  status?: 'completed' | 'failed' | 'void' | 'all'
  source?: 'booking' | 'direct_sale' | 'admin' | 'all'
  fromDate?: string
  toDate?: string
  includeArchived?: boolean
}

export async function getAdminSales(params: GetSalesParams) {
  await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('sales')
    .select(`
      *,
      customers(id, full_name, phone, email),
      bookings(id, booking_number, price_sar, date),
      profiles!sales_created_by_fkey(full_name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (!params.includeArchived) {
    query = query.eq('is_archived', false)
  }

  if (params.bookingId) {
    query = query.eq('booking_id', params.bookingId)
  }

  if (params.customerId) {
    query = query.eq('customer_id', params.customerId)
  }

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type)
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  if (params.source && params.source !== 'all') {
    query = query.eq('source', params.source)
  }

  if (params.paymentMethod && params.paymentMethod !== 'all') {
    query = query.eq('payment_method', params.paymentMethod)
  }

  if (params.fromDate) {
    query = query.gte('created_at', params.fromDate + 'T00:00:00Z')
  }

  if (params.toDate) {
    query = query.lte('created_at', params.toDate + 'T23:59:59Z')
  }

  if (params.q) {
    query = query.or(`reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
  }

  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  if (error) {
    console.error('[Sales] fetch error:', error.message)
    return {
      sales: [],
      total: 0,
      totalPayments: 0,
      totalRefunds: 0,
      totalRealized: 0,
    }
  }

  // Calculate totals for all active completed transactions matching filter
  let sumQuery = supabase
    .from('sales')
    .select('amount, type, status')
    .eq('is_archived', false)
    .eq('status', 'completed')

  if (params.bookingId) sumQuery = sumQuery.eq('booking_id', params.bookingId)
  if (params.customerId) sumQuery = sumQuery.eq('customer_id', params.customerId)
  if (params.paymentMethod && params.paymentMethod !== 'all') sumQuery = sumQuery.eq('payment_method', params.paymentMethod)
  if (params.source && params.source !== 'all') sumQuery = sumQuery.eq('source', params.source)
  if (params.fromDate) sumQuery = sumQuery.gte('created_at', params.fromDate + 'T00:00:00Z')
  if (params.toDate) sumQuery = sumQuery.lte('created_at', params.toDate + 'T23:59:59Z')
  if (params.q) sumQuery = sumQuery.or(`reference.ilike.%${params.q}%,notes.ilike.%${params.q}%`)

  const { data: sumData } = await sumQuery

  let totalPayments = 0
  let totalRefunds = 0

  if (sumData) {
    for (const item of sumData) {
      const amt = Number(item.amount) || 0
      if (item.type === 'payment') {
        totalPayments += amt
      } else if (item.type === 'refund') {
        totalRefunds += amt
      }
    }
  }

  return {
    sales: (data ?? []) as SaleRecord[],
    total: count ?? 0,
    totalPayments,
    totalRefunds,
    totalRealized: totalPayments - totalRefunds,
  }
}

export async function getSaleSignedUrl(path: string) {
  await requireRole('manager')
  return getDocumentSignedUrl(path)
}

export async function getAdminSaleById(id: string) {
  await requireRole('manager')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers(id, full_name, phone, email),
      bookings(id, booking_number, price_sar, date),
      profiles!sales_created_by_fkey(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  let signedAttachmentUrl: string | null = null
  if (data.attachment_url) {
    signedAttachmentUrl = await getDocumentSignedUrl(data.attachment_url)
  }

  return {
    ...data,
    signedAttachmentUrl,
  }
}

export async function recordPayment(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const bookingId = (formData.get('booking_id') as string)?.trim() || null
  const customerId = (formData.get('customer_id') as string)?.trim() || null
  const amountStr = formData.get('amount') as string
  const paymentMethod = formData.get('payment_method') as string
  const reference = (formData.get('reference') as string)?.trim() || null
  const source = (formData.get('source') as string) || (bookingId ? 'booking' : 'direct_sale')
  const notes = (formData.get('notes') as string)?.trim() || null
  const file = formData.get('attachment') as File | null

  const parsed = RecordPaymentSchema.safeParse({
    booking_id: bookingId,
    customer_id: customerId,
    amount: amountStr,
    payment_method: paymentMethod,
    reference,
    source,
    notes,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input data' }
  }

  let finalCustomerId = parsed.data.customer_id || null

  // If tied to a booking, resolve customer if missing
  if (bookingId) {
    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .select('id, customer_id, price_sar, booking_number')
      .eq('id', bookingId)
      .single()

    if (bError || !booking) {
      return { success: false, error: 'Target booking was not found.' }
    }

    if (!finalCustomerId && booking.customer_id) {
      finalCustomerId = booking.customer_id
    }
  }

  // Handle optional document attachment upload
  let attachmentUrl: string | null = null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'sales', bookingId || finalCustomerId || 'direct')
    if (!uploadRes.success || !uploadRes.path) {
      return { success: false, error: uploadRes.error ?? 'Failed to upload attachment' }
    }
    attachmentUrl = uploadRes.path
  }

  const generatedRef = parsed.data.reference || `SAL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const { data: sale, error: insertError } = await supabase
    .from('sales')
    .insert({
      reference: generatedRef,
      booking_id: bookingId,
      customer_id: finalCustomerId,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      type: 'payment',
      status: 'completed',
      source: parsed.data.source,
      notes: parsed.data.notes,
      attachment_url: attachmentUrl,
      created_by: session.userId,
    })
    .select('id, reference, amount')
    .single()

  if (insertError || !sale) {
    return { success: false, error: insertError?.message ?? 'Failed to record payment' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'sale.payment_recorded',
    entityType: 'sale',
    entityId: sale.id,
    metadata: {
      reference: sale.reference,
      amount: sale.amount,
      payment_method: parsed.data.payment_method,
      booking_id: bookingId,
      customer_id: finalCustomerId,
    },
  })

  revalidatePath('/admin/sales')
  if (bookingId) {
    revalidatePath(`/admin/bookings/${bookingId}`)
    revalidatePath('/admin/bookings')
  }

  return { success: true, saleId: sale.id, reference: sale.reference }
}

export async function issueRefund(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const bookingId = (formData.get('booking_id') as string)?.trim() || null
  const customerId = (formData.get('customer_id') as string)?.trim() || null
  const amountStr = formData.get('amount') as string
  const paymentMethod = formData.get('payment_method') as string
  const reference = (formData.get('reference') as string)?.trim() || null
  const notes = (formData.get('notes') as string)?.trim() || null
  const file = formData.get('attachment') as File | null

  const parsed = IssueRefundSchema.safeParse({
    booking_id: bookingId,
    customer_id: customerId,
    amount: amountStr,
    payment_method: paymentMethod,
    reference,
    notes,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid refund input' }
  }

  let finalCustomerId = parsed.data.customer_id || null

  // If attached to a booking, check refundable amount constraint
  if (bookingId) {
    const summary = await getBookingFinancialSummary(bookingId)
    if (!summary) {
      return { success: false, error: 'Booking not found' }
    }

    if (parsed.data.amount > summary.net_paid) {
      return {
        success: false,
        error: `Cannot refund ${parsed.data.amount} SAR. Maximum refundable amount is ${summary.net_paid.toFixed(2)} SAR.`,
      }
    }

    if (!finalCustomerId && summary.customer_id) {
      finalCustomerId = summary.customer_id
    }
  }

  let attachmentUrl: string | null = null
  if (file && file.size > 0) {
    const uploadRes = await uploadBusinessDocument(file, 'refunds', bookingId || finalCustomerId || 'direct')
    if (!uploadRes.success || !uploadRes.path) {
      return { success: false, error: uploadRes.error ?? 'Failed to upload refund attachment' }
    }
    attachmentUrl = uploadRes.path
  }

  const generatedRef = parsed.data.reference || `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const { data: refund, error: insertError } = await supabase
    .from('sales')
    .insert({
      reference: generatedRef,
      booking_id: bookingId,
      customer_id: finalCustomerId,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      type: 'refund',
      status: 'completed',
      source: bookingId ? 'booking' : 'direct_sale',
      notes: parsed.data.notes,
      attachment_url: attachmentUrl,
      created_by: session.userId,
    })
    .select('id, reference, amount')
    .single()

  if (insertError || !refund) {
    return { success: false, error: insertError?.message ?? 'Failed to issue refund' }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'sale.refund_issued',
    entityType: 'sale',
    entityId: refund.id,
    metadata: {
      reference: refund.reference,
      amount: refund.amount,
      payment_method: parsed.data.payment_method,
      booking_id: bookingId,
      customer_id: finalCustomerId,
      notes: parsed.data.notes,
    },
  })

  revalidatePath('/admin/sales')
  if (bookingId) {
    revalidatePath(`/admin/bookings/${bookingId}`)
    revalidatePath('/admin/bookings')
  }

  return { success: true, refundId: refund.id, reference: refund.reference }
}

export async function updateSaleNotes(formData: FormData) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const saleId = formData.get('saleId') as string
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!saleId) return { success: false, error: 'Sale ID required' }

  const { error } = await supabase
    .from('sales')
    .update({
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', saleId)

  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'sale.updated',
    entityType: 'sale',
    entityId: saleId,
    metadata: { notes },
  })

  revalidatePath('/admin/sales')
  return { success: true }
}

export async function archiveSale(saleId: string) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  if (!saleId) return { success: false, error: 'Sale ID required' }

  const { error } = await supabase
    .from('sales')
    .update({
      is_archived: true,
      status: 'void',
      updated_at: new Date().toISOString(),
    })
    .eq('id', saleId)

  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'sale.archived',
    entityType: 'sale',
    entityId: saleId,
    metadata: { is_archived: true, status: 'void' },
  })

  revalidatePath('/admin/sales')
  return { success: true }
}

export interface BookingFinancialSummary {
  booking_id: string
  booking_number: string
  customer_id: string | null
  price_sar: number
  total_paid: number
  total_refunded: number
  net_paid: number
  balance_due: number
  is_fully_paid: boolean
  has_overpayment: boolean
  sales: SaleRecord[]
}

export async function getBookingFinancialSummary(bookingId: string): Promise<BookingFinancialSummary | null> {
  await requireRole('manager')
  const supabase = await createClient()

  const { data: booking, error: bError } = await supabase
    .from('bookings')
    .select('id, booking_number, customer_id, price_sar')
    .eq('id', bookingId)
    .single()

  if (bError || !booking) return null

  const { data: sales, error: sError } = await supabase
    .from('sales')
    .select(`
      *,
      profiles!sales_created_by_fkey(full_name, email)
    `)
    .eq('booking_id', bookingId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true })

  if (sError) return null

  const priceSar = Number(booking.price_sar) || 0
  let totalPaid = 0
  let totalRefunded = 0

  for (const s of sales ?? []) {
    if (s.status === 'completed') {
      const amt = Number(s.amount) || 0
      if (s.type === 'payment') totalPaid += amt
      if (s.type === 'refund') totalRefunded += amt
    }
  }

  const netPaid = totalPaid - totalRefunded
  const balanceDue = Math.max(0, priceSar - netPaid)

  return {
    booking_id: booking.id,
    booking_number: booking.booking_number,
    customer_id: booking.customer_id,
    price_sar: priceSar,
    total_paid: totalPaid,
    total_refunded: totalRefunded,
    net_paid: netPaid,
    balance_due: balanceDue,
    is_fully_paid: netPaid >= priceSar && priceSar > 0,
    has_overpayment: netPaid > priceSar,
    sales: (sales ?? []) as SaleRecord[],
  }
}
