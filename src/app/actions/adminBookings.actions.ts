'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { sendBookingConfirmation, sendBookingCancellation, sendBookingReschedule } from '@/lib/notifications/email.service'
import { resolveServiceName } from '@/services/availability.service'

const PAGE_SIZE = 25

export interface AdminBookingRow {
  id: string
  booking_number: string
  date: string
  start_time: string
  end_time: string
  status: string
  price_sar: number
  notes: string
  created_at: string
  customer_name: string
  customer_phone: string
  service_name: string
  location_name: string
  source: string
  created_by_name: string | null
}

export async function getAdminBookings(params: {
  page?: number
  q?: string
  status?: string
  date?: string
  serviceId?: string
  locationId?: string
  source?: string
}) {
  const session = await requireRole('manager')
  const supabase = await createClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('bookings')
    .select(`
      id, booking_number, date, start_time, end_time, status, price_sar, notes, created_at, source, created_by,
      customers(full_name, phone),
      services(name_en),
      locations(name_en),
      profiles:created_by(full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status as 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show')
  }
  if (params.date) {
    query = query.eq('date', params.date)
  }
  if (params.serviceId && params.serviceId !== 'all') {
    query = query.eq('service_id', params.serviceId)
  }
  if (params.locationId && params.locationId !== 'all') {
    query = query.eq('location_id', params.locationId)
  }
  if (params.source && params.source !== 'all') {
    query = query.eq('source', params.source)
  }
  if (params.q) {
    query = query.or(`booking_number.ilike.%${params.q}%`)
  }

  const { data, count } = await query
  void session

  return {
    bookings: (data ?? []).map((b) => ({
      id: b.id,
      booking_number: b.booking_number ?? '',
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      status: b.status ?? 'pending',
      price_sar: Number(b.price_sar),
      notes: b.notes ?? '',
      created_at: b.created_at,
      customer_name: (b.customers as { full_name: string } | null)?.full_name ?? '—',
      customer_phone: (b.customers as { phone: string } | null)?.phone ?? '',
      service_name: (b.services as { name_en: string } | null)?.name_en ?? '—',
      location_name: (b.locations as { name_en: string } | null)?.name_en ?? '—',
      source: (b as { source?: string }).source ?? 'website',
      created_by_name: (b as { profiles?: { full_name: string } | null }).profiles?.full_name ?? null,
    })) as AdminBookingRow[],
    total: count ?? 0,
  }
}

export async function getAdminBookingById(id: string) {
  const session = await requireRole('manager')
  const supabase = await createClient()

  const { data } = await supabase
    .from('bookings')
    .select(`
      *, 
      customers(*),
      services(name_en, name_ar),
      locations(name_en, name_ar, address_en, address_ar),
      profiles:created_by(full_name)
    `)
    .eq('id', id)
    .single()

  void session
  return data
}

const UpdateStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  cancellationReason: z.string().max(500).optional(),
})

export async function updateBookingStatus(formData: FormData) {
  const session = await requireRole('manager')
  const parsed = UpdateStatusSchema.safeParse({
    bookingId: formData.get('bookingId'),
    status: formData.get('status'),
    cancellationReason: formData.get('cancellationReason') || undefined,
  })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = await createClient()

  const updateData: { 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'; 
    notes?: string 
  } = { status: parsed.data.status }

  const { data: currentBooking } = await supabase
    .from('bookings')
    .select(`
      booking_number, date, start_time, locale, notes, package_slug, price_sar,
      customers(full_name, email),
      services(name_ar, name_en, duration_minutes),
      locations(name_ar, name_en)
    `)
    .eq('id', parsed.data.bookingId)
    .single()

  if (parsed.data.status === 'cancelled' && parsed.data.cancellationReason) {
    // Fetch current notes to append
    const currentNotes = currentBooking?.notes || ''
    const newNotes = currentNotes 
      ? `${currentNotes}\n\n[Cancelled]: ${parsed.data.cancellationReason}`
      : `[Cancelled]: ${parsed.data.cancellationReason}`
    updateData.notes = newNotes
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', parsed.data.bookingId)

  if (error) {
    console.error('[Booking Update Error]', JSON.stringify({
      bookingId: parsed.data.bookingId,
      status: parsed.data.status,
      error: error
    }))
    return { error: `Failed to update database: ${error.message}` }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: `booking.status.${parsed.data.status}`,
    entityType: 'booking',
    entityId: parsed.data.bookingId,
    metadata: { 
      status: parsed.data.status,
      cancellationReason: parsed.data.cancellationReason 
    },
  })

  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${parsed.data.bookingId}`)

  // Send status change emails asynchronously if customer has email
  const customerData = currentBooking?.customers as unknown as { full_name: string; email: string } | null
  const serviceData = currentBooking?.services as unknown as { name_ar: string; name_en: string; duration_minutes?: number } | null
  const locationData = currentBooking?.locations as unknown as { name_ar: string; name_en: string } | null

  let notificationSent = false

  if (currentBooking && customerData?.email) {
    const serviceName = await resolveServiceName(null, currentBooking.package_slug) // fallback for package
    const resolvedNameAr = serviceData?.name_ar || serviceName.name_ar
    const resolvedNameEn = serviceData?.name_en || serviceName.name_en

    if (parsed.data.status === 'confirmed') {
      sendBookingConfirmation({
        bookingNumber: currentBooking.booking_number,
        date: currentBooking.date,
        startTime: currentBooking.start_time,
        durationMinutes: serviceData?.duration_minutes,
        serviceNameAr: resolvedNameAr,
        serviceNameEn: resolvedNameEn,
        locationNameAr: locationData?.name_ar || '',
        locationNameEn: locationData?.name_en || '',
        customerName: customerData?.full_name || '',
        customerEmail: customerData?.email,
        priceSar: currentBooking.price_sar ?? 0,
        locale: currentBooking.locale === 'ar' ? 'ar' : 'en',
      }).catch(err => console.error('[Booking Update Email Error]', err))
      notificationSent = true
    } else if (parsed.data.status === 'cancelled') {
      sendBookingCancellation({
        bookingNumber: currentBooking.booking_number,
        date: currentBooking.date,
        startTime: currentBooking.start_time,
        durationMinutes: serviceData?.duration_minutes,
        serviceNameAr: resolvedNameAr,
        serviceNameEn: resolvedNameEn,
        locationNameAr: locationData?.name_ar || '',
        locationNameEn: locationData?.name_en || '',
        customerName: customerData?.full_name || '',
        customerEmail: customerData?.email,
        priceSar: currentBooking.price_sar ?? 0,
        locale: currentBooking.locale === 'ar' ? 'ar' : 'en',
        cancellationReason: parsed.data.cancellationReason,
      }).catch(err => console.error('[Booking Update Email Error]', err))
      notificationSent = true
    }
  }

  return { success: true, bookingUpdated: true, notificationSent }
}

const RescheduleSchema = z.object({
  bookingId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function rescheduleBooking(formData: FormData) {
  const session = await requireRole('manager')
  const parsed = RescheduleSchema.safeParse({
    bookingId: formData.get('bookingId'),
    date: formData.get('date'),
    startTime: formData.get('startTime'),
  })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = await createClient()

  // 1. Get current booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      *,
      customers(full_name, email),
      services(name_ar, name_en),
      locations(name_ar, name_en)
    `)
    .eq('id', parsed.data.bookingId)
    .single()

  if (fetchError || !booking) return { error: 'Booking not found' }
  if (['completed', 'cancelled', 'no_show'].includes(booking.status)) {
    return { error: 'Cannot reschedule a completed or cancelled booking' }
  }

  if (!booking.location_id) return { error: 'Booking has no location' }

  // 2. Validate availability using existing service logic
  // We need to dynamically import so we don't circularly depend if we did, but let's just import at top.
  // Actually, we can fetch all other bookings to check collision
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('location_id', booking.location_id)
    .eq('date', parsed.data.date)
    .neq('status', 'cancelled')
    .neq('id', booking.id) // Exclude self!

  const { getAvailableSlots, resolveServiceDuration } = await import('@/services/availability.service')
  
  const slots = await getAvailableSlots({
    serviceId: booking.service_id,
    packageSlug: booking.package_slug,
    locationId: booking.location_id,
    date: parsed.data.date,
    existingBookings: (existingBookings ?? []).map((b) => ({
      start_time: b.start_time,
      end_time: b.end_time,
    })),
  })

  const requestedSlot = slots.find((s) => s.startTime === parsed.data.startTime)
  if (!requestedSlot?.available) {
    return { error: 'This time slot is no longer available. Please choose another.' }
  }

  const durationMinutes = await resolveServiceDuration(booking.service_id, booking.package_slug)
  if (!durationMinutes) return { error: 'Invalid service duration' }

  const [startH, startM] = parsed.data.startTime.split(':').map(Number)
  const endMinutes = startH * 60 + startM + durationMinutes
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

  // 3. Update DB
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      date: parsed.data.date,
      start_time: parsed.data.startTime + ':00',
      end_time: endTime + ':00',
    })
    .eq('id', booking.id)

  if (updateError) {
    if (updateError.code === '23505') return { error: 'Slot was just booked by someone else.' }
    return { error: updateError.message }
  }

  // 4. Audit
  await writeAuditLog({
    adminUserId: session.userId,
    action: 'booking.rescheduled',
    entityType: 'booking',
    entityId: booking.id,
    metadata: {
      oldDate: booking.date,
      oldStartTime: booking.start_time,
      newDate: parsed.data.date,
      newStartTime: parsed.data.startTime,
    },
  })

  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${booking.id}`)
  revalidatePath('/admin/calendar')

  // Send reschedule email asynchronously
  const bookingCustomer = booking.customers as unknown as { full_name: string; email: string } | null
  const bookingService = booking.services as unknown as { name_ar: string; name_en: string } | null
  const bookingLocation = booking.locations as unknown as { name_ar: string; name_en: string } | null

  if (bookingCustomer?.email) {
    const serviceName = await resolveServiceName(null, booking.package_slug)
    const resolvedNameAr = bookingService?.name_ar || serviceName.name_ar
    const resolvedNameEn = bookingService?.name_en || serviceName.name_en

    sendBookingReschedule({
      bookingNumber: booking.booking_number,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      oldDate: booking.date,
      oldStartTime: booking.start_time,
      serviceNameAr: resolvedNameAr,
      serviceNameEn: resolvedNameEn,
      locationNameAr: bookingLocation?.name_ar || '',
      locationNameEn: bookingLocation?.name_en || '',
      customerName: bookingCustomer?.full_name || '',
      customerEmail: bookingCustomer?.email,
      priceSar: booking.price_sar,
      locale: booking.locale === 'ar' ? 'ar' : 'en',
    }).catch(console.error)
  }

  return { success: true }
}
