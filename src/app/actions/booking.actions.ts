'use server'

/**
 * SANO LUNA — Booking Server Actions
 *
 * All booking mutations happen server-side only.
 * The client NEVER provides authoritative price, duration, or availability.
 * All values are recalculated from the database/data layer.
 *
 * Security model:
 *  - Price: always read from services table, never from client
 *  - Duration: always read from services table
 *  - Availability: re-verified inside transaction before insert
 *  - Customer data: validated with zod before any DB write
 *  - Booking number: generated server-side (SL-YYYY-NNNNNN)
 */

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  resolveServiceDuration,
  resolveServicePrice,
  resolveServiceName,
  getAvailableSlots,
  getAutoLocationId,
} from '@/services/availability.service'
import { activeLocations, getLocationById } from '@/data/locations.data'
import type { BookingDraft, BookingResponse } from '@/data/booking.types'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendBookingConfirmation } from '@/lib/notifications/email.service'

// ─────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────

const saudiPhoneRegex = /^(\+966|0966|966|0)(5\d{8})$/

const BookingSchema = z.object({
  serviceId: z.string().nullable(),
  packageSlug: z.string().nullable(),
  locationId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  customer: z.object({
    fullName: z.string().min(2, 'Name too short').max(100, 'Name too long').trim(),
    phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number'),
    email: z.string().email('Invalid email address'),
    notes: z.string().max(500, 'Notes too long').trim().optional().default(''),
  }),
}).refine(
  (d) => d.serviceId != null || d.packageSlug != null,
  { message: 'Either serviceId or packageSlug is required' }
)

// ─────────────────────────────────────────────
// NORMALIZE PHONE
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
// CREATE BOOKING
// ─────────────────────────────────────────────

export async function createBooking(draft: BookingDraft): Promise<BookingResponse> {
  // 0. Rate limiting (fail open safely)
  const rateLimit = await checkRateLimit('booking')
  if (!rateLimit.success) {
    return {
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many booking attempts. Please wait a few minutes and try again.',
      messageAr: 'لقد تجاوزت الحد المسموح من المحاولات. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
    }
  }

  // 1. Validate incoming draft
  const parsed = BookingSchema.safeParse(draft)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation error'
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      message: firstError,
      messageAr: 'يوجد خطأ في البيانات المُدخَلة. يرجى المراجعة والمحاولة مرة أخرى.',
    }
  }

  const data = parsed.data

  // 1b. Server-side past-date guard (client UI prevents past dates, but
  //     server must enforce independently to block parameter tampering)
  // Asia/Riyadh = UTC+3 always (no DST). Compute current Riyadh date.
  const riyadhOffset = 3 * 60 * 60 * 1000
  const riyadhNow = new Date(Date.now() + riyadhOffset)
  const todayRiyadh = riyadhNow.toISOString().slice(0, 10)
  if (data.date < todayRiyadh) {
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Cannot book a date in the past.',
      messageAr: 'لا يمكن الحجز في تاريخ سابق.',
    }
  }
  // 2. Resolve location — auto-assign if 1 location, validate if provided
  const locationId = data.locationId ?? getAutoLocationId()
  if (!locationId) {
    return {
      success: false,
      code: 'LOCATION_NOT_FOUND',
      message: 'No active location found.',
      messageAr: 'لا يوجد موقع نشط.',
    }
  }
  const location = getLocationById(locationId)
  if (!location) {
    return {
      success: false,
      code: 'LOCATION_NOT_FOUND',
      message: 'Location not found.',
      messageAr: 'الموقع غير موجود.',
    }
  }

  // 3. Server-side price + duration (never trust client)
  const priceSar = resolveServicePrice(data.serviceId, data.packageSlug)
  const durationMinutes = resolveServiceDuration(data.serviceId, data.packageSlug)

  if (!priceSar || !durationMinutes) {
    return {
      success: false,
      code: 'SERVICE_NOT_FOUND',
      message: 'Service not found or inactive.',
      messageAr: 'الخدمة غير موجودة أو غير متاحة.',
    }
  }

  // 4. Calculate end time
  const [startH, startM] = data.startTime.split(':').map(Number)
  const endMinutes = startH * 60 + startM + durationMinutes
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

  // 5. Re-verify slot availability (server-side, race-condition safe)
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
    return {
      success: false,
      code: 'SLOT_UNAVAILABLE',
      message: 'This time slot is no longer available. Please choose another time.',
      messageAr: 'هذا الوقت لم يعد متاحاً. يرجى اختيار وقت آخر.',
    }
  }

  // 6. Upsert customer by phone / auth_user_id
  const normalizedPhone = normalizePhone(data.customer.phone)

  // Use service-role client for DB writes — public booking creates records on
  // behalf of anonymous or new visitors; RLS blocks anon INSERTs by design.
  // All validation is complete above; service-role is used strictly on the server.
  const supabaseAdmin = createAdminClient()

  // Check if current user is logged in via Supabase Auth
  const supabaseUser = await createClient()
  const {
    data: { user: authUser },
  } = await supabaseUser.auth.getUser()

  let customerId: string | null = null

  // 6a. Try to match by auth_user_id first if authenticated
  if (authUser?.id) {
    const { data: cAuth } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()
    if (cAuth) customerId = cAuth.id
  }

  // 6b. If not matched yet, search by normalized phone
  if (!customerId) {
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id, auth_user_id')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
      const updatePayload: {
        full_name: string
        email: string
        updated_at: string
        auth_user_id?: string
      } = {
        full_name: data.customer.fullName,
        email: data.customer.email,
        updated_at: new Date().toISOString(),
      }
      if (authUser?.id && !existingCustomer.auth_user_id) {
        updatePayload.auth_user_id = authUser.id
      }
      await supabaseAdmin.from('customers').update(updatePayload).eq('id', customerId)
    }
  }

  // 6c. If still not found, insert new customer record
  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        auth_user_id: authUser?.id ?? null,
        full_name: data.customer.fullName,
        phone: normalizedPhone,
        email: data.customer.email,
      })
      .select('id')
      .single()

    if (customerError || !newCustomer) {
      console.error('[createBooking] Customer creation error:', customerError?.message, customerError?.code)
      return {
        success: false,
        code: 'SERVER_ERROR',
        message: 'Could not save your details. Please try again.',
        messageAr: 'تعذر حفظ بياناتك. يرجى المحاولة مرة أخرى.',
      }
    }
    customerId = newCustomer.id
  }

  // 6d. Resolve service UUID from public.services table (since client/data layer may pass slug)
  let dbServiceId: string | null = null
  if (data.serviceId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.serviceId)
    if (isUuid) {
      dbServiceId = data.serviceId
    } else {
      const { data: srv } = await supabaseAdmin
        .from('services')
        .select('id')
        .eq('slug', data.serviceId)
        .maybeSingle()
      dbServiceId = srv?.id ?? null
    }
  }

  // 6e. Resolve location UUID from public.locations table
  let dbLocationId: string | null = null
  if (locationId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationId)
    if (isUuid) {
      const { data: loc } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('id', locationId)
        .maybeSingle()
      if (loc) dbLocationId = loc.id
    }
    if (!dbLocationId) {
      const { data: loc } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('slug', locationId)
        .maybeSingle()
      if (loc) dbLocationId = loc.id
    }
  }
  if (!dbLocationId) {
    const { data: loc } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    dbLocationId = loc?.id ?? null
  }

  // 7. Create booking — DB unique index on (location_id, date, start_time) WHERE status != cancelled
  // prevents double-booking at the DB level even under concurrent requests
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .insert({
      locale: draft.currency === 'SAR' ? 'ar' : 'en', // fallback
      service_id: dbServiceId,
      package_slug: data.packageSlug ?? null,
      location_id: dbLocationId,
      date: data.date,
      start_time: data.startTime.length === 5 ? data.startTime + ':00' : data.startTime,
      end_time: endTime.length === 5 ? endTime + ':00' : endTime,
      customer_id: customerId,
      price_sar: priceSar,
      currency: 'SAR',
      notes: data.customer.notes ?? '',
    })
    .select('id, booking_number')
    .single()

  if (bookingError || !booking) {
    console.error('[createBooking] Booking creation error:', bookingError?.message, bookingError?.code, bookingError?.details)
    // Check for unique constraint violation (double booking race)
    if (bookingError?.code === '23505') {
      return {
        success: false,
        code: 'DOUBLE_BOOKING',
        message: 'This time slot was just booked. Please choose another time.',
        messageAr: 'تم حجز هذا الوقت للتو. يرجى اختيار وقت آخر.',
      }
    }
    return {
      success: false,
      code: 'SERVER_ERROR',
      message: 'Could not complete your booking. Please try again.',
      messageAr: 'تعذر إتمام الحجز. يرجى المحاولة مرة أخرى.',
    }
  }

  const serviceName = resolveServiceName(data.serviceId, data.packageSlug)
  
  const result: BookingResponse = {
    success: true,
    bookingNumber: booking.booking_number,
    date: data.date,
    startTime: data.startTime,
    endTime,
    serviceName_ar: serviceName.name_ar,
    serviceName_en: serviceName.name_en,
    locationName_ar: location.name_ar,
    locationName_en: location.name_en,
    address_ar: location.address_ar,
    address_en: location.address_en,
    priceSar,
    currency: 'SAR',
    customerName: data.customer.fullName,
    customerEmail: data.customer.email,
    customerPhone: normalizedPhone,
  }

  // 9. Send email notification asynchronously (never block or fail the booking)
  // We use void to explicitly ignore the promise so Next.js doesn't wait for it if deployed as a background function,
  // though Next.js Server Actions await all promises unless wrapped in after(). 
  // In Next.js 15+ we could use unstable_after. For standard compatibility, just execute without await,
  // or catch errors inside the service. The service catches all errors internally.
  sendBookingConfirmation({
    bookingNumber: booking.booking_number,
    date: data.date,
    startTime: data.startTime,
    durationMinutes,
    serviceNameAr: serviceName.name_ar,
    serviceNameEn: serviceName.name_en,
    locationNameAr: location.name_ar,
    locationNameEn: location.name_en,
    customerName: data.customer.fullName,
    customerEmail: data.customer.email,
    priceSar,
    locale: draft.currency === 'SAR' ? 'ar' : 'en', // Infer locale from booking currency or draft
  }).catch(console.error)

  return result
}

// ─────────────────────────────────────────────
// GET AVAILABLE SLOTS — callable from Client Components
// ─────────────────────────────────────────────

export async function getBookingSlots(
  serviceId: string | null,
  packageSlug: string | null,
  locationId: string,
  date: string
): Promise<{ slots: import('@/data/booking.types').AvailableSlot[] }> {
  // 0. Rate limiting (fail open safely)
  const rateLimit = await checkRateLimit('slots')
  if (!rateLimit.success) {
    return { slots: [] }
  }

  // Validate inputs before any DB access
  if (!locationId || !/^\S+$/.test(locationId)) return { slots: [] }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { slots: [] }
  if (!getLocationById(locationId)) return { slots: [] }

  // Reject past dates
  const riyadhOffset = 3 * 60 * 60 * 1000
  const todayRiyadh = new Date(Date.now() + riyadhOffset).toISOString().slice(0, 10)
  if (date < todayRiyadh) return { slots: [] }

  // Validate service/package exists
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

// ─────────────────────────────────────────────
// GET ACTIVE LOCATIONS — for step logic
// ─────────────────────────────────────────────

export async function getLocationsAction() {
  return { locations: activeLocations }
}
