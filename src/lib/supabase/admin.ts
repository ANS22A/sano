/**
 * Supabase Admin Client
 *
 * ⚠️  SERVER-ONLY — NEVER import this file in client code.
 *
 * Uses the SERVICE ROLE KEY which bypasses Row Level Security.
 * Only use for:
 *   - Admin dashboard operations
 *   - Background jobs / cron tasks
 *   - Migrations / seeding scripts
 *   - Operations that require elevated privileges
 *
 * This file is intentionally not exported from the main lib/supabase index
 * to reduce the risk of accidental client-side use.
 */
import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Creates an admin Supabase client with the service role key.
 * Bypasses RLS — use with extreme caution.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. ' +
        'Set these in your .env.local file. NEVER expose the service role key to the browser.'
    )
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
