import { z } from 'zod'

/**
 * SANO LUNA — Contact Form Validation Schema
 */
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().max(20).optional(),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(2000),
})

export type ContactFormData = z.infer<typeof contactSchema>
