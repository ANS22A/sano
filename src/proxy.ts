import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'

const handleI18nRouting = createMiddleware(routing)

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
    // Login page is always accessible (skip auth check)
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Create a response we can mutate (for cookie refresh)
    const response = NextResponse.next({ request })

    // Check Supabase session using SSR cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
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

    return response
  }

  // ─── Public routes — delegate to next-intl ──────────────────────────────────
  return handleI18nRouting(request)
}

export const config = {
  // Match all pathnames except static files, Next.js internals, and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public|icons|images|auth).*)',
  ],
}
