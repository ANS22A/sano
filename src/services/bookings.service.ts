/**
 * SANO LUNA — Bookings Data Access Layer (legacy stub)
 *
 * NOTE: Primary booking creation is handled by the server action at
 * src/app/actions/booking.actions.ts which enforces all business rules.
 *
 * This file only contains read helpers for admin/display purposes.
 */
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

export type DbBooking = Tables<'bookings'>

export async function getBookingById(id: string): Promise<DbBooking | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getBookingByNumber(bookingNumber: string): Promise<DbBooking | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_number', bookingNumber)
    .single()

  if (error) return null
  return data
}
