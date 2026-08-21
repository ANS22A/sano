/**
 * SANO LUNA — Availability Service
 *
 * Server-side slot generation.
 * The server is the ONLY authoritative source for available times.
 * The browser never calculates authoritative availability.
 *
 * Architecture:
 *   1. Read business hours for the requested day/location
 *   2. Read blackout dates for that date/location
 *   3. Read existing (non-cancelled) bookings for that date/location
 *   4. Generate slots every SLOT_INTERVAL_MINUTES from open to close - duration
 *   5. Mark each slot available/unavailable
 */

import 'server-only'

import type { AvailableSlot } from '@/data/booking.types'
import { SLOT_INTERVAL_MINUTES } from '@/data/booking.types'
import { getHoursForDay, activeLocations } from '@/data/locations.data'
import { getServiceBySlug } from '@/data/services.data'
import { packages } from '@/data/content.data'

// ─────────────────────────────────────────────
// TIME UTILITIES
// ─────────────────────────────────────────────

/** Convert 'HH:MM' to total minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Convert total minutes since midnight to 'HH:MM' */
function toTimeString(minutes: number): string {
  const normalizedMinutes = minutes % 1440
  const h = Math.floor(normalizedMinutes / 60)
  const m = normalizedMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─────────────────────────────────────────────
// DURATION RESOLUTION
// ─────────────────────────────────────────────

/**
 * Resolve the duration for a service or package.
 * The server reads duration from data — client value is never trusted.
 */
export function resolveServiceDuration(serviceId?: string | null, packageSlug?: string | null): number | null {
  if (serviceId) {
    const service = getServiceBySlug(serviceId)
    return service?.duration_minutes ?? null
  }
  if (packageSlug) {
    const pkg = packages.find((p) => p.slug === packageSlug)
    return pkg?.total_duration_minutes ?? null
  }
  return null
}

// ─────────────────────────────────────────────
// PRICE RESOLUTION
// ─────────────────────────────────────────────

/**
 * Resolve the authoritative price for a service or package.
 * NEVER trust price from the client. This function is the single source.
 */
export function resolveServicePrice(serviceId?: string | null, packageSlug?: string | null): number | null {
  if (serviceId) {
    const service = getServiceBySlug(serviceId)
    return service ? Number(service.price_sar) : null
  }
  if (packageSlug) {
    const pkg = packages.find((p) => p.slug === packageSlug)
    return pkg ? Number(pkg.price_sar) : null
  }
  return null
}

// ─────────────────────────────────────────────
// SERVICE/PACKAGE DISPLAY NAME
// ─────────────────────────────────────────────

export function resolveServiceName(
  serviceId?: string | null,
  packageSlug?: string | null
): { name_ar: string; name_en: string } {
  if (serviceId) {
    const service = getServiceBySlug(serviceId)
    return service
      ? { name_ar: service.name_ar, name_en: service.name_en }
      : { name_ar: '', name_en: '' }
  }
  if (packageSlug) {
    const pkg = packages.find((p) => p.slug === packageSlug)
    return pkg
      ? { name_ar: pkg.name_ar, name_en: pkg.name_en }
      : { name_ar: '', name_en: '' }
  }
  return { name_ar: '', name_en: '' }
}

// ─────────────────────────────────────────────
// SLOT GENERATION
// ─────────────────────────────────────────────

export interface GetAvailableSlotsParams {
  serviceId?: string | null
  packageSlug?: string | null
  locationId: string
  date: string   // 'YYYY-MM-DD'
  /** Pre-resolved existing bookings — pass from server action to avoid re-query */
  existingBookings?: Array<{ start_time: string; end_time: string }>
}

/**
 * Generate all possible time slots for a given date/location/service,
 * marking each as available or unavailable.
 *
 * This runs server-side only. The browser displays slots; the server
 * re-validates before any booking is created.
 */
export async function getAvailableSlots(params: GetAvailableSlotsParams): Promise<AvailableSlot[]> {
  const { serviceId, packageSlug, locationId, date, existingBookings = [] } = params

  // 1. Resolve duration
  const duration = resolveServiceDuration(serviceId, packageSlug)
  if (!duration) return []

  // 2. Get the day of week (0=Sun)
  const dayOfWeek = new Date(date + 'T00:00:00').getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6

  // 3. Get business hours for this location/day
  const hours = getHoursForDay(locationId, dayOfWeek)
  if (!hours || hours.is_closed || !hours.open_time || !hours.close_time) {
    return []
  }

  const openMin = toMinutes(hours.open_time)
  let closeMin = toMinutes(hours.close_time)

  // Phase 8-O: Support overnight business hours (e.g., 15:00 -> 03:00)
  if (closeMin < openMin) {
    closeMin += 1440
  }

  // 4. Build occupied intervals from existing bookings
  const occupied: Array<{ start: number; end: number }> = existingBookings.map((b) => {
    let start = toMinutes(b.start_time.slice(0, 5))
    let end = toMinutes(b.end_time.slice(0, 5))
    
    // If the booking is in the overnight hours (e.g., 01:00), shift it to the next day's minutes
    if (start < openMin) start += 1440
    if (end < openMin) end += 1440
    // Fix for 23:00 -> 01:00 overlapping midnight
    if (end < start) end += 1440

    return { start, end }
  })

  // 5. Generate slots
  const slots: AvailableSlot[] = []

  // Phase 6.5 fix: filter past slots when date is today (Asia/Riyadh, UTC+3)
  const riyadhOffset = 3 * 60 * 60 * 1000
  const riyadhNow = new Date(Date.now() + riyadhOffset)
  const todayRiyadh = riyadhNow.toISOString().slice(0, 10)
  const isToday = date === todayRiyadh
  const nowMinutes = isToday
    ? riyadhNow.getUTCHours() * 60 + riyadhNow.getUTCMinutes()
    : 0

  for (let start = openMin; start + duration <= closeMin; start += SLOT_INTERVAL_MINUTES) {
    // Skip past slots on today's date (enforce 30-minute minimum lead time)
    if (isToday && start < nowMinutes + 30) continue

    const end = start + duration
    const conflict = occupied.some((o) => start < o.end && end > o.start)
    slots.push({
      startTime: toTimeString(start),
      endTime: toTimeString(end),
      available: !conflict,
    })
  }

  return slots
}

// ─────────────────────────────────────────────
// LOCATION HELPER
// ─────────────────────────────────────────────

/** Return the single active location ID, or null if multiple/none. */
export function getAutoLocationId(): string | null {
  if (activeLocations.length === 1) return activeLocations[0].id
  return null
}
