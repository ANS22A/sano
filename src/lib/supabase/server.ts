import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Supabase Server Client
 *
 * Use this client in Server Components, Server Actions, and Route Handlers.
 * Reads/writes cookies for auth session management.
 * Uses the anonymous key — respects Row Level Security.
 *
 * @example
 * // In a Server Component:
 * const supabase = await createClient()
 * const { data } = await supabase.from('services').select('*')
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase Server] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set these in your .env.local file.'
    )
  }

  return createServerClient<Database>(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can be called from Server Components where cookies
            // are read-only. This is safe to ignore.
          }
        },
      },
    }
  )
}
