'use server'

import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const { data } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  return (data ?? []) as unknown as ServiceCategory[]
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  const supabase = await createClient()
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
  const supabase = await createClient()
  let query = supabase.from('services').select('*').eq('is_active', true)

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
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('slug', slug)
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
  const supabase = await createClient()
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
    .order('sort_order', { ascending: true })

  return (data ?? []) as unknown as Service[]
}

// ─────────────────────────────────────────────
// SERVICES — FEATURED / POPULAR
// ─────────────────────────────────────────────

export async function getFeaturedServices(): Promise<ServiceWithCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })

  if (!data) return []
  return data.map((d) => {
    const { service_categories, ...service } = d
    return { ...service, category: service_categories }
  }) as unknown as ServiceWithCategory[]
}

export async function getPopularServices(): Promise<ServiceWithCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*, service_categories(id, slug, name_ar, name_en)')
    .eq('is_popular', true)
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
  const supabase = await createClient()
  
  // 1. Get current service to find its category and tags
  const { data: current } = await supabase.from('services').select('category_id, tags').eq('id', serviceId).single()
  if (!current) return []

  // 2. Fetch same category
  const { data: sameCategory } = await supabase
    .from('services')
    .select('*')
    .eq('category_id', current.category_id)
    .neq('id', serviceId)
    .limit(limit)
  
  let results = sameCategory ?? []

  if (results.length < limit) {
    // 3. Just fetch some other active ones if we don't have enough
    const { data: others } = await supabase
      .from('services')
      .select('*')
      .neq('category_id', current.category_id)
      .limit(limit - results.length)
    
    if (others) results = [...results, ...others]
  }

  return results as unknown as Service[]
}

// ─────────────────────────────────────────────
// SLUGS — For static generation
// ─────────────────────────────────────────────

import { createStaticClient } from '@/lib/supabase/server'

export async function getAllServiceSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data } = await supabase.from('services').select('slug')
  return (data ?? []).map((s) => s.slug)
}

// ─────────────────────────────────────────────
// COUNTS
// ─────────────────────────────────────────────

export async function getServiceCountByCategory(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('category_id')
  
  const counts: Record<string, number> = {}
  if (data) {
    for (const row of data) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1
    }
  }
  return counts
}
