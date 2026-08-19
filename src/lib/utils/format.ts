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
 * Format a time string (HH:MM) for display, respecting locale.
 */
export function formatTime(
  timeString: string,
  locale: Locale = 'ar'
): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US'
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat(localeCode, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
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
