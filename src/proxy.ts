import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const handleI18nRouting = createMiddleware(routing)

/** Valid admin roles that may access /admin routes */
const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Localized admin routes → redirect to standalone /admin ────────────────
  // The admin portal lives at /admin (not /ar/admin or /en/admin).
  // next-intl must not intercept these routes.
  const localizedAdminMatch = pathname.match(/^\/(?:ar|en)\/admin(\/.*)?$/)
  if (localizedAdminMatch) {
    const subPath = localizedAdminMatch[1] ?? ''
    const target = new URL(`/admin${subPath}`, request.url)
    return NextResponse.redirect(target)
  }

  // ─── Admin routes ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-pathname', pathname)

    // Login page is always accessible (skip auth check)
    if (pathname === '/admin/login') {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }

    // Create an initial response we can mutate and inject pathname for layouts
    let response = NextResponse.next({ request: { headers: requestHeaders } })

    // Check Supabase session using SSR cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => {
              // Update request cookies so downstream server components receive the refreshed token
              request.cookies.set(name, value)
            })
            // IMPORTANT: Sync the mutated request.cookies back to our cloned requestHeaders
            // Otherwise, passing headers: requestHeaders below will overwrite the updated cookies!
            requestHeaders.set('cookie', request.cookies.toString())

            // Re-create the response to forward the updated request headers downstream
            // along with our custom x-next-pathname header
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            })
            // Update response cookies so the browser stores the refreshed token
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // ─── Layer 1: Role verification (defense-in-depth) ────────────────────────
    // Query the profiles table to verify the authenticated user has an active
    // admin profile with a recognized role. This prevents customers (who have
    // valid auth sessions but no admin profile) from reaching admin routes.
    // This query only runs on /admin/* requests, not on public routes.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (
      !profile ||
      !profile.is_active ||
      !ADMIN_ROLES.includes(profile.role as typeof ADMIN_ROLES[number])
    ) {
      // Not an admin — redirect to login with an error hint
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ─── Public routes — delegate to next-intl ──────────────────────────────────
  return handleI18nRouting(request)
}

export const config = {
  // Match all pathnames except static files, Next.js internals, API routes, and verification files
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|google[a-z0-9]+\\.html|.*\\..*|public|icons|images|auth).*)',
  ],
}
