'use server'

import { createClient, createStaticClient } from '@/lib/supabase/server'
import type {
  Service,
  ServiceCategory,
  ServiceWithCategory,
  ServiceFilters,
} from '@/data/types'

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export async function getAllCategories(): Promise<ServiceCategory[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  return (data ?? []) as unknown as ServiceCategory[]
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('service_categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  return (data ?? null) as unknown as ServiceCategory | null
}

// ─────────────────────────────────────────────
// SERVICES — FULL CATALOG
// ─────────────────────────────────────────────

export async function getAllServices(filters?: ServiceFilters): Promise<Service[]> {
  const supabase = createStaticClient()
  let query = supabase.from('services').select('id, slug, name_ar, name_en, short_description_ar, short_description_en, description_ar, description_en, price_sar, duration_minutes, image_url, is_active, is_featured, is_popular, category_id, sort_order, tags').eq('is_active', true)

  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }
  if (filters?.featured) {
    query = query.eq('is_featured', true)
  }
  if (filters?.popular) {
    query = query.eq('is_popular', true)
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase().trim()
    if (q) {
      query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%,short_description_en.ilike.%${q}%,short_description_ar.ilike.%${q}%`)
    }
  }

  // Sorting
  switch (filters?.sort) {
    case 'price_asc':
      query = query.order('price_sar', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price_sar', { ascending: false })
      break
    case 'duration_asc':
      query = query.order('duration_minutes', { ascending: true })
      break
    case 'recommended':
    default:
      query = query.order('sort_order', { ascending: true })
      break
  }

  const { data } = await query
  return (data ?? []) as unknown as Service[]
}

// ─────────────────────────────────────────────
// SERVICES — SINGLE
// ─────────────────────────────────────────────

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return null
  const { service_categories, ...service } = data
  return {
    ...service,
    category: service_categories as unknown as ServiceCategory,
  } as unknown as ServiceWithCategory
}

// ─────────────────────────────────────────────
// SERVICES — BY CATEGORY
// ─────────────────────────────────────────────

export async function getServicesByCategory(categorySlug: string): Promise<Service[]> {
  const supabase = createStaticClient()
  const { data: category } = await supabase
    .from('service_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()
  
  if (!category) return []

  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data ?? []) as unknown as Service[]
}

// ─────────────────────────────────────────────
// SERVICES — FEATURED / POPULAR
// ─────────────────────────────────────────────

export async function getFeaturedServices(): Promise<ServiceWithCategory[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!data) return []
  return data.map((d) => {
    const { service_categories, ...service } = d
    return { ...service, category: service_categories }
  }) as unknown as ServiceWithCategory[]
}

export async function getPopularServices(): Promise<ServiceWithCategory[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('is_popular', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!data) return []
  return data.map((d) => {
    const { service_categories, ...service } = d
    return { ...service, category: service_categories }
  }) as unknown as ServiceWithCategory[]
}

// ─────────────────────────────────────────────
// SERVICES — RELATED
// ─────────────────────────────────────────────

export async function getRelatedServices(
  serviceId: string,
  limit = 3
): Promise<Service[]> {
  const supabase = createStaticClient()
  
  // 1. Get current service to find its category and tags
  const { data: current } = await supabase.from('services').select('category_id, tags').eq('id', serviceId).single()
  if (!current) return []

  // 2. Fetch same category
  const { data: sameCategory } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', current.category_id)
    .eq('is_active', true)
    .neq('id', serviceId)
    .limit(limit)
  
  let results = sameCategory ?? []

  if (results.length < limit) {
    // 3. Just fetch some other active ones if we don't have enough
    const { data: others } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .neq('category_id', current.category_id)
      .limit(limit - results.length)
    
    if (others) results = [...results, ...others]
  }

  return results as unknown as Service[]
}

// ─────────────────────────────────────────────
// SLUGS — For static generation
// ─────────────────────────────────────────────

export async function getAllServiceSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase.from('services').select('slug')
  return (data ?? []).map((s) => s.slug)
}

// ─────────────────────────────────────────────
// COUNTS
// ─────────────────────────────────────────────

export async function getServiceCountByCategory(): Promise<Record<string, number>> {
  const supabase = createStaticClient()
  const { data } = await supabase.from('services').select('category_id').eq('is_active', true)
  
  const counts: Record<string, number> = {}
  if (data) {
    for (const row of data) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1
    }
  }
  return counts
}

// ─────────────────────────────────────────────
// PACKAGES — ACTIVE (for booking flow)
// ─────────────────────────────────────────────

/**
 * DB-backed package shape for the booking flow.
 * Only includes fields that actually exist in the database.
 */
export interface BookingPackage {
  id: string
  slug: string
  name_ar: string
  name_en: string
  tagline_ar: string | null
  tagline_en: string | null
  description_ar: string | null
  description_en: string | null
  price_sar: number
  total_duration_minutes: number
  max_guests: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  is_bookable: boolean
}

interface PackageServiceDbRow {
  services: { is_active: boolean } | null
}

export async function getActivePackages(): Promise<BookingPackage[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('packages')
    .select('id, slug, name_ar, name_en, tagline_ar, tagline_en, description_ar, description_en, price_sar, total_duration_minutes, max_guests, image_url, is_active, sort_order, package_services(services(is_active))')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (data ?? []).map(p => {
    // A package is bookable only if all its included services are active.
    // If it has no services, it defaults to bookable (preserves current behavior).
    const psArray = Array.isArray(p.package_services) ? p.package_services : []
    const isBookable = psArray.every((ps: PackageServiceDbRow) => ps.services?.is_active === true)

    return {
      ...p,
      price_sar: Number(p.price_sar),
      is_bookable: isBookable
    }
  }) as BookingPackage[]
}

/**
 * Validates whether a specific package is bookable.
 * True ONLY IF package exists, is_active=true, AND all included services are active.
 */
export async function getPackageBookability(slug: string): Promise<boolean> {
  const supabase = createStaticClient()
  const { data: dbPkg } = await supabase
    .from('packages')
    .select('is_active, package_services(services(is_active))')
    .eq('slug', slug)
    .single()

  if (!dbPkg || !dbPkg.is_active) {
    return false
  }

  const psArray = Array.isArray(dbPkg.package_services) ? dbPkg.package_services : []
  // If zero package_services rows, preserve current behavior (true)
  if (psArray.length === 0) {
    return true
  }

  return psArray.every((ps: PackageServiceDbRow) => ps.services?.is_active === true)
}
