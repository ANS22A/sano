'use server'

import { requireRole, writeAuditLog } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendGiftCardEmail } from '@/lib/notifications/email.service'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

const PAGE_SIZE = 20

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

function generateOrderReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let ref = ''
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    ref += chars[bytes[i] % chars.length]
  }
  return `SL-GC-${ref}`
}

export async function getAdminGiftCards(params: {
  page?: number
  q?: string
  status?: string
}) {
  await requireRole('manager')
  const supabase = createAdminClient()
  const page = params.page ?? 1
  const from = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('gift_cards')
    .select('*, gift_card_redemptions(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (params.q) {
    query = query.or(
      `code.ilike.%${params.q}%,order_reference.ilike.%${params.q}%,recipient_name.ilike.%${params.q}%,recipient_email.ilike.%${params.q}%,sender_name.ilike.%${params.q}%,sender_email.ilike.%${params.q}%`
    )
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data, count, error } = await query
  if (error) {
    console.error('[getAdminGiftCards] Error:', error)
  }

  return { giftCards: data ?? [], total: count ?? 0 }
}

export async function getAdminGiftCardStats() {
  await requireRole('manager')
  const supabase = createAdminClient()

  const { data: cards, error } = await supabase
    .from('gift_cards')
    .select('initial_amount, remaining_balance, status')

  if (error || !cards) {
    return {
      totalCards: 0,
      totalIssued: 0,
      activeBalance: 0,
      totalRedeemed: 0,
      activeCount: 0,
      pendingPaymentCount: 0,
    }
  }

  let totalIssued = 0
  let activeBalance = 0
  let totalRedeemed = 0
  let activeCount = 0
  let pendingPaymentCount = 0

  for (const c of cards) {
    const initial = Number(c.initial_amount) || 0
    const remaining = Number(c.remaining_balance) || 0

    if (c.status === 'pending_payment') {
      pendingPaymentCount++
    } else if (c.status === 'active') {
      totalIssued += initial
      activeBalance += remaining
      activeCount++
      totalRedeemed += Math.max(0, initial - remaining)
    } else if (c.status === 'redeemed') {
      totalIssued += initial
      totalRedeemed += initial
    }
  }

  return {
    totalCards: cards.length,
    totalIssued,
    activeBalance,
    totalRedeemed,
    activeCount,
    pendingPaymentCount,
  }
}

/**
 * Confirm WhatsApp payment & activate Gift Card
 * Sends final branded gift voucher email to recipient and buyer
 */
export async function confirmAndActivateGiftCard(id: string, locale: 'ar' | 'en' = 'ar') {
  const session = await requireRole('admin')
  const supabase = createAdminClient()

  const { data: giftCard, error: fetchError } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !giftCard) {
    return { error: 'Gift card not found.' }
  }

  if (giftCard.status === 'active') {
    return { error: 'This gift card is already active.' }
  }

  const { error: updateError } = await supabase
    .from('gift_cards')
    .update({
      status: 'active',
      payment_confirmed_at: new Date().toISOString(),
      payment_confirmed_by: session.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Send branded digital delivery email
  await sendGiftCardEmail({
    code: giftCard.code,
    amount: Number(giftCard.initial_amount),
    recipientName: giftCard.recipient_name,
    recipientEmail: giftCard.recipient_email,
    senderName: giftCard.sender_name,
    senderEmail: giftCard.sender_email,
    personalMessage: giftCard.personal_message,
    expiresAt: giftCard.expires_at,
    locale,
  }).catch((err) => console.error('[confirmAndActivateGiftCard] Email dispatch failed:', err))

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'gift_card.payment_confirmed_activated',
    entityType: 'gift_card',
    entityId: id,
    metadata: {
      orderReference: giftCard.order_reference,
      code: giftCard.code,
      amount: giftCard.initial_amount,
      recipientEmail: giftCard.recipient_email,
    },
  })

  revalidatePath('/admin/gift-cards')
  revalidatePath('/[locale]/gift-cards', 'page')

  return { success: true }
}

const CreateAdminCardSchema = z.object({
  amount: z.coerce.number().min(50).max(10000),
  customCode: z.string().max(30).trim().optional(),
  recipientName: z.string().min(2).max(100).trim(),
  recipientEmail: z.string().email().trim(),
  senderName: z.string().min(2).max(100).trim().default('SANO LUNA'),
  personalMessage: z.string().max(300).trim().optional(),
  notes: z.string().max(300).trim().optional(),
})

export async function createAdminComplimentaryGiftCard(formData: FormData) {
  const session = await requireRole('admin')

  const parsed = CreateAdminCardSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid form data' }
  }

  const data = parsed.data
  let code = data.customCode?.toUpperCase()
  if (!code) {
    code = generateGiftCardCode()
  }

  const orderReference = generateOrderReference()
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const supabase = createAdminClient()
  const { data: newCard, error } = await supabase
    .from('gift_cards')
    .insert({
      order_reference: orderReference,
      code,
      initial_amount: data.amount,
      remaining_balance: data.amount,
      currency: 'SAR',
      theme: 'classic-gold',
      sender_name: data.senderName,
      sender_email: 'concierge@sanoluna.com',
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      personal_message: data.personalMessage || 'Complimentary luxury gift card from SANO LUNA',
      status: 'active',
      payment_confirmed_at: new Date().toISOString(),
      payment_confirmed_by: session.userId,
      expires_at: expiresAt.toISOString(),
    })
    .select('*')
    .single()

  if (error || !newCard) {
    if (error?.code === '23505') {
      return { error: 'A gift card with this code already exists.' }
    }
    return { error: error?.message ?? 'Failed to create gift card.' }
  }

  // Send branded email
  await sendGiftCardEmail({
    code: newCard.code,
    amount: Number(newCard.initial_amount),
    recipientName: newCard.recipient_name,
    recipientEmail: newCard.recipient_email,
    senderName: newCard.sender_name,
    senderEmail: newCard.sender_email,
    personalMessage: newCard.personal_message,
    expiresAt: newCard.expires_at,
    locale: 'ar',
  }).catch((err) => console.error('[createAdminComplimentaryGiftCard] Email dispatch failed:', err))

  await writeAuditLog({
    adminUserId: session.userId,
    action: 'gift_card.issued_complimentary',
    entityType: 'gift_card',
    entityId: newCard.id,
    metadata: {
      orderReference,
      code,
      amount: data.amount,
      recipientEmail: data.recipientEmail,
      notes: data.notes,
    },
  })

  revalidatePath('/admin/gift-cards')
  return { success: true }
}

export async function updateGiftCardStatus(id: string, status: 'active' | 'cancelled') {
  const session = await requireRole('admin')
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('gift_cards')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await writeAuditLog({
    adminUserId: session.userId,
    action: status === 'cancelled' ? 'gift_card.cancelled' : 'gift_card.reactivated',
    entityType: 'gift_card',
    entityId: id,
    metadata: { newStatus: status },
  })

  revalidatePath('/admin/gift-cards')
  return { success: true }
}
