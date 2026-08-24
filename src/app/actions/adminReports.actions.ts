'use server'

import { requireRole } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function getAdminReports(params: { from: string; to: string }) {
  await requireRole('manager')
  const supabase = await createClient()

  const [{ data: bookings }, { data: byService }] = await Promise.all([
    supabase
      .from('bookings')
      .select('status, price_sar, date')
      .gte('date', params.from)
      .lte('date', params.to),
    supabase
      .from('bookings')
      .select('services(name_en), price_sar')
      .gte('date', params.from)
      .lte('date', params.to)
      .neq('status', 'cancelled')
      .not('service_id', 'is', null),
  ])

  const all = bookings ?? []
  const totalRevenue = all.filter(b => b.status !== 'cancelled').reduce((s, b) => s + Number(b.price_sar), 0)
  const totalBookings = all.length
  const confirmed = all.filter(b => b.status === 'confirmed').length
  const cancelled = all.filter(b => b.status === 'cancelled').length
  const completed = all.filter(b => b.status === 'completed').length

  // Top services by booking count
  const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const b of byService ?? []) {
    const name = (b.services as { name_en: string } | null)?.name_en ?? 'Unknown'
    if (!serviceMap[name]) serviceMap[name] = { name, count: 0, revenue: 0 }
    serviceMap[name].count++
    serviceMap[name].revenue += Number(b.price_sar)
  }
  const topServices = Object.values(serviceMap).sort((a, b) => b.count - a.count).slice(0, 10)

  return { totalRevenue, totalBookings, confirmed, cancelled, completed, topServices }
}

export interface OwnerFinancialStats {
  realized_revenue: number
  operating_expenses: number
  purchases: number
  salaries_paid: number
  partner_withdrawals: number
  net_operating_profit: number
  net_cash_movement: number
  expected_revenue: number
  outstanding_balance: number
  bookings_total: number
  bookings_completed: number
  bookings_cancelled: number
  bookings_pending: number
  customer_count: number
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD')

export async function getOwnerFinancialStats(startDate: string, endDate: string): Promise<{ data: OwnerFinancialStats | null; error: string | null }> {
  // 1. RBAC: Only admin can access owner stats
  await requireRole('admin')

  // 2. Input Validation
  try {
    dateSchema.parse(startDate)
    dateSchema.parse(endDate)
  } catch {
    return { data: null, error: 'Invalid date format. Expected YYYY-MM-DD.' }
  }

  if (startDate > endDate) {
    return { data: null, error: 'Start date must be before or equal to end date' }
  }

  const supabase = await createClient()

  // 3. RPC Call
  // @ts-expect-error RPC might not be in database.types.ts yet
  const { data, error } = await supabase.rpc('get_owner_financial_stats', {
    p_start_date: startDate,
    p_end_date: endDate
  })

  if (error) {
    console.error('[Dashboard RPC Error]', JSON.stringify({
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    }))
    return { data: null, error: `Failed to retrieve financial statistics. (Diagnostics Code: ${error.code || 'UNKNOWN'})` }
  }

  return { data: data as unknown as OwnerFinancialStats, error: null }
}
export async function getReportSales(startDate: string, endDate: string) {
  await requireRole('admin')
  const supabase = await createClient()

  // Note: we might need to query the database using the UTC bounds if 'created_at' is used,
  // but let's query the sales table. Wait, in Phase 9-D.4.1 we queried:
  // (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Riyadh')::date >= p_start_date
  // But from JS we can just fetch and filter, or we can use `.gte('created_at', startUTC).lte('created_at', endUTC)`
  
  // Let's create the UTC bounds for Asia/Riyadh
  const startUTC = new Date(`${startDate}T00:00:00+03:00`).toISOString()
  const endUTC = new Date(`${endDate}T23:59:59.999+03:00`).toISOString()

  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      amount,
      type,
      payment_method,
      source,
      status,
      created_at,
      bookings ( id, booking_number, customers ( full_name ) )
    `)
    .gte('created_at', startUTC)
    .lte('created_at', endUTC)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to fetch sales report')
  return data
}

export async function getReportExpenses(startDate: string, endDate: string) {
  await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      amount,
      date,
      reference,
      payment_method,
      expense_categories ( name_en, name_ar )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_archived', false)
    .order('date', { ascending: false })

  if (error) throw new Error('Failed to fetch expenses report: ' + error.message)
  return data
}

export async function getReportPurchases(startDate: string, endDate: string) {
  await requireRole('admin')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      amount,
      date,
      reference,
      payment_status,
      suppliers ( name )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_archived', false)
    .order('date', { ascending: false })

  if (error) throw new Error('Failed to fetch purchases report')
  return data
}

export async function getReportPayroll(startDate: string, endDate: string) {
  await requireRole('admin')
  const supabase = await createClient()

  const [salariesRes, withdrawalsRes] = await Promise.all([
    supabase
      .from('salaries')
      .select(`
        id,
        payment_date,
        month,
        gross_salary,
        bonuses,
        advances_deducted,
        other_deductions,
        net_salary,
        payment_status,
        created_at,
        staff ( name_en, name_ar )
      `)
      .eq('is_archived', false)
      .or(`payment_date.gte.${startDate},and(payment_date.is.null,created_at.gte.${startDate}T00:00:00)`)
      .or(`payment_date.lte.${endDate},and(payment_date.is.null,created_at.lte.${endDate}T23:59:59.999)`)
      .order('payment_date', { ascending: false }),
    supabase
      .from('partner_withdrawals')
      .select(`
        id,
        date,
        amount,
        status,
        reference,
        partners:partner_id ( name )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_archived', false)
      .order('date', { ascending: false })
  ])

  if (salariesRes.error || withdrawalsRes.error) {
    throw new Error('Failed to fetch payroll report')
  }

  return {
    salaries: salariesRes.data,
    withdrawals: withdrawalsRes.data
  }
}

export async function getReportReceivables(startDate: string, endDate: string) {
  await requireRole('admin')
  const supabase = await createClient()

  // 1. Fetch completed bookings in range
  const { data: bookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_number,
      date,
      price_sar,
      status,
      customers ( full_name )
    `)
    .eq('status', 'completed')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (bookingsErr) throw new Error('Failed to fetch bookings for receivables')
  if (!bookings || bookings.length === 0) return []

  const bookingIds = bookings.map(b => b.id)

  // 2. Fetch all completed, non-archived sales linked to these bookings (ANY DATE)
  const { data: sales, error: salesErr } = await supabase
    .from('sales')
    .select('booking_id, amount, type')
    .in('booking_id', bookingIds)
    .eq('status', 'completed')
    .eq('is_archived', false)

  if (salesErr) throw new Error('Failed to fetch sales for receivables')

  // 3. Aggregate net realized sales per booking
  const salesByBooking: Record<string, { paid: number, refunded: number, net: number }> = {}
  for (const s of sales || []) {
    if (!s.booking_id) continue
    if (!salesByBooking[s.booking_id]) {
      salesByBooking[s.booking_id] = { paid: 0, refunded: 0, net: 0 }
    }
    const amt = Number(s.amount)
    if (s.type === 'payment') {
      salesByBooking[s.booking_id].paid += amt
      salesByBooking[s.booking_id].net += amt
    } else if (s.type === 'refund') {
      salesByBooking[s.booking_id].refunded += amt
      salesByBooking[s.booking_id].net -= amt
    }
  }

  // 4. Calculate outstanding balance
  return bookings.map(b => {
    const price = Number(b.price_sar || 0)
    const stats = salesByBooking[b.id] || { paid: 0, refunded: 0, net: 0 }
    const outstanding = Math.max(price - stats.net, 0)
    
    return {
      id: b.id,
      booking_number: b.booking_number,
      date: b.date,
      customer_name: b.customers?.full_name || 'Unknown',
      price_sar: price,
      amount_paid: stats.paid,
      amount_refunded: stats.refunded,
      outstanding_balance: outstanding,
      status: b.status
    }
  })
}

