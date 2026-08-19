/**
 * SANO LUNA — UI Types
 * Types shared across UI components.
 */

export type Locale = 'ar' | 'en'
export type Direction = 'rtl' | 'ltr'

export const LOCALE_DIRECTION: Record<Locale, Direction> = {
  ar: 'rtl',
  en: 'ltr',
}

export type Theme = 'light' | 'dark'

export interface NavItem {
  key: string
  href: string
  label?: string
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  locales: Locale[]
  defaultLocale: Locale
}
