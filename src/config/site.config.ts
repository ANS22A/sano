/**
 * SANO LUNA — Site Configuration
 * Central configuration for site metadata, navigation, social links, and contact.
 */

import type { SiteConfig, NavItem, Locale } from '@/types/ui.types'

export const siteConfig: SiteConfig = {
  name: 'SANO LUNA',
  description:
    'A luxury wellness and spa destination blending ancient wisdom with modern care',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sanoluna.com',
  ogImage: '/images/og-image.jpg',
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
}

// ─────────────────────────────────────────────
// NAVIGATION — Primary links (shown in header)
// ─────────────────────────────────────────────

export const primaryNavigation: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'packages', href: '/packages' },
  { key: 'giftCards', href: '/gift-cards' },
  { key: 'team', href: '/team' },
  { key: 'gallery', href: '/gallery' },
  { key: 'reviews', href: '/reviews' },
  { key: 'contact', href: '/contact' },
]

// Footer — Explore column
export const footerExploreLinks: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'packages', href: '/packages' },
  { key: 'team', href: '/team' },
  { key: 'gallery', href: '/gallery' },
]

// Footer — Experience column
export const footerExperienceLinks: NavItem[] = [
  { key: 'booking', href: '/booking' },
  { key: 'reviews', href: '/reviews' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
  { key: 'policies', href: '/policies' },
]

// Backward-compat alias
export const navigation = primaryNavigation

export const LOCALES: Locale[] = ['ar', 'en']
export const DEFAULT_LOCALE: Locale = 'ar'

// ─────────────────────────────────────────────
// CONTACT — Placeholder until CMS/Supabase
// ─────────────────────────────────────────────

/** @placeholder Replace with real business data before launch */
export const contactConfig = {
  phone: '+966 50 000 0000',        // PLACEHOLDER
  whatsapp: '+966500000000',         // PLACEHOLDER
  email: 'hello@sanoluna.com',       // PLACEHOLDER
  address: {
    ar: 'الرياض، المملكة العربية السعودية', // PLACEHOLDER
    en: 'Riyadh, Saudi Arabia',             // PLACEHOLDER
  },
  hours: {
    ar: 'السبت – الخميس: ٩ص – ٩م',  // PLACEHOLDER
    en: 'Sat – Thu: 9am – 9pm',      // PLACEHOLDER
  },
} as const

// ─────────────────────────────────────────────
// SOCIAL — Placeholder until real accounts confirmed
// ─────────────────────────────────────────────

/** @placeholder Replace with real social URLs before launch */
export const socialLinks = {
  instagram: 'https://instagram.com/sanoluna', // PLACEHOLDER
  whatsapp:  'https://wa.me/966500000000',     // PLACEHOLDER
  facebook:  'https://facebook.com/sanoluna',  // PLACEHOLDER
  tiktok:    'https://tiktok.com/@sanoluna',   // PLACEHOLDER
} as const
