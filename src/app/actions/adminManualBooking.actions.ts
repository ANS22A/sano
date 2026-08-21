'use server'

/**
 * SANO LUNA — Admin Manual Booking Creation (Phase 9-B)
 *
 * Thin wrapper around the existing booking engine.
 * Reuses: availability service, customer upsert, audit logging.
 * Does NOT duplicate booking logic.
 */

import { z } from 'zod'
import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import {
  resolveServiceDuration,
  resolveServicePrice,
  resolveServiceName,
  getAvailableSlots,
  getAutoLocationId,
} from '@/services/availability.service'
import { getLocationById } from '@/data/locations.data'
import { sendBookingCreated } from '@/lib/notifications/email.service'
import { revalidatePath } from 'next/cache'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type BookingSource = 'website' | 'whatsapp' | 'phone' | 'admin' | 'other'

export interface AdminBookingInput {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  serviceId: string | null
  packageSlug: string | null
  locationId: string | null
  date: string
  startTime: string
  source: BookingSource
  notes?: string
  recordPaymentNow?: boolean
  paymentMethod?: 'cash' | 'credit_card' | 'mada' | 'bank_transfer' | 'apple_pay' | 'stc_pay' | 'other'
}

export interface AdminBookingResult {
  success: boolean
  bookingNumber?: string
  error?: string
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

const saudiPhoneRegex = /^(\+966|0966|966|0)(5\d{8})$/

const AdminBookingSchema = z.object({
  customerName: z.string().min(2, 'Name too short').max(100).trim(),
  customerPhone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerAddress: z.string().max(500).optional().or(z.literal('')),
  serviceId: z.string().nullable(),
  packageSlug: z.string().nullable(),
  locationId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  source: z.enum(['website', 'whatsapp', 'phone', 'admin', 'other']),
  notes: z.string().max(1000).optional().or(z.literal('')),
  recordPaymentNow: z.boolean().optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'mada', 'bank_transfer', 'apple_pay', 'stc_pay', 'other']).optional(),
}).refine(
  (d) => d.serviceId != null || d.packageSlug != null,
  { message: 'Either serviceId or packageSlug is required' }
)

// ─────────────────────────────────────────────
// PHONE NORMALIZATION (reused from booking.actions)
// ─────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966')) return '+' + digits
  if (digits.startsWith('0966')) return '+' + digits.slice(1)
  if (digits.startsWith('05')) return '+966' + digits.slice(1)
  if (digits.startsWith('5')) return '+966' + digits
  return phone
}

// ─────────────────────────────────────────────
// CREATE ADMIN BOOKING
// ─────────────────────────────────────────────

export async function createAdminBooking(input: AdminBookingInput): Promise<AdminBookingResult> {
  // 1. Auth — only manager+ can create bookings
  const session = await requireRole('manager')

  // 2. Validate input
  const parsed = AdminBookingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' }
  }
  const data = parsed.data

  // 3. Resolve location
  const locationId = data.locationId ?? getAutoLocationId()
  if (!locationId) return { success: false, error: 'No active location found.' }
  const location = getLocationById(locationId)
  if (!location) return { success: false, error: 'Location not found.' }

  // 4. Server-side price + duration (never trust client)
  const priceSar = resolveServicePrice(data.serviceId, data.packageSlug)
  const durationMinutes = resolveServiceDuration(data.serviceId, data.packageSlug)
  if (!priceSar || !durationMinutes) {
    return { success: false, error: 'Service not found or inactive.' }
  }

  // 5. Calculate end time
  const [startH, startM] = data.startTime.split(':').map(Number)
  const endMinutes = startH * 60 + startM + durationMinutes
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

  // 6. Verify slot availability (server-side, race-condition safe)
  const supabase = await createClient()

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('location_id', locationId)
    .eq('date', data.date)
    .neq('status', 'cancelled')

  const slots = await getAvailableSlots({
    serviceId: data.serviceId,
    packageSlug: data.packageSlug,
    locationId,
    date: data.date,
    existingBookings: (existingBookings ?? []).map((b) => ({
      start_time: b.start_time,
      end_time: b.end_time,
    })),
  })

  const requestedSlot = slots.find((s) => s.startTime === data.startTime)
  if (!requestedSlot?.available) {
    return { success: false, error: 'This time slot is no longer available.' }
  }

  // 7. Customer upsert by phone (reuses existing pattern from booking.actions)
  const normalizedPhone = normalizePhone(data.customerPhone)

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', normalizedPhone)
    .maybeSingle()

  let customerId: string

  if (existingCustomer) {
    customerId = existingCustomer.id
    await supabase
      .from('customers')
      .update({
        full_name: data.customerName,
        ...(data.customerEmail ? { email: data.customerEmail } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: data.customerName,
        phone: normalizedPhone,
        email: data.customerEmail || null,
      })
      .select('id')
      .single()

    if (customerError || !newCustomer) {
      return { success: false, error: 'Could not save customer details.' }
    }
    customerId = newCustomer.id
  }

  // 8. Create booking with source + created_by
  const bookingNotes = [data.customerAddress, data.notes].filter(Boolean).join('\n\n')

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      locale: 'ar',
      service_id: data.serviceId ?? null,
      package_slug: data.packageSlug ?? null,
      location_id: locationId,
      date: data.date,
      start_time: data.startTime + ':00',
      end_time: endTime + ':00',
      customer_id: customerId,
      price_sar: priceSar,
      currency: 'SAR',
      notes: bookingNotes,
      source: data.source,
      created_by: session.userId,
    })
    .select('id, booking_number')
    .single()

  if (bookingError || !booking) {
    if (bookingError?.code === '23505') {
      return { success: false, error: 'This time slot was just booked. Please choose another.' }
    }
    return { success: false, error: bookingError?.message ?? 'Could not create booking.' }
  }

  // 9. Audit log
  await writeAuditLog({
    adminUserId: session.userId,
    action: 'booking.admin_created',
    entityType: 'booking',
    entityId: booking.id,
    metadata: {
      source: data.source,
      customerPhone: normalizedPhone,
      bookingNumber: booking.booking_number,
      paymentRecorded: !!data.recordPaymentNow,
    },
  })

  // 9.5 Optional: Record initial payment into sales ledger
  if (data.recordPaymentNow) {
    const generatedRef = `SAL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const { data: sale } = await supabase
      .from('sales')
      .insert({
        reference: generatedRef,
        booking_id: booking.id,
        customer_id: customerId,
        amount: priceSar,
        payment_method: data.paymentMethod || 'mada',
        type: 'payment',
        status: 'completed',
        source: 'admin',
        notes: 'Recorded during manual booking creation',
        created_by: session.userId,
      })
      .select('id, reference')
      .single()

    if (sale) {
      await writeAuditLog({
        adminUserId: session.userId,
        action: 'sale.payment_recorded',
        entityType: 'sale',
        entityId: sale.id,
        metadata: {
          reference: sale.reference,
          amount: priceSar,
          payment_method: data.paymentMethod || 'mada',
          booking_id: booking.id,
          customer_id: customerId,
          source: 'admin',
        },
      })
    }
  }

  // 10. Revalidate admin pages
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin/sales')

  // 11. Send notification email asynchronously (never block or fail the booking)
  if (data.customerEmail) {
    const serviceName = resolveServiceName(data.serviceId, data.packageSlug)
    sendBookingCreated({
      bookingNumber: booking.booking_number,
      date: data.date,
      startTime: data.startTime,
      durationMinutes,
      serviceNameAr: serviceName.name_ar,
      serviceNameEn: serviceName.name_en,
      locationNameAr: location.name_ar,
      locationNameEn: location.name_en,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      priceSar,
      locale: 'ar',
    }).catch(console.error)
  }

  return { success: true, bookingNumber: booking.booking_number }
}

// ─────────────────────────────────────────────
// SEARCH CUSTOMERS (for admin booking form)
// ─────────────────────────────────────────────

export async function searchCustomersForBooking(query: string) {
  await requireRole('manager')
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('customers')
    .select('id, full_name, phone, email')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  return data ?? []
}

// ─────────────────────────────────────────────
// GET SERVICES FOR ADMIN BOOKING
// ─────────────────────────────────────────────

export async function getServicesForBooking() {
  await requireRole('manager')
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('id, name_en, name_ar, price_sar, duration_minutes')
    .eq('is_active', true)
    .order('sort_order')
  return data ?? []
}

// ─────────────────────────────────────────────
// GET ADMIN BOOKING SLOTS (no rate limiting for admin)
// ─────────────────────────────────────────────

export async function getAdminBookingSlots(
  serviceId: string | null,
  packageSlug: string | null,
  locationId: string,
  date: string
) {
  await requireRole('manager')

  if (!locationId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { slots: [] }
  if (!getLocationById(locationId)) return { slots: [] }
  if (!serviceId && !packageSlug) return { slots: [] }

  const supabase = await createClient()
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('location_id', locationId)
    .eq('date', date)
    .neq('status', 'cancelled')

  const slots = await getAvailableSlots({
    serviceId,
    packageSlug,
    locationId,
    date,
    existingBookings: (existingBookings ?? []).map((b) => ({
      start_time: b.start_time,
      end_time: b.end_time,
    })),
  })

  return { slots }
}
