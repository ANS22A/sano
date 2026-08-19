import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { lang } = await request.json()
  if (!['en', 'ar'].includes(lang)) {
    return NextResponse.json({ error: 'Invalid lang' }, { status: 400 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_lang', lang, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: 'lax',
  })
  return response
}
