import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // All supported locales
  locales: ['ar', 'en'] as const,

  // Arabic is the default locale (primary market)
  defaultLocale: 'ar',

  // Use locale prefix for all locales
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
