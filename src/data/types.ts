/**
 * SANO LUNA — Data Types
 * Shared TypeScript interfaces for all content data structures.
 * These mirror the Supabase database schema exactly.
 * When Supabase is connected, DB queries return data conforming to these types.
 *
 * Phase 5: Extended with short/long descriptions, SEO fields, options, tags.
 */

// ─────────────────────────────────────────────
// SERVICE CATEGORY
// ─────────────────────────────────────────────

export interface ServiceCategory {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  icon: string           // emoji or icon key
  image_url: string | null
  service_count: number  // populated at query time
  display_order: number
  active: boolean
}

// ─────────────────────────────────────────────
// SERVICE OPTION (duration/price variants)
// ─────────────────────────────────────────────

export interface ServiceOption {
  id: string
  service_id: string
  label_ar: string        // e.g. "60 دقيقة"
  label_en: string        // e.g. "60 minutes"
  duration_minutes: number
  price_sar: number
  is_default: boolean
  active: boolean
}

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export interface Service {
  id: string
  category_id: string
  slug: string

  // Names
  name_ar: string
  name_en: string

  // Short description — used on catalog cards (1–2 sentences)
  short_description_ar: string
  short_description_en: string

  // Full description — used on detail pages (2–4 paragraphs)
  description_ar: string
  description_en: string

  // Preparation & care notes — shown in "What to Expect"
  what_to_expect_ar: string | null
  what_to_expect_en: string | null

  // Pricing & duration
  duration_minutes: number
  price_sar: number
  compare_at_price_sar: number | null   // original price for discount display
  price_currency: string                // default 'SAR'

  // Scheduling buffer
  preparation_minutes: number
  cleanup_minutes: number

  // Media
  image_url: string | null
  thumbnail_url: string | null

  // Benefits list
  benefits_ar: string[]
  benefits_en: string[]

  // Tags — used for related service matching
  tags: string[]

  // Flags
  is_featured: boolean
  is_popular: boolean
  is_active: boolean
  sort_order: number

  // SEO
  seo_title_ar: string | null
  seo_title_en: string | null
  seo_description_ar: string | null
  seo_description_en: string | null

  // Timestamps (Supabase auto-managed)
  created_at?: string
  updated_at?: string

  // Joined relations (populated by query, not stored)
  options?: ServiceOption[]
}

// Service with its parent category joined — from catalog queries
export interface ServiceWithCategory extends Service {
  category: Pick<ServiceCategory, 'id' | 'slug' | 'name_ar' | 'name_en' | 'icon'>
}

// Catalog filter parameters
export interface ServiceFilters {
  category?: string | null
  search?: string | null
  sort?: 'recommended' | 'price_asc' | 'price_desc' | 'duration_asc' | null
  featured?: boolean
  popular?: boolean
}

// ─────────────────────────────────────────────
// PACKAGE TYPES
// ─────────────────────────────────────────────

export interface Package {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  tagline_ar?: string
  tagline_en?: string
  total_duration_minutes: number
  price_sar: number
  original_price_sar?: number  // for discount display
  max_guests: number
  image_url: string | null
  included_services_ar: string[]
  included_services_en: string[]
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

// ─────────────────────────────────────────────
// FAQ TYPES
// ─────────────────────────────────────────────

export interface FAQ {
  id: string
  question_ar: string
  question_en: string
  answer_ar: string
  answer_en: string
  category: 'booking' | 'services' | 'payment' | 'general'
  sort_order: number
}

// ─────────────────────────────────────────────
// GALLERY TYPES
// ─────────────────────────────────────────────

export interface GalleryItem {
  id: string
  title_ar?: string
  title_en?: string
  image_url: string
  alt_ar: string
  alt_en: string
  category: 'atmosphere' | 'treatment' | 'space' | 'detail'
  sort_order: number
}

// ─────────────────────────────────────────────
// BRAND PRINCIPLES TYPE
// ─────────────────────────────────────────────

export interface BrandPrinciple {
  id: string
  icon: string
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
}

// ─────────────────────────────────────────────
// HOW IT WORKS TYPE
// ─────────────────────────────────────────────

export interface HowItWorksStep {
  step: number
  icon: string
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
}

// ─────────────────────────────────────────────
// LOCATION
// ─────────────────────────────────────────────

export interface Location {
  id: string
  slug: string
  name_ar: string
  name_en: string
  address_ar: string
  address_en: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  is_active: boolean
  sort_order: number
}

// ─────────────────────────────────────────────
// BUSINESS HOURS
// ─────────────────────────────────────────────

export interface BusinessHour {
  id: string
  location_id: string
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6   // 0 = Sunday … 6 = Saturday
  open_time: string | null   // 'HH:MM'
  close_time: string | null  // 'HH:MM'
  is_closed: boolean
}

// ─────────────────────────────────────────────
// BLACKOUT DATE
// ─────────────────────────────────────────────

export interface BlackoutDate {
  id: string
  location_id: string | null
  date: string          // 'YYYY-MM-DD'
  reason_ar: string
  reason_en: string
  is_active: boolean
}
