/**
 * SANO LUNA — Booking Types
 *
 * All TypeScript interfaces for the booking system.
 * Mirrors the Supabase booking schema.
 */

// ─────────────────────────────────────────────
// BOOKING STATUS
// ─────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

// ─────────────────────────────────────────────
// BOOKING DRAFT — client-side state
// ─────────────────────────────────────────────

export interface BookingCustomer {
  fullName: string
  phone: string
  email: string
  address: string
  notes: string
}

export interface BookingDraft {
  // Step 01 — Experience
  serviceId: string | null
  packageSlug: string | null
  serviceOptionId: string | null   // for duration/price variants

  // Location (auto-set when 1 active location; shown as step when >1)
  locationId: string | null

  // Step 02 — Date & Time
  date: string | null        // 'YYYY-MM-DD'
  startTime: string | null   // 'HH:MM'
  endTime: string | null     // server-calculated, stored for display

  // Step 03 — Details
  customer: BookingCustomer

  // Derived — server-recalculated on createBooking, never trusted from client
  durationMinutes: number | null
  priceSar: number | null
  currency: 'SAR'

  // Navigation
  currentStep: 1 | 2 | 3 | 4
  completedSteps: number[]
}

export const BOOKING_DRAFT_INITIAL: BookingDraft = {
  serviceId: null,
  packageSlug: null,
  serviceOptionId: null,
  locationId: null,
  date: null,
  startTime: null,
  endTime: null,
  customer: {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  },
  durationMinutes: null,
  priceSar: null,
  currency: 'SAR',
  currentStep: 1,
  completedSteps: [],
}

// ─────────────────────────────────────────────
// AVAILABLE SLOT
// ─────────────────────────────────────────────

export interface AvailableSlot {
  startTime: string   // 'HH:MM'
  endTime: string     // 'HH:MM'
  available: boolean
}

// ─────────────────────────────────────────────
// BOOKING RESULT — returned by createBooking()
// ─────────────────────────────────────────────

export interface BookingResult {
  success: true
  bookingNumber: string
  date: string
  startTime: string
  endTime: string
  serviceName_ar: string
  serviceName_en: string
  locationName_ar: string
  locationName_en: string
  address_ar: string
  address_en: string
  priceSar: number
  currency: 'SAR'
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface BookingError {
  success: false
  code:
    | 'SERVICE_NOT_FOUND'
    | 'LOCATION_NOT_FOUND'
    | 'SLOT_UNAVAILABLE'
    | 'DOUBLE_BOOKING'
    | 'VALIDATION_ERROR'
    | 'SERVER_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
  message: string
  messageAr: string
}

export type BookingResponse = BookingResult | BookingError

// ─────────────────────────────────────────────
// BOOKING STEP CONFIG
// ─────────────────────────────────────────────

export interface BookingStep {
  id: 1 | 2 | 3 | 4
  labelEn: string
  labelAr: string
}

export const BOOKING_STEPS: BookingStep[] = [
  { id: 1, labelEn: 'Experience', labelAr: 'التجربة' },
  { id: 2, labelEn: 'Date & Time', labelAr: 'الموعد' },
  { id: 3, labelEn: 'Details', labelAr: 'بياناتك' },
  { id: 4, labelEn: 'Review', labelAr: 'المراجعة' },
]

// ─────────────────────────────────────────────
// SLOT CONFIG
// ─────────────────────────────────────────────

/** Interval between slot start times in minutes. Configurable here — not scattered across codebase. */
export const SLOT_INTERVAL_MINUTES = 30

/** Business timezone — used for all date/time displays and calculations. */
export const BUSINESS_TIMEZONE = 'Asia/Riyadh'
