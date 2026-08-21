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
    id: '53b02143-24c8-4425-a0d3-fc14f12e962c',
    slug: 'jeddah-main',
    name_ar: 'سانو لونا',
    name_en: 'SANO LUNA',
    address_ar: 'جدة، المملكة العربية السعودية',
    address_en: 'Jeddah, Saudi Arabia',
    latitude: null,
    longitude: null,
    phone: '0551854617',
    is_active: true,
    sort_order: 1,
  },
]

// ─────────────────────────────────────────────
// BUSINESS HOURS
// Day-of-week: 0 = Sunday, 1 = Monday, … 6 = Saturday
// ─────────────────────────────────────────────

export const businessHours: BusinessHour[] = [
  // Sunday
  { id: 'bh-sun', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 0, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Monday
  { id: 'bh-mon', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 1, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Tuesday
  { id: 'bh-tue', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 2, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Wednesday
  { id: 'bh-wed', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 3, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Thursday
  { id: 'bh-thu', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 4, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Friday
  { id: 'bh-fri', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 5, open_time: '15:00', close_time: '03:00', is_closed: false },
  // Saturday
  { id: 'bh-sat', location_id: '53b02143-24c8-4425-a0d3-fc14f12e962c', day_of_week: 6, open_time: '15:00', close_time: '03:00', is_closed: false },
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
