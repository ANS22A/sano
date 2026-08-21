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
  { key: 'contact', href: '/contact' },
]

// Footer — Explore column
export const footerExploreLinks: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'packages', href: '/packages' },
  { key: 'team', href: '/team' },
]

// Footer — Experience column
export const footerExperienceLinks: NavItem[] = [
  { key: 'booking', href: '/booking' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
]

// Backward-compat alias
export const navigation = primaryNavigation

export const LOCALES: Locale[] = ['ar', 'en']
export const DEFAULT_LOCALE: Locale = 'ar'

// ─────────────────────────────────────────────
// CONTACT — Single Source of Truth for Business Info
// ─────────────────────────────────────────────

export const contactConfig = {
  phone: '0551854617' as string,
  whatsapp: '0551854617' as string,
  email: 'sanospa089@gmail.com' as string,
  address: {
    ar: 'خدمات سبا منزلية في جميع أنحاء جدة',
    en: 'Luxury spa services at your home across Jeddah',
  },
  hours: {
    ar: 'مفتوح طوال أيام الأسبوع مع ساعات عمل مرنة حسب المواعيد والحجوزات.',
    en: 'Open every day with flexible appointment-based hours.',
  },
} as const

// ─────────────────────────────────────────────
// SOCIAL — Links
// ─────────────────────────────────────────────

export const socialLinks = {
  instagram: 'https://www.instagram.com/sanoluna.co' as string,
  whatsapp: 'https://wa.me/966551854617' as string,
  facebook: 'https://www.facebook.com/share/1PTTnhTxWK/' as string,
  tiktok: 'https://www.tiktok.com/@sano.luna7' as string,
  snapchat: 'https://www.snapchat.com/@sanolunaone' as string,
} as const

