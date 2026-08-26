/**
 * SANO LUNA — Formatting Utilities
 * Locale-aware date, number, and currency formatting.
 */

import type { Locale } from '@/types/ui.types'

/**
 * Format a price with currency symbol, respecting locale.
 */
export function formatPrice(
  amount: number,
  currency = 'SAR',
  locale: Locale = 'ar'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date string, respecting locale.
 */
export function formatDate(
  dateString: string,
  locale: Locale = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  return new Intl.DateTimeFormat(localeCode, defaultOptions).format(
    new Date(dateString)
  )
}

/**
 * Format an internal 24-hour time string (HH:MM) into a customer-facing 12-hour format.
 * Guarantees western numerals and predictable AM/PM indicators.
 */
export function formatAppointmentTime(
  timeString: string | null | undefined,
  locale: Locale = 'ar'
): string {
  if (!timeString) return ''
  
  // Extract hours and minutes from HH:MM
  const [hStr, mStr] = timeString.split(':')
  if (!hStr || !mStr) return timeString

  let h = parseInt(hStr, 10)
  const isPm = h >= 12
  
  // Convert 0 and 13-23 to 12-hour format
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  
  const isAr = locale === 'ar'
  
  // Arabic pads the hour (e.g. 04:00), English does not (e.g. 4:00)
  const hh = isAr ? String(h).padStart(2, '0') : String(h)
  const mm = mStr.substring(0, 2)
  
  if (isAr) {
    // Prefix with LRM (\u200E) to force correct LTR rendering of the time within RTL layouts
    return `\u200E${hh}:${mm} ${isPm ? 'م' : 'ص'}`
  }
  return `${hh}:${mm} ${isPm ? 'PM' : 'AM'}`
}

/**
 * Truncate text to a given character limit.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}
