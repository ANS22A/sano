/**
 * SANO LUNA — Team Data Access Layer
 *
 * The DB uses `staff` table (not `team_members`).
 * Staff are display-only placeholders — no real personal data.
 * Uses `sort_order` column from the current schema.
 */
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

export type DbStaff = Tables<'staff'>

export async function getTeamMembers(): Promise<DbStaff[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`Failed to fetch team members: ${error.message}`)
    return []
  }
  return data ?? []
}

export async function getFeaturedTeamMembers(): Promise<DbStaff[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(6)

  if (error) {
    console.error(`Failed to fetch team members: ${error.message}`)
    return []
  }
  return data ?? []
}
