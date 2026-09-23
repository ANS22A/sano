import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Validates the `next` redirect parameter to prevent open redirect attacks.
 * Only allows safe internal application paths:
 *   /ar/... or /en/... (locale-prefixed relative paths)
 *
 * Rejects:
 *   - Absolute URLs (https://..., http://..., //...)
 *   - Paths not starting with a known locale prefix
 *   - Malformed or empty values
 */
function getSafeRedirect(next: string | null, fallbackLocale: string): string {
  if (!next) return `/${fallbackLocale}/login`

  // Strip whitespace
  const cleaned = next.trim()

  // Reject empty, protocol-relative, or absolute URLs
  if (
    !cleaned ||
    cleaned.startsWith('//') ||
    cleaned.startsWith('http:') ||
    cleaned.startsWith('https:') ||
    cleaned.includes('://') ||
    cleaned.includes('\\')
  ) {
    return `/${fallbackLocale}/login`
  }

  // Must start with / followed by a valid locale prefix
  if (!/^\/(ar|en)(\/|$)/.test(cleaned)) {
    return `/${fallbackLocale}/login`
  }

  return cleaned
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/ar/login'
  const locale = next.startsWith('/en') ? 'en' : 'ar'

  const supabase = await createClient()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // For recovery type, redirect to the reset-password page
      if (type === 'recovery') {
        const safeRedirect = getSafeRedirect(next, locale)
        return NextResponse.redirect(new URL(safeRedirect, request.url))
      }
      // For other types (signup verification, etc.), go to login
      return NextResponse.redirect(new URL(`/${locale}/login?verified=true`, request.url))
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Use the validated `next` param for post-exchange redirect
      const safeRedirect = getSafeRedirect(next, locale)
      return NextResponse.redirect(new URL(safeRedirect, request.url))
    }
  }

  // Redirect to localized customer login with error state if verification fails
  return NextResponse.redirect(new URL(`/${locale}/login?error=verification_failed`, request.url))
}
