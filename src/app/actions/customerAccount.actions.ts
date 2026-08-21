'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Profile Schema
const saudiPhoneRegex = /^(\+966|0966|966|0)(5\d{8})$/
const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Name too short').max(100).trim(),
  phone: z.string().regex(saudiPhoneRegex, 'Invalid Saudi phone number'),
  email: z.string().email('Invalid email format').trim(),
})

export async function getCustomerProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (customerError && customerError.code === 'PGRST116') {
    // Missing customer record, create a shell record securely
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        auth_user_id: user.id,
        full_name: user.user_metadata?.full_name ?? '',
        email: user.email ?? '',
        phone: user.user_metadata?.phone ?? '',
      })
      .select()
      .single()

    if (insertError || !newCustomer) {
      return { error: 'Failed to create customer profile' }
    }
    return { data: newCustomer }
  } else if (customerError) {
    return { error: 'Failed to fetch customer profile' }
  }

  return { data: customer }
}

export async function updateCustomerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const data = {
    fullName: formData.get('fullName')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
  }

  const parsed = ProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Validation error' }
  }

  // If email is changing, we must trigger Supabase Auth email change
  if (parsed.data.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: parsed.data.email,
    })
    if (authError) {
      return { error: authError.message }
    }
  }

  // Update customer record
  const { error: updateError } = await supabase
    .from('customers')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
    })
    .eq('auth_user_id', user.id)

  if (updateError) {
    return { error: 'Failed to update profile details' }
  }

  revalidatePath('/[locale]/account', 'layout')
  return { success: true }
}

export async function getCustomerBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // RLS will ensure they can only fetch their own bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services(name_en, name_ar, duration_minutes),
      locations(name_en, name_ar, address_en, address_ar)
    `)
    .order('date', { ascending: false })

  if (error) {
    return { error: 'Failed to fetch bookings' }
  }

  return { data: bookings }
}

export async function getCustomerBookingById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services(name_en, name_ar, duration_minutes),
      locations(name_en, name_ar, address_en, address_ar)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: 'Booking not found' }
  }

  return { data: booking }
}

export async function resetPasswordForEmail(formData: FormData) {
  const email = formData.get('email')?.toString() ?? ''
  if (!email) return { error: 'Email is required' }

  const supabase = await createClient()
  
  // Create an absolute URL for redirect
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/en/reset-password`, // Assuming middleware handles locale
  })

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''
  if (password.length < 8) return { error: 'Password must be at least 8 characters' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}
