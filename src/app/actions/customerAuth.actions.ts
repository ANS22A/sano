'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const saudiPhoneRegex = /^(\+966|0966|966|0)(5\d{8})$/

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966')) return '+' + digits
  if (digits.startsWith('0966')) return '+' + digits.slice(1)
  if (digits.startsWith('05')) return '+966' + digits.slice(1)
  if (digits.startsWith('5')) return '+966' + digits
  return phone
}

const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name too short').max(100).trim(),
  phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number'),
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function customerSignUp(formData: FormData) {
  const data = {
    fullName: formData.get('fullName')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
  }

  const parsed = RegisterSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' }
  }

  const normalizedPhone = normalizePhone(parsed.data.phone)
  const supabase = await createClient()

  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: normalizedPhone,
      },
    },
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Could not create account.' }
  }

  // 2. Create customer record linked to auth user using server-side admin client
  // When email confirmation is enabled, authData.session is null, so anon RLS blocks insert.
  // Using createAdminClient() strictly on the server creates the customer record safely.
  const supabaseAdmin = createAdminClient()
  const { error: customerError } = await supabaseAdmin.from('customers').insert({
    auth_user_id: authData.user.id,
    full_name: parsed.data.fullName,
    phone: normalizedPhone,
    email: parsed.data.email,
  })

  if (customerError) {
    console.error('Failed to create customer record:', customerError)
  }

  const requiresVerification = !authData.session

  return { success: true, requiresVerification }
}

const LoginSchema = z.object({
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(1, 'Password is required'),
})

export async function customerSignIn(formData: FormData) {
  const email = formData.get('email')?.toString() ?? ''
  const password = formData.get('password')?.toString() ?? ''
  const locale = formData.get('locale')?.toString() || 'ar'

  const parsed = LoginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (
      error.message?.toLowerCase().includes('email not confirmed') ||
      error.code === 'email_not_confirmed'
    ) {
      return {
        error:
          locale === 'ar'
            ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تفقد صندوق الوارد.'
            : 'Please confirm your email address before logging in. Check your inbox.',
      }
    }
    return { error: 'Invalid email or password.' }
  }

  return { success: true }
}

export async function verifyCustomerOtp({
  email,
  token,
  locale = 'ar',
}: {
  email: string
  token: string
  locale?: string
}) {
  const parsed = z
    .object({
      email: z.string().email('Invalid email format').trim(),
      token: z.string().regex(/^\d{8}$/, 'Verification code must be 8 digits'),
    })
    .safeParse({ email, token })

  if (!parsed.success) {
    return {
      error:
        locale === 'ar'
          ? 'يرجى إدخال رمز تحقق صالح مكون من 8 أرقام.'
          : 'Please enter a valid 8-digit verification code.',
    }
  }

  const supabase = await createClient()

  let { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: 'email',
  })

  // Fallback to 'signup' type if 'email' type returned an error
  if (error) {
    const signupAttempt = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: 'signup',
    })
    if (!signupAttempt.error) {
      data = signupAttempt.data
      error = null
    }
  }

  if (error) {
    return {
      error:
        locale === 'ar'
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى.'
          : 'The verification code is invalid or has expired. Please try again.',
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, hasSession: !!data?.session }
}

export async function resendCustomerOtp({
  email,
  locale = 'ar',
}: {
  email: string
  locale?: string
}) {
  const emailParsed = z.string().email().safeParse(email.trim())
  if (!emailParsed.success) {
    return {
      error:
        locale === 'ar'
          ? 'البريد الإلكتروني غير صالح.'
          : 'Invalid email address.',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: emailParsed.data,
  })

  if (error) {
    return {
      error:
        locale === 'ar'
          ? 'تعذر إعادة إرسال الرمز حالياً. يرجى الانتظار قليلاً والمحاولة مجدداً.'
          : 'Could not resend code. Please wait a moment before trying again.',
    }
  }

  return { success: true }
}

export async function customerSignOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
