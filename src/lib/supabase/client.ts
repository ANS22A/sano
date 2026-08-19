import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Supabase Browser Client
 *
 * Use this client in Client Components ('use client').
 * Uses the anonymous key — respects Row Level Security.
 * Never has access to the service role key.
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('services').select('*')
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During development without env vars, return a graceful stub
    console.warn(
      '[Supabase Browser] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set these in your .env.local file.'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-anon-key'
  )
}
