/**
 * SANO LUNA — Services Data Access Layer
 *
 * All Supabase queries for the `services` and `service_categories` tables.
 * Call these functions from Server Components, Server Actions, or Route Handlers.
 * Never query Supabase directly from client components.
 *
 * NOTE: DB type aliases use Tables<'...'> from the generated Supabase schema.
 * 'display_order' column was renamed to 'sort_order' in the current schema.
 */
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

export type DbService = Tables<'services'>
export type DbServiceCategory = Tables<'service_categories'>

export async function getAllServices(): Promise<DbService[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch services: ${error.message}`)
  return data ?? []
}

export async function getServiceBySlug(slug: string): Promise<DbService | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

export async function getFeaturedServices(): Promise<DbService[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch featured services: ${error.message}`)
  return data ?? []
}

export async function getServiceCategories(): Promise<DbServiceCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return data ?? []
}
