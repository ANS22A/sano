import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      // Redirect to localized customer login with verified flag
      return NextResponse.redirect(new URL(`/${locale}/login?verified=true`, request.url))
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to localized customer login with verified flag
      return NextResponse.redirect(new URL(`/${locale}/login?verified=true`, request.url))
    }
  }

  // Redirect to localized customer login with error state if verification fails
  return NextResponse.redirect(new URL(`/${locale}/login?error=verification_failed`, request.url))
}
