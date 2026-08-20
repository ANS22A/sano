/**
 * SANO LUNA — Location Seed Data
 *
 * Development seed data for locations and business hours.
 * DEMO DATA — replace with real SANO LUNA location information before launch.
 *
 * Architecture supports 1 or many locations.
 * When only 1 active location exists, the booking system auto-assigns it (no step shown).
 */

import type { Location, BusinessHour } from './types'

// ─────────────────────────────────────────────
// LOCATIONS
// ─────────────────────────────────────────────

export const locations: Location[] = [
  {
    id: 'riyadh-main',
    slug: 'riyadh-main',
    name_ar: 'سانو لونا — جدة',
    name_en: 'SANO LUNA — Jeddah',
    address_ar: 'جدة، المملكة العربية السعودية',  // DEMO — update with real address
    address_en: 'Jeddah, Saudi Arabia',               // DEMO — update with real address
    latitude: null,    // DEMO — update with real coordinates
    longitude: null,   // DEMO — update with real coordinates
    phone: '+966500000000', // DEMO — update with real phone
    is_active: true,
    sort_order: 1,
  },
]

// ─────────────────────────────────────────────
// BUSINESS HOURS
// Day-of-week: 0 = Sunday, 1 = Monday, … 6 = Saturday
// ─────────────────────────────────────────────

export const businessHours: BusinessHour[] = [
  // Sunday (day off / closed) — 0
  { id: 'bh-sun', location_id: 'riyadh-main', day_of_week: 0, open_time: '14:00', close_time: '21:00', is_closed: false },
  // Monday — 1
  { id: 'bh-mon', location_id: 'riyadh-main', day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false },
  // Tuesday — 2
  { id: 'bh-tue', location_id: 'riyadh-main', day_of_week: 2, open_time: '09:00', close_time: '21:00', is_closed: false },
  // Wednesday — 3
  { id: 'bh-wed', location_id: 'riyadh-main', day_of_week: 3, open_time: '09:00', close_time: '21:00', is_closed: false },
  // Thursday — 4
  { id: 'bh-thu', location_id: 'riyadh-main', day_of_week: 4, open_time: '09:00', close_time: '21:00', is_closed: false },
  // Friday — 5 (shorter hours)
  { id: 'bh-fri', location_id: 'riyadh-main', day_of_week: 5, open_time: '14:00', close_time: '21:00', is_closed: false },
  // Saturday — 6
  { id: 'bh-sat', location_id: 'riyadh-main', day_of_week: 6, open_time: '09:00', close_time: '21:00', is_closed: false },
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export const activeLocations = locations.filter((l) => l.is_active)

export function getLocationById(id: string): Location | undefined {
  return locations.find((l) => l.id === id)
}

export function getHoursForLocation(locationId: string): BusinessHour[] {
  return businessHours.filter((h) => h.location_id === locationId)
}

export function getHoursForDay(locationId: string, dayOfWeek: number): BusinessHour | undefined {
  return businessHours.find(
    (h) => h.location_id === locationId && h.day_of_week === dayOfWeek
  )
}
