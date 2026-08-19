/**
 * SANO LUNA — Catalog Service
 *
 * Clean data access layer for services and categories.
 * Currently uses local seed data as the authoritative source.
 * When Supabase is live and .env credentials are set, swap to DB queries
 * by uncommenting the Supabase blocks — zero component changes needed.
 *
 * All functions are async to match the eventual Supabase pattern.
 */

import type {
  Service,
  ServiceCategory,
  ServiceWithCategory,
  ServiceFilters,
} from '@/data/types'
import {
  activeServices,
  featuredServices as localFeatured,
  popularServices as localPopular,
} from '@/data/services.data'
import { serviceCategories as localCategories } from '@/data/categories.data'

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

export async function getAllCategories(): Promise<ServiceCategory[]> {
  return localCategories.filter((c) => c.active).sort((a, b) => a.display_order - b.display_order)
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
  return localCategories.find((c) => c.slug === slug && c.active) ?? null
}

// ─────────────────────────────────────────────
// SERVICES — FULL CATALOG
// ─────────────────────────────────────────────

export async function getAllServices(filters?: ServiceFilters): Promise<Service[]> {
  let result = [...activeServices]

  // Category filter
  if (filters?.category) {
    result = result.filter((s) => s.category_id === filters.category)
  }

  // Featured filter
  if (filters?.featured) {
    result = result.filter((s) => s.is_featured)
  }

  // Popular filter
  if (filters?.popular) {
    result = result.filter((s) => s.is_popular)
  }

  // Search filter (bilingual, case-insensitive)
  if (filters?.search) {
    const q = filters.search.toLowerCase().trim()
    if (q.length > 0) {
      result = result.filter((s) => {
        const searchableFields = [
          s.name_ar,
          s.name_en,
          s.short_description_ar,
          s.short_description_en,
          s.description_ar,
          s.description_en,
          // Include category name in search
          ...localCategories
            .filter((c) => c.id === s.category_id)
            .flatMap((c) => [c.name_ar, c.name_en]),
          // Include tags
          ...s.tags,
        ]
        return searchableFields.some((field) =>
          field.toLowerCase().includes(q)
        )
      })
    }
  }

  // Sorting
  switch (filters?.sort) {
    case 'price_asc':
      result.sort((a, b) => a.price_sar - b.price_sar)
      break
    case 'price_desc':
      result.sort((a, b) => b.price_sar - a.price_sar)
      break
    case 'duration_asc':
      result.sort((a, b) => a.duration_minutes - b.duration_minutes)
      break
    case 'recommended':
    default:
      result.sort((a, b) => a.sort_order - b.sort_order)
      break
  }

  return result
}

// ─────────────────────────────────────────────
// SERVICES — SINGLE
// ─────────────────────────────────────────────

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  const service = activeServices.find((s) => s.slug === slug)
  if (!service) return null

  const category = localCategories.find((c) => c.id === service.category_id)
  if (!category) return null

  return {
    ...service,
    category: {
      id: category.id,
      slug: category.slug,
      name_ar: category.name_ar,
      name_en: category.name_en,
      icon: category.icon,
    },
  }
}

// ─────────────────────────────────────────────
// SERVICES — BY CATEGORY
// ─────────────────────────────────────────────

export async function getServicesByCategory(categorySlug: string): Promise<Service[]> {
  const category = localCategories.find((c) => c.slug === categorySlug)
  if (!category) return []
  return activeServices
    .filter((s) => s.category_id === category.id)
    .sort((a, b) => a.sort_order - b.sort_order)
}

// ─────────────────────────────────────────────
// SERVICES — FEATURED / POPULAR
// ─────────────────────────────────────────────

export async function getFeaturedServices(): Promise<Service[]> {
  return localFeatured.sort((a, b) => a.sort_order - b.sort_order)
}

export async function getPopularServices(): Promise<Service[]> {
  return localPopular.sort((a, b) => a.sort_order - b.sort_order)
}

// ─────────────────────────────────────────────
// SERVICES — RELATED
// ─────────────────────────────────────────────

export async function getRelatedServices(
  serviceId: string,
  limit = 3
): Promise<Service[]> {
  const service = activeServices.find((s) => s.id === serviceId)
  if (!service) return []

  // Prefer same category, then tag overlap
  const sameCategory = activeServices.filter(
    (s) => s.category_id === service.category_id && s.id !== serviceId
  )

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit)
  }

  // Fill with tag-matched services from other categories
  const tagMatched = activeServices.filter((s) => {
    if (s.id === serviceId || s.category_id === service.category_id) return false
    return s.tags.some((tag) => service.tags.includes(tag))
  })

  return [...sameCategory, ...tagMatched].slice(0, limit)
}

// ─────────────────────────────────────────────
// SLUGS — For static generation
// ─────────────────────────────────────────────

export async function getAllServiceSlugs(): Promise<string[]> {
  return activeServices.map((s) => s.slug)
}

// ─────────────────────────────────────────────
// COUNTS
// ─────────────────────────────────────────────

export async function getServiceCountByCategory(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const service of activeServices) {
    counts[service.category_id] = (counts[service.category_id] || 0) + 1
  }
  return counts
}
