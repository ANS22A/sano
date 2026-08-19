import { z } from 'zod'

/**
 * SANO LUNA — Booking Form Validation Schema
 *
 * Shared between client-side React Hook Form validation
 * and server-side Server Action validation.
 */
export const bookingSchema = z.object({
  clientName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100),
  clientEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  clientPhone: z
    .string()
    .min(9, { message: 'Please enter a valid phone number' })
    .max(20),
  serviceId: z.string().uuid({ message: 'Please select a service' }).optional(),
  packageId: z.string().uuid({ message: 'Please select a package' }).optional(),
  bookingDate: z.string().min(1, { message: 'Please select a date' }),
  bookingTime: z.string().min(1, { message: 'Please select a time' }),
  notes: z.string().max(500).optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
