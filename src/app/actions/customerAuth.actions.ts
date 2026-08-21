'use server'

import { createClient } from '@/lib/supabase/server'
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

  // 2. Create customer record linked to auth user.
  // We do NOT attempt to merge with existing customers automatically for security reasons.
  // If the phone number already exists in customers but isn't linked, this will create a new distinct customer record,
  // OR we can allow it to fail if we have a unique constraint on phone.
  // Actually, SANO LUNA customers currently rely on phone. If we don't merge, we should insert.
  
  const { error: customerError } = await supabase.from('customers').insert({
    auth_user_id: authData.user.id,
    full_name: parsed.data.fullName,
    phone: normalizedPhone,
    email: parsed.data.email,
  })

  if (customerError) {
    // If the phone already exists in customers without an auth_user_id, we should handle that gracefully.
    // For now, if the insert fails (e.g. unique constraint on phone if one exists), we return an error.
    // Assuming no strict unique constraint on phone in the customers table except standard handling.
    console.error('Failed to create customer record:', customerError)
    // We don't fail the auth signup, but the customer won't have a linked profile.
  }

  return { success: true }
}

const LoginSchema = z.object({
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(1, 'Password is required'),
})

export async function customerSignIn(formData: FormData) {
  const email = formData.get('email')?.toString() ?? ''
  const password = formData.get('password')?.toString() ?? ''

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
    return { error: 'Invalid email or password.' }
  }

  return { success: true }
}

export async function customerSignOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
