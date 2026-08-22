'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

const saudiPhoneRegex = /^(\+966|0966|966|0)(5\d{8})$/

function generateOrderReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let ref = ''
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    ref += chars[bytes[i] % chars.length]
  }
  return `SL-GC-${ref}`
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let part1 = ''
  let part2 = ''
  const bytes = crypto.randomBytes(8)
  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length]
    part2 += chars[bytes[i + 4] % chars.length]
  }
  return `SL-GIFT-${part1}-${part2}`
}

const PurchaseGiftCardSchema = z.object({
  amount: z.coerce.number().min(100, 'Minimum amount is 100 SAR').max(5000, 'Maximum amount is 5,000 SAR'),
  theme: z.enum(['classic-gold', 'rose-plum', 'sandstone', 'emerald']).default('classic-gold'),
  senderName: z.string().min(2, 'Sender name is required').max(100).trim(),
  senderEmail: z.string().email('Valid sender email is required').trim(),
  senderPhone: z.string().regex(saudiPhoneRegex, 'Invalid phone number').optional().or(z.literal('')),
  recipientName: z.string().min(2, 'Recipient name is required').max(100).trim(),
  recipientEmail: z.string().email('Valid recipient email is required').trim(),
  recipientPhone: z.string().regex(saudiPhoneRegex, 'Invalid phone number').optional().or(z.literal('')),
  personalMessage: z.string().max(300, 'Message too long (max 300 characters)').trim().optional(),
  locale: z.enum(['ar', 'en']).default('ar'),
})

export type PurchaseGiftCardResult = {
  success: boolean
  error?: string
  order?: {
    id: string
    orderReference: string
    amount: number
    theme: string
    senderName: string
    senderEmail: string
    recipientName: string
    recipientEmail: string
    personalMessage?: string | null
  }
}

export async function purchaseGiftCard(formData: FormData): Promise<PurchaseGiftCardResult> {
  const rawData = {
    amount: formData.get('amount'),
    theme: formData.get('theme') || 'classic-gold',
    senderName: formData.get('senderName'),
    senderEmail: formData.get('senderEmail'),
    senderPhone: formData.get('senderPhone') || '',
    recipientName: formData.get('recipientName'),
    recipientEmail: formData.get('recipientEmail'),
    recipientPhone: formData.get('recipientPhone') || '',
    personalMessage: formData.get('personalMessage') || '',
    locale: formData.get('locale') || 'ar',
  }

  const parsed = PurchaseGiftCardSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input data',
    }
  }

  const data = parsed.data
  const orderReference = generateOrderReference()
  const code = generateGiftCardCode()
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const supabaseAdmin = createAdminClient()

  // Check if authenticated
  const supabaseUser = await createClient()
  const {
    data: { user: authUser },
  } = await supabaseUser.auth.getUser()

  let customerId: string | null = null
  if (authUser?.id) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .maybeSingle()
    if (customer) customerId = customer.id
  }

  // Insert gift card record with status 'pending_payment'
  const { data: giftCard, error: insertError } = await supabaseAdmin
    .from('gift_cards')
    .insert({
      order_reference: orderReference,
      code,
      initial_amount: data.amount,
      remaining_balance: data.amount,
      currency: 'SAR',
      theme: data.theme,
      sender_name: data.senderName,
      sender_email: data.senderEmail,
      sender_phone: data.senderPhone || null,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      recipient_phone: data.recipientPhone || null,
      personal_message: data.personalMessage || null,
      purchaser_customer_id: customerId,
      purchaser_auth_user_id: authUser?.id ?? null,
      status: 'pending_payment',
      expires_at: expiresAt.toISOString(),
    })
    .select('id, order_reference, initial_amount, theme, sender_name, sender_email, recipient_name, recipient_email, personal_message')
    .single()

  if (insertError || !giftCard) {
    console.error('[purchaseGiftCard] Failed to insert gift card request:', insertError)
    return {
      success: false,
      error:
        data.locale === 'ar'
          ? 'تعذر تسجيل طلب بطاقة الإهداء. يرجى المحاولة مرة أخرى.'
          : 'Could not submit gift card request. Please try again.',
    }
  }

  revalidatePath('/[locale]/gift-cards', 'page')
  revalidatePath('/admin/gift-cards', 'page')

  return {
    success: true,
    order: {
      id: giftCard.id,
      orderReference: giftCard.order_reference,
      amount: Number(giftCard.initial_amount),
      theme: giftCard.theme,
      senderName: giftCard.sender_name,
      senderEmail: giftCard.sender_email,
      recipientName: giftCard.recipient_name,
      recipientEmail: giftCard.recipient_email,
      personalMessage: giftCard.personal_message,
    },
  }
}

export type ValidateGiftCardResult = {
  valid: boolean
  error?: string
  giftCard?: {
    code: string
    remainingBalance: number
    currency: string
    expiresAt: string
    senderName: string
    recipientName: string
  }
}

export async function validateGiftCard(
  code: string,
  locale: string = 'ar'
): Promise<ValidateGiftCardResult> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return {
      valid: false,
      error: locale === 'ar' ? 'يرجى إدخال رمز بطاقة الإهداء.' : 'Please enter a gift card code.',
    }
  }

  const supabaseAdmin = createAdminClient()
  const { data: giftCard, error } = await supabaseAdmin
    .from('gift_cards')
    .select('id, code, remaining_balance, currency, status, expires_at, sender_name, recipient_name')
    .eq('code', cleanCode)
    .maybeSingle()

  if (error || !giftCard) {
    return {
      valid: false,
      error:
        locale === 'ar'
          ? 'رمز بطاقة الإهداء غير صحيح أو غير موجود.'
          : 'Invalid or non-existent gift card code.',
    }
  }

  if (giftCard.status === 'pending_payment') {
    return {
      valid: false,
      error:
        locale === 'ar'
          ? 'هذه البطاقة بانتظار تأكيد الدفع والتفعيل من خدمة العملاء.'
          : 'This gift card is pending payment confirmation and activation.',
    }
  }

  if (giftCard.status !== 'active' || Number(giftCard.remaining_balance) <= 0) {
    return {
      valid: false,
      error:
        locale === 'ar'
          ? 'تم استخدام رصيد بطاقة الإهداء بالكامل أو تم إلغاؤها.'
          : 'This gift card balance has been fully redeemed or cancelled.',
    }
  }

  const isExpired = new Date(giftCard.expires_at).getTime() < Date.now()
  if (isExpired) {
    return {
      valid: false,
      error: locale === 'ar' ? 'بطاقة الإهداء هذه منتهية الصلاحية.' : 'This gift card has expired.',
    }
  }

  return {
    valid: true,
    giftCard: {
      code: giftCard.code,
      remainingBalance: Number(giftCard.remaining_balance),
      currency: giftCard.currency,
      expiresAt: giftCard.expires_at,
      senderName: giftCard.sender_name,
      recipientName: giftCard.recipient_name,
    },
  }
}

export type PublicGiftCardDetails = {
  success: boolean
  error?: string
  giftCard?: {
    code: string
    initialAmount: number
    remainingBalance: number
    theme: string
    senderName: string
    recipientName: string
    personalMessage: string | null
    expiresAt: string
    status: string
  }
}

export async function getPublicGiftCardDetails(
  code: string,
  locale: string = 'ar'
): Promise<PublicGiftCardDetails> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return {
      success: false,
      error: locale === 'ar' ? 'رمز بطاقة الإهداء غير متوفر.' : 'Gift card code is missing.',
    }
  }

  const supabaseAdmin = createAdminClient()
  const { data: giftCard, error } = await supabaseAdmin
    .from('gift_cards')
    .select('id, code, initial_amount, remaining_balance, theme, status, expires_at, sender_name, recipient_name, personal_message')
    .eq('code', cleanCode)
    .maybeSingle()

  if (error || !giftCard) {
    return {
      success: false,
      error:
        locale === 'ar'
          ? 'تعذر العثور على بطاقة الإهداء أو أن الرمز غير صحيح.'
          : 'Could not find gift card or the code is invalid.',
    }
  }

  if (giftCard.status === 'pending_payment') {
    return {
      success: false,
      error:
        locale === 'ar'
          ? 'بطاقة الإهداء هذه غير متاحة للعرض العام بعد (بانتظار الدفع).'
          : 'This gift card is not yet available for public view (pending payment).',
    }
  }

  if (giftCard.status === 'cancelled') {
    return {
      success: false,
      error:
        locale === 'ar'
          ? 'تم إلغاء بطاقة الإهداء هذه.'
          : 'This gift card has been cancelled.',
    }
  }

  const isExpired = new Date(giftCard.expires_at).getTime() < Date.now()
  if (isExpired || giftCard.status === 'expired') {
    return {
      success: false,
      error:
        locale === 'ar'
          ? 'بطاقة الإهداء هذه منتهية الصلاحية.'
          : 'This gift card has expired.',
    }
  }

  return {
    success: true,
    giftCard: {
      code: giftCard.code,
      initialAmount: Number(giftCard.initial_amount),
      remainingBalance: Number(giftCard.remaining_balance),
      theme: giftCard.theme,
      senderName: giftCard.sender_name,
      recipientName: giftCard.recipient_name,
      personalMessage: giftCard.personal_message,
      expiresAt: giftCard.expires_at,
      status: giftCard.status, // Can be 'active' or 'redeemed'
    },
  }
}
